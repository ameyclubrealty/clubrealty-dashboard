"use client"

import { useEffect, useState } from "react"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Plus, RefreshCw, Filter, MoreHorizontal } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Spinner } from "@/components/ui/spinner"
import { PropertyCard } from "@/components/property-card"
import { PropertyStats } from "@/components/property-stats"
import { PropertyEmptyState } from "@/components/property-empty-state"
import { PropertyFilters } from "@/components/property-filters" // Changed to named import
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Direct Firebase imports
import { db } from "@/lib/firebase/config"
import { collection, getDocs, Timestamp, doc, updateDoc } from "firebase/firestore"
import { DateRange } from "react-day-picker"
import { Popover, PopoverTrigger } from "@radix-ui/react-popover"
import { PopoverContent } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"

type Property = {
  id: string
  [key: string]: any
}

export default function PropertiesDashboardPage() {
  const [properties, setProperties] = useState<Property[]>([])
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeFilters, setActiveFilters] = useState<PropertyFilters | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [newListingIntent, setNewListingIntent] = useState("")
  const { toast } = useToast()

  // Simplified function to directly fetch properties from Firebase
  const loadProperties = async (showToast = false) => {
    try {
      setIsRefreshing(true)
      setError(null)

      const propertiesCollection = collection(db, "properties")
      const snapshot = await getDocs(propertiesCollection)

      if (snapshot.empty) {
        setProperties([])
        setFilteredProperties([])
      } else {
        // Process the properties data
        const propertiesData = snapshot.docs.map((doc) => {
          const data = doc.data()

          // Convert Firestore timestamps to dates
          const processed = { ...data }
          Object.keys(processed).forEach((key) => {
            if (processed[key] instanceof Timestamp) {
              processed[key] = processed[key].toDate()
            }
          })

          return {
            id: doc.id,
            ...processed,
          }
        })

        setProperties(propertiesData)

        // Apply any active filters and search query
        const filtered = applyFiltersAndSearch(propertiesData, activeFilters, searchQuery)
        setFilteredProperties(filtered)

        if (showToast) {
          toast({
            title: "Properties refreshed",
            description: `Loaded ${propertiesData.length} properties from database`,
          })
        }
      }
    } catch (err) {
      console.error("Error directly fetching properties:", err)
      const errorMessage = typeof err === "object" && err !== null && "message" in err ? (err as { message: string }).message : "Failed to load properties from database"
      setError(errorMessage)
      toast({
        title: "Error loading properties",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    loadProperties()
  }, [])

  const handleRefresh = () => {
    loadProperties(true)
  }

  interface HandlePropertyDeleted {
    (deletedId: string): void
  }

  const handlePropertyDeleted: HandlePropertyDeleted = (deletedId) => {
    const updatedProperties = properties.filter((property) => property.id !== deletedId)
    setProperties(updatedProperties)

    // Apply any active filters and search query to the updated properties
    const filtered = applyFiltersAndSearch(updatedProperties, activeFilters, searchQuery)
    setFilteredProperties(filtered)
  }

  interface SearchEvent extends React.ChangeEvent<HTMLInputElement> { }

  const handleSearch = (e: SearchEvent) => {
    const query = e.target.value.toLowerCase()
    setSearchQuery(query)

    // Apply the updated search query along with any active filters
    const filtered = applyFiltersAndSearch(properties, activeFilters, query)
    setFilteredProperties(filtered)
  }

  // Function to apply both filters and search query
  interface PropertyFilters {
    status?: string
    propertyType?: string
    listingIntent?: string
    minPrice?: number
    maxPrice?: number
    bedrooms?: string
    bathrooms?: string
    [key: string]: any
    publishedBy: string
    startDate?: string;  
    endDate?: string;
  }

  // Date range state at component level
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: activeFilters?.startDate ? new Date(activeFilters.startDate) : undefined,
    to: activeFilters?.endDate ? new Date(activeFilters.endDate) : undefined,
  });

  // When date range is selected, update filter
  useEffect(() => {
    handleFilterChange({
      ...activeFilters,
      startDate: dateRange?.from?.toISOString().split("T")[0] || "",
      endDate: dateRange?.to?.toISOString().split("T")[0] || "",
    } as PropertyFilters)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateRange]);

  const applyFiltersAndSearch = (
    properties: Property[],
    filters: PropertyFilters | null,
    query: string,
  ): Property[] => {
    let result = [...properties]

    // Apply search query if it exists
    if (query) {
      result = result.filter(
        (property) =>
          (property.title || "").toLowerCase().includes(query) ||
          (property.additionalInfo || "").toLowerCase().includes(query) ||
          (property.address || "").toLowerCase().includes(query) ||
          (property.city || "").toLowerCase().includes(query) ||
          (property.publishedBy || "").toLowerCase().includes(query) // 🔽 Add this line
      )
    }

    // Filter by date range (assuming property.createdAt is in ISO format)
    if (filters && (filters.startDate || filters.endDate)) {
      result = result.filter((property) => {
        const propertyDate = new Date(property.createdAt || property.date).getTime();

        const start = filters.startDate ? new Date(filters.startDate).getTime() : null;
        const end = filters.endDate ? new Date(filters.endDate).getTime() : null;

        return (!start || propertyDate >= start) && (!end || propertyDate <= end);
      });
    }

    if (filters && filters.exactDate) {
      result = result.filter((property) => {
        return property.createdAt?.slice(0, 10) === filters.exactDate;
      });
    }

    // Apply filters if they exist
    if (filters) {
      // Filter by status
      if (filters.status && filters.status !== "any") {
        result = result.filter((property) => (property.status || "").toLowerCase() === filters.status!.toLowerCase())
      }

      // Filter by property type
      if (filters.propertyType && filters.propertyType !== "any") {
        result = result.filter(
          (property) => (property.propertyType || "").toLowerCase() === filters.propertyType!.toLowerCase(),
        )
      }

      // Filter by listing intent
      if (filters.listingIntent && filters.listingIntent !== "any") {
        result = result.filter(
          (property) => (property.listingIntent || "").toLowerCase() === filters.listingIntent!.toLowerCase(),
        )
      }

      // Filter by price range
      if (filters.minPrice !== undefined && filters.maxPrice !== undefined) {
        result = result.filter((property) => {
          const price = Number(property.price || 0)
          return price >= filters.minPrice! && price <= filters.maxPrice!
        })
      }

      // 🔽 Add this block
      if (filters.publishedBy && filters.publishedBy.trim() !== "") {
        result = result.filter(
          (property) =>
            (property.publishedBy || "").toLowerCase().includes(filters.publishedBy.toLowerCase())
        )
      }

      // Filter by bedrooms
      if (filters.bedrooms && filters.bedrooms !== "any") {
        const bedroomsValue = Number(filters.bedrooms)
        result = result.filter((property) => {
          const bedrooms = Number(property.bedrooms || 0)
          return bedrooms >= bedroomsValue
        })
      }

      // Filter by bathrooms
      if (filters.bathrooms && filters.bathrooms !== "any") {
        const bathroomsValue = Number(filters.bathrooms)
        result = result.filter((property) => {
          const bathrooms = Number(property.bathrooms || 0)
          return bathrooms >= bathroomsValue
        })
      }
    }

    return result
  }

  const handleFilterChange = (filters: PropertyFilters) => {
    // Log the filters to see what's being passed
    console.log("Applying filters:", filters)

    setActiveFilters(filters)

    // Apply the new filters along with any existing search query
    const filtered = applyFiltersAndSearch(properties, filters, searchQuery)

    // Log the filtered results
    console.log(`Filtered from ${properties.length} to ${filtered.length} properties`)

    setFilteredProperties(filtered)

    // Close the filter dialog
    setIsFilterDialogOpen(false)

    // Show a toast with the filter results
    toast({
      title: "Filters applied",
      description: `Showing ${filtered.length} of ${properties.length} properties`,
    })
  }

  // Format listing intent for display
  const formatListingIntent = (intent: string) => {
    if (!intent) return "For Sale"

    switch (intent.toLowerCase()) {
      case "sell":
        return "For Sale"
      case "rent":
        return "For Rent"
      case "lease":
        return "For Lease"
      case "new project":
        return "New Project"
      default:
        return intent.charAt(0).toUpperCase() + intent.slice(1)
    }
  }

  // Get listing intent badge color
  const getListingIntentColor = (intent: string) => {
    if (!intent) return "bg-primary text-primary-foreground"

    switch (intent.toLowerCase()) {
      case "sell":
        return "bg-blue-600 text-white"
      case "rent":
        return "bg-purple-600 text-white"
      case "lease":
        return "bg-amber-600 text-white"
      case "new project":
        return "bg-emerald-600 text-white"
      default:
        return "bg-primary text-primary-foreground"
    }
  }

  // Function to open the edit dialog for a property
  const openEditDialog = (property: Property) => {
    setSelectedProperty(property)
    setNewListingIntent(property.listingIntent || "sell")
    setIsEditDialogOpen(true)
  }

  // Function to update a property's listing intent
  const updatePropertyListingIntent = async () => {
    if (!selectedProperty || !selectedProperty.id) return

    setIsUpdating(true)
    try {
      const propertyRef = doc(db, "properties", selectedProperty.id)
      await updateDoc(propertyRef, {
        listingIntent: newListingIntent,
        updatedAt: new Date(),
      })

      // Update local state
      const updatedProperties = properties.map((property) => {
        if (property.id === selectedProperty.id) {
          return { ...property, listingIntent: newListingIntent }
        }
        return property
      })

      setProperties(updatedProperties)

      // Apply any active filters and search query to the updated properties
      const filtered = applyFiltersAndSearch(updatedProperties, activeFilters, searchQuery)
      setFilteredProperties(filtered)

      toast({
        title: "Property updated",
        description: `Listing intent changed to ${formatListingIntent(newListingIntent)}`,
      })

      setIsEditDialogOpen(false)
    } catch (error: any) {
      console.error("Error updating property:", error)
      toast({
        title: "Error updating property",
        description: error?.message || "Failed to update property",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const formatIndianCompactCurrency = (price) => {
    const numericPrice =
      typeof price === "string" ? parseFloat(price) : price;

    if (numericPrice === undefined || numericPrice === null || isNaN(numericPrice)) {
      return "₹ --";
    }

    if (numericPrice >= 1e7) {
      return `₹ ${(numericPrice / 1e7).toFixed(2).replace(/\.00$/, "")}Cr`;
    }

    if (numericPrice >= 1e5) {
      return `₹ ${(numericPrice / 1e5).toFixed(2).replace(/\.00$/, "")}L`;
    }

    return `₹ ${numericPrice.toLocaleString("en-IN")}`;
  };

  return (
    <div className="flex-1 space-y-6 p-6 md:p-8">
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Properties</h2>
          <p className="text-muted-foreground mt-1">Manage and track your property listings</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={handleRefresh} disabled={isRefreshing} className="flex items-center gap-2">
            {isRefreshing ? <Spinner size="sm" /> : <RefreshCw className="h-4 w-4" />}
            Refresh
          </Button>
          <Link href="/dashboard/properties/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Property
            </Button>
          </Link>
        </div>
      </div>

      {properties.length > 0 && <PropertyStats properties={properties} />}

      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:space-y-0 md:space-x-4">
        <div className="flex flex-row items-end gap-4 w-full">
          {/* Search Input */}
          <div className="flex-1">
            <Input
              type="search"
              placeholder="Search properties..."
              value={searchQuery}
              onChange={handleSearch}
              className="w-full"
            />
          </div>

          {/* Date Range Picker */}
          <div className="flex flex-col">
            
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-[250px] justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange?.from ? (
                    dateRange.to ? (
                      `${format(dateRange.from, "dd MMM yyyy")} - ${format(dateRange.to, "dd MMM yyyy")}`
                    ) : (
                      format(dateRange.from, "dd MMM yyyy")
                    )
                  ) : (
                    <span>Select date range</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  selected={dateRange}
                  onSelect={setDateRange}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Replace Sheet with Dialog */}
        <Dialog open={isFilterDialogOpen} onOpenChange={setIsFilterDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filters
              {activeFilters && (
                <Badge variant="secondary" className="ml-2">
                  Active
                </Badge>
              )}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Filter Properties</DialogTitle>
              <DialogDescription>Apply filters to narrow down your property listings.</DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <PropertyFilters onFilterChange={handleFilterChange} />
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md">
          <p className="font-medium">Error loading properties:</p>
          <p>{error}</p>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : filteredProperties.length === 0 ? (
        <PropertyEmptyState filtered={searchQuery.length > 0 || activeFilters !== null} onRefresh={handleRefresh} />
      ) : (
        <Tabs defaultValue="grid" className="w-full">
          <div className="flex justify-between items-center mb-4">
            <TabsList>
              <TabsTrigger value="grid">Grid</TabsTrigger>
              <TabsTrigger value="list">List</TabsTrigger>
            </TabsList>
            <p className="text-sm text-muted-foreground">
              Showing {filteredProperties.length} of {properties.length} properties
            </p>
          </div>
          {/* Grid */}
          <TabsContent value="grid" className="mt-0">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredProperties.map((property) => (
                <PropertyCard key={property.id} property={property} onDelete={handlePropertyDeleted} />
              ))}
            </div>
          </TabsContent>
          {/* List */}
          <TabsContent value="list" className="mt-0">
            <div className="rounded-md border">
              <div className="grid grid-cols-1 divide-y">
                {filteredProperties.map((property) => (
                  <div key={property.id} className="p-4 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="h-12 w-12 rounded-md bg-muted overflow-hidden">
                        <img
                          src={property.images?.[0] || "/placeholder.svg?height=48&width=48&query=property"}
                          alt={property.title || "Property"}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div>
                        <h3 className="font-medium">
                          {property.title || property.additionalInfo || "Untitled Property"}
                        </h3>
                        <div className="flex flex-wrap gap-2 mt-1">
                          <p className="text-sm text-muted-foreground">
                            {property.address || property.city || "No location"}
                          </p>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <span className="mx-1">•</span>
                            <span>{property.unitTypes.map(unit => unit.type) || "N/A"}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="text-right flex flex-col items-end gap-2">
                        <p className="font-medium">
                          {formatIndianCompactCurrency(property.startingPrice)}
                        </p>
                        <div>
                          {/* Only Listing Intent Badge */}
                          <Badge className={`${getListingIntentColor(property.listingIntent)}`}>
                            {formatListingIntent(property.listingIntent)}
                          </Badge>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4 " />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/dashboard/properties/${property.id}`}>View</Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/dashboard/properties/${property.id}/edit`}>Edit</Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openEditDialog(property)}>
                            Change Listing Intent
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handlePropertyDeleted(property.id)}
                            className="text-destructive focus:text-destructive"
                          >
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      )}

      {/* Dialog for editing listing intent */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Listing Intent</DialogTitle>
            <DialogDescription>
              Update the listing intent for{" "}
              {(selectedProperty as Property | null)?.title || (selectedProperty as Property | null)?.additionalInfo || "this property"}.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="listing-intent" className="text-right">
                Listing Intent
              </Label>
              <Select
                value={newListingIntent}
                onValueChange={setNewListingIntent}
                disabled={isUpdating}
              >
                <SelectTrigger id="listing-intent">
                  <SelectValue placeholder="Select listing intent" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sell">For Sale</SelectItem>
                  <SelectItem value="rent">For Rent</SelectItem>
                  <SelectItem value="lease">For Lease</SelectItem>
                  <SelectItem value="new project">New Project</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} disabled={isUpdating}>
              Cancel
            </Button>
            <Button onClick={updatePropertyListingIntent} disabled={isUpdating}>
              {isUpdating ? (
                <>
                  <Spinner size="sm" className="mr-2" />
                  Updating...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
