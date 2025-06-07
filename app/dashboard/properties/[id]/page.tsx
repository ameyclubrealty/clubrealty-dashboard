"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { getProperty, deleteProperty } from "@/lib/firebase/properties"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Spinner } from "@/components/ui/spinner"
import { useToast } from "@/hooks/use-toast"
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
import { ArrowLeft, Edit, Trash, MapPin, FileText, CheckCircle, Video, ExternalLink } from "lucide-react"

export default function PropertyViewPage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const [property, setProperty] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const fetchProperty = async () => {
      if (!params.id) return

      try {
        setIsLoading(true)
        const result = await getProperty(params.id)

        if (result.success) {
          setProperty(result.property)
        } else {
          setError(result.error || "Failed to load property")
          toast({
            title: "Error",
            description: result.error || "Failed to load property",
            variant: "destructive",
          })
        }
      } catch (err) {
        console.error("Error fetching property:", err)
        setError(err.message || "An unexpected error occurred")
        toast({
          title: "Error",
          description: err.message || "An unexpected error occurred",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchProperty()
  }, [params.id, toast])

  const handleDelete = async () => {
    if (!property?.id) return

    setIsDeleting(true)
    try {
      const result = await deleteProperty(property.id)

      if (result.success) {
        toast({
          title: "Property deleted",
          description: "The property has been successfully deleted",
        })
        router.push("/dashboard/properties/dashboard")
      } else {
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

  // Format price with commas and currency symbol
  const formatPrice = (price) => {
    if (price === undefined || price === null) return "Price not set"

    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price)
  }

  // Get listing intent badge color
  const getListingIntentColor = (intent) => {
    if (!intent) return "bg-primary text-primary-foreground"

    switch (intent?.toLowerCase()) {
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

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="text-center">
          <Spinner size="lg" className="mx-auto" />
          <p className="mt-4 text-muted-foreground">Loading property details...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex-1 p-6">
        <div className="mb-6">
          <Button variant="outline" onClick={() => router.back()} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <h2 className="text-xl font-semibold text-destructive mb-2">Error Loading Property</h2>
              <p className="text-muted-foreground mb-6">{error}</p>
              <Button onClick={() => router.push("/dashboard/properties/dashboard")}>Return to Dashboard</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!property) {
    return (
      <div className="flex-1 p-6">
        <div className="mb-6">
          <Button variant="outline" onClick={() => router.back()} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <h2 className="text-xl font-semibold mb-2">Property Not Found</h2>
              <p className="text-muted-foreground mb-6">The requested property could not be found.</p>
              <Button onClick={() => router.push("/dashboard/properties/dashboard")}>Return to Dashboard</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-6 p-6 md:p-8">
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => router.back()} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">Property Details</h1>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" asChild>
            <Link href={`/dashboard/properties/${property.id}/edit`} className="flex items-center gap-2">
              <Edit className="h-4 w-4" /> Edit Property
            </Link>
          </Button>
          <Button variant="destructive" onClick={() => setIsDeleteDialogOpen(true)} className="flex items-center gap-2">
            <Trash className="h-4 w-4" /> Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div>
                  <CardTitle className="text-2xl">{property.title || "Untitled Property"}</CardTitle>
                  <CardDescription className="flex items-center mt-1">
                    <MapPin className="h-4 w-4 mr-1" />
                    {property.address || "No address provided"}
                  </CardDescription>
                </div>
                <div className="flex flex-col items-start md:items-end gap-2">
                  <div className="text-2xl font-bold text-primary">
                    {formatPrice(property.price || property.startingPrice)}
                  </div>
                  <Badge className={`${getListingIntentColor(property.listingIntent)}`}>
                    {formatListingIntent(property.listingIntent)}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <Separator />
            <CardContent className="pt-6">
              <Tabs defaultValue="details">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="features">Features</TabsTrigger>
                  <TabsTrigger value="location">Location</TabsTrigger>
                  <TabsTrigger value="media">Media</TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="pt-4 space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Description</h3>
                    <p className="text-muted-foreground whitespace-pre-line">
                      {property.description || "No description provided."}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Property Information</h3>
                      <dl className="space-y-2">
                        <div className="flex justify-between">
                          <dt className="text-muted-foreground">Type</dt>
                          <dd className="font-medium">{property.propertyType || "Not specified"}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-muted-foreground">Subtype</dt>
                          <dd className="font-medium">{property.propertySubtype || "Not specified"}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-muted-foreground">Purpose</dt>
                          <dd className="font-medium">{property.purpose || "Not specified"}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-muted-foreground">Status</dt>
                          <dd className="font-medium">{property.status || "Not specified"}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-muted-foreground">Land Area</dt>
                          <dd className="font-medium">{property.landArea || "Not specified"}</dd>
                        </div>
                      </dl>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-3">Building Details</h3>
                      <dl className="space-y-2">
                        <div className="flex justify-between">
                          <dt className="text-muted-foreground">Floors</dt>
                          <dd className="font-medium">{property.floors || "0"}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-muted-foreground">Towers</dt>
                          <dd className="font-medium">{property.towers || "0"}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-muted-foreground">Wings</dt>
                          <dd className="font-medium">{property.wings || "0"}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-muted-foreground">Basements</dt>
                          <dd className="font-medium">{property.basements || "0"}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-muted-foreground">Podium Levels</dt>
                          <dd className="font-medium">{property.podiumLevels || "0"}</dd>
                        </div>
                      </dl>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-3">Project Information</h3>
                    <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <dt className="text-sm text-muted-foreground">Project Name</dt>
                        <dd className="font-medium">{property.projectName || "Not specified"}</dd>
                      </div>
                      <div>
                        <dt className="text-sm text-muted-foreground">Developer</dt>
                        <dd className="font-medium">{property.developer || "Not specified"}</dd>
                      </div>
                      <div>
                        <dt className="text-sm text-muted-foreground">Client</dt>
                        <dd className="font-medium">{property.client || "Not specified"}</dd>
                      </div>
                      <div>
                        <dt className="text-sm text-muted-foreground">Construction Technology</dt>
                        <dd className="font-medium">{property.constructionTechnology || "Not specified"}</dd>
                      </div>
                      <div>
                        <dt className="text-sm text-muted-foreground">Builder Date</dt>
                        <dd className="font-medium">{property.builderDate || "Not specified"}</dd>
                      </div>
                      <div>
                        <dt className="text-sm text-muted-foreground">Possession Date</dt>
                        <dd className="font-medium">{property.possessionDate || "Not specified"}</dd>
                      </div>
                    </dl>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-3">Legal Information</h3>
                    <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <dt className="text-sm text-muted-foreground">RERA Number</dt>
                        <dd className="font-medium">{property.reraNumber || "Not specified"}</dd>
                      </div>
                      <div>
                        <dt className="text-sm text-muted-foreground">RERA Date</dt>
                        <dd className="font-medium">{property.reraDate || "Not specified"}</dd>
                      </div>
                    </dl>
                  </div>
                </TabsContent>

                <TabsContent value="features" className="pt-4 space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Unit Types</h3>
                    {property.unitTypes && property.unitTypes.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {property.unitTypes.map((unit, index) => (
                          <div key={index} className="border rounded-md p-3">
                            <div className="font-medium">{unit.type}</div>
                            {unit.additionalInfo && (
                              <div className="text-sm text-muted-foreground">{unit.additionalInfo}</div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground">No unit types specified.</p>
                    )}
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-3">Amenities</h3>
                    {property.amenities && property.amenities.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                        {property.amenities.map((amenity, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span>{amenity}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground">No amenities specified.</p>
                    )}
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-3">Highlights</h3>
                    {property.highlights && property.highlights.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {property.highlights.map((highlight, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-blue-500" />
                            <span>{highlight}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground">No highlights specified.</p>
                    )}
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-3">Payment Plans</h3>
                    {property.paymentPlans && property.paymentPlans.length > 0 ? (
                      <div className="space-y-2">
                        {property.paymentPlans.map((plan, index) => (
                          <div key={index} className="border rounded-md p-3">
                            <div>{plan}</div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground">No payment plans specified.</p>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="location" className="pt-4 space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Address</h3>
                    <p className="text-muted-foreground">{property.address || "No address provided."}</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                      <div>
                        <dt className="text-sm text-muted-foreground">City</dt>
                        <dd className="font-medium">{property.city || "Not specified"}</dd>
                      </div>
                      <div>
                        <dt className="text-sm text-muted-foreground">State</dt>
                        <dd className="font-medium">{property.state || "Not specified"}</dd>
                      </div>
                      <div>
                        <dt className="text-sm text-muted-foreground">Country</dt>
                        <dd className="font-medium">{property.country || "Not specified"}</dd>
                      </div>
                      <div>
                        <dt className="text-sm text-muted-foreground">Pincode</dt>
                        <dd className="font-medium">{property.pincode || "Not specified"}</dd>
                      </div>
                    </div>
                  </div>

                  {property.mapLink && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Map</h3>
                      <div className="border rounded-md p-4 flex justify-center">
                        <Button variant="outline" asChild>
                          <a
                            href={property.mapLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2"
                          >
                            <MapPin className="h-4 w-4" /> View on Google Maps
                          </a>
                        </Button>
                      </div>
                    </div>
                  )}

                  <div>
                    <h3 className="text-lg font-semibold mb-3">Nearby Places</h3>
                    {property.nearbyPlaces && property.nearbyPlaces.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {property.nearbyPlaces.map((place, index) => (
                          <div key={index} className="flex items-center justify-between border rounded-md p-3">
                            <span>{place.name}</span>
                            <Badge variant="outline">{place.distance}</Badge>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground">No nearby places specified.</p>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="media" className="pt-4 space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Images</h3>
                    {property.images && property.images.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {property.images.map((image, index) => (
                          <div key={index} className="border rounded-md overflow-hidden aspect-square">
                            <img
                              src={image || "/placeholder.svg"}
                              alt={`Property image ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground">No images available.</p>
                    )}
                  </div>

                  {property.videos && property.videos.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Videos</h3>
                      <div className="space-y-4">
                        {property.videos.map((video, index) => (
                          <div key={index} className="border rounded-md p-3">
                            <a
                              href={video}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 text-primary hover:underline"
                            >
                              <Video className="h-4 w-4" /> {video}
                            </a>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {property.virtualTourLink && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Virtual Tour</h3>
                      <div className="border rounded-md p-4 flex justify-center">
                        <Button variant="outline" asChild>
                          <a
                            href={property.virtualTourLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2"
                          >
                            <ExternalLink className="h-4 w-4" /> View Virtual Tour
                          </a>
                        </Button>
                      </div>
                    </div>
                  )}

                  {property.detailsPdf && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Details PDF</h3>
                      <div className="border rounded-md p-4 flex justify-center">
                        <Button variant="outline" asChild>
                          <a
                            href={property.detailsPdf}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2"
                          >
                            <FileText className="h-4 w-4" /> View PDF
                          </a>
                        </Button>
                      </div>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Property Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="space-y-4">
                <div>
                  <dt className="text-sm text-muted-foreground">ID</dt>
                  <dd className="font-medium truncate">{property.id}</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">Created</dt>
                  <dd className="font-medium">
                    {property.createdAt
                      ? new Date(property.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
                      : "Unknown"}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">Last Updated</dt>
                  <dd className="font-medium">
                    {property.updatedAt
                      ? new Date(property.updatedAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
                      : "Unknown"}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">Published</dt>
                  <dd className="font-medium">{property.published ? "Yes" : "No"}</dd>
                </div>
              </dl>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" asChild>
                <Link href={`/dashboard/properties/${property.id}/edit`} className="flex items-center gap-2">
                  <Edit className="h-4 w-4" /> Edit
                </Link>
              </Button>
              <Button
                variant="destructive"
                onClick={() => setIsDeleteDialogOpen(true)}
                className="flex items-center gap-2"
              >
                <Trash className="h-4 w-4" /> Delete
              </Button>
            </CardFooter>
          </Card>

          {property.images && property.images.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Featured Image</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="aspect-video overflow-hidden">
                  <img
                    src={property.images[0] || "/placeholder.svg"}
                    alt={property.title || "Property"}
                    className="w-full h-full object-cover"
                  />
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

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
    </div>
  )
}
