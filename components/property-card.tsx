"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { deleteProperty } from "@/lib/firebase/properties"
import { useToast } from "@/hooks/use-toast"
import { Spinner } from "@/components/ui/spinner"
import { Bed, Bath, SquareIcon as SquareFoot, MapPin, MoreHorizontal, Pencil, Trash, Eye } from "lucide-react"

// Add Property type for prop typing
interface Property {
  id: string;
  [key: string]: any;
}

export function PropertyCard({ property, onDelete }: { property: Property; onDelete?: any }) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const { toast } = useToast()

  // Handle null or undefined property
  if (!property) {
    return null
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      console.log("Attempting to delete property with ID:", property.id)
      const result = await deleteProperty(property.id)

      if (result.success) {
        console.log("Property deleted successfully with ID:", property.id)
        toast({
          title: "Property deleted",
          description: "The property has been successfully deleted",
        })

        if (onDelete) {
          onDelete(property.id)
        }
      } else {
        console.error("Error from deleteProperty function:", result.error)
        toast({
          title: "Error deleting property",
          description: result.error || "Failed to delete property",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error in handleDelete:", error)
      toast({
        title: "Error deleting property",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setIsDeleteDialogOpen(false)
    }
  }

  // The formatPrice function already uses rupee symbol, but let's ensure it's consistent
const formatPrice = (price) => {
  const numericPrice = typeof price === "string" ? Number.parseFloat(price) : price;

  if (numericPrice === undefined || numericPrice === null || isNaN(numericPrice)) {
    return "₹ --";
  }

  if (numericPrice >= 10000000) {
    return `₹ ${(numericPrice / 10000000).toFixed(2).replace(/\.00$/, "")}Cr`;
  }

  if (numericPrice >= 100000) {
    return `₹ ${(numericPrice / 100000).toFixed(2).replace(/\.00$/, "")}L`;
  }

  return `₹ ${numericPrice.toLocaleString("en-IN")}`;
};

  // Get listing intent badge color
  const getListingIntentColor = (intent) => {
    if (!intent) return "bg-primary text-primary-foreground hover:bg-primary"

    switch (intent.toLowerCase()) {
      case "sell":
        return "bg-blue-600 text-white hover:bg-blue-700"
      case "rent":
        return "bg-purple-600 text-white hover:bg-purple-700"
      case "lease":
        return "bg-amber-600 text-white hover:bg-amber-700"
      case "new project":
        return "bg-emerald-600 text-white hover:bg-emerald-700"
      default:
        return "bg-primary text-primary-foreground hover:bg-primary"
    }
  }

  // Get a title for the property
  const propertyTitle = property.title || property.additionalInfo || `Property ${property.id?.slice(0, 6)}`

  // Get location info
  const locationInfo = property.address || property.location || property.city || "No location"

  // Get property details
  // const bedrooms = property.bedrooms || 0
  // const bathrooms = property.bathrooms || 0
  // const landArea = property.landArea || property.size || property.area || "N/A"
  const listingIntent = property.listingIntent || "sell"

  // Format the price
  // const formattedPrice = formatPrice(property.price);

  // Format listing intent for display
  const formatListingIntent = (intent) => {
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

  // Check if this is the specific property we want to highlight
  const isTargetProperty = propertyTitle === "Fully Furnished 1 BHK With Balcony, Dry Areas & Modular Kitchen Available"

  // Debug price
  console.log(`Property ${property.id} price:`, property.price, "Formatted:", formatPrice)

  return (
    <>
      <Card
        className={`overflow-hidden h-full flex flex-col transition-all hover:shadow-md ${
          isTargetProperty ? "ring-2 ring-purple-500" : ""
        }`}
      >
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          <img
            src={property.images?.[0] || "/placeholder.svg?height=300&width=400&query=modern+house"}
            alt={propertyTitle}
            className="object-cover w-full h-full transition-transform hover:scale-105"
          />

          {/* Prominent listing intent badge at the top left */}
          <Badge
            className={`absolute top-2 left-2 ${getListingIntentColor(listingIntent)} px-3 py-1 text-xs font-medium`}
          >
            {formatListingIntent(listingIntent)}
          </Badge>

          {/* Recent property badge at the top center */}
          {property.showInRecent && typeof property.recentOrder === 'number' && property.recentOrder >= 1 && property.recentOrder <= 4 && (
            <Badge className="absolute top-2 left-1/2 -translate-x-1/2 bg-[#f58626] text-white px-4 py-1 text-xs font-semibold shadow-none z-10">
              Recent #{property.recentOrder}
            </Badge>
          )}

          {/* Price badge at top right */}
          <Badge className="absolute top-2 right-2 bg-white text-black px-3 py-1 text-xs font-medium shadow-sm">
            {/* {formattedPrice} */}
            {formatPrice(property.startingPrice)}
          </Badge>

            <Badge className="absolute bottom-2 left-2 bg-white text-black px-3 py-1 text-xs font-medium shadow-sm">
            {/* Published BY */}
            {property.publishedBy ? property.publishedBy : 'Admin'}
          </Badge>

          {/* Actions dropdown at bottom right */}
          <div className="absolute bottom-2 right-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="secondary" size="icon" className="h-6 w-8 bg-white/90 hover:bg-white">
                  <MoreHorizontal className="h-4 w-4 text-black" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem asChild>
                  <Link href={`/dashboard/properties/${property.id}`} className="flex items-center cursor-pointer">
                    <Eye className="mr-2 h-4 w-4" />
                    View
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={`/dashboard/properties/${property.id}/edit`} className="flex items-center cursor-pointer">
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setIsDeleteDialogOpen(true)}
                  className="text-destructive focus:text-destructive flex items-center cursor-pointer"
                >
                  <Trash className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <CardContent className="flex-1 p-4">
          <div className="mb-2">
            <h3 className="font-semibold text-lg line-clamp-1">
              <Link href={`/dashboard/properties/${property.id}`} className="hover:underline">
                {propertyTitle}
              </Link>
            </h3>
            <div className="flex items-center text-muted-foreground text-sm mt-1">
              <MapPin className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
              <span className="truncate">{locationInfo}</span>
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-2">
            {/* Always show "Starting Price" section */}
            <div>
              <span className="text-sm text-muted-foreground">Starting Price</span>
              <div className="text-xl font-bold text-primary">{formatPrice(property.startingPrice)}</div>
            </div>

            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center">
                <Bed className="h-4 w-4 mr-1 text-muted-foreground" />
                <span className="font-medium">{property.unitTypes.map(unit => unit.bedrooms)} Beds</span>
              </div>
              <div className="flex items-center">
                <Bath className="h-4 w-4 mr-1 text-muted-foreground" />
                <span className="font-medium">{property.unitTypes.map(unit => unit.bathrooms)} Baths</span>
              </div>
              <div className="flex items-center">
                <SquareFoot className="h-4 w-4 mr-1 text-muted-foreground" />
                <span className="font-medium">{property.unitTypes.map(unit => unit.type)}</span>
              </div>
            </div>

            {property.propertyType && <div className="text-sm text-muted-foreground mt-1">{property.propertyType}</div>}
          </div>
        </CardContent>

        <CardFooter className="px-4 py-3 border-t bg-muted/30">
          <div className="w-full flex justify-between items-center">
            <div className="text-sm text-muted-foreground">ID: {property.id?.slice(0, 6)}...</div>
            <div className="text-sm">
              {property.createdAt ? new Date(property.createdAt).toLocaleDateString() : "No date"}
            </div>
          </div>
        </CardFooter>
      </Card>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the property and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Spinner size="sm" className="mr-2" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
