"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Edit, Eye, MoreHorizontal, Trash, Plus } from "lucide-react"
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

export function PropertyGrid({ properties = [], onDeleteSuccess }) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [propertyToDelete, setPropertyToDelete] = useState<any>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [localProperties, setLocalProperties] = useState(properties)
  const router = useRouter()
  const { toast } = useToast()

  // Update local state when props change
  if (JSON.stringify(properties) !== JSON.stringify(localProperties)) {
    setLocalProperties(properties)
  }

  const confirmDelete = (property: any) => {
    setPropertyToDelete(property)
    setIsDeleteDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!propertyToDelete) return

    setIsDeleting(true)
    try {
      console.log("Attempting to delete property with ID:", propertyToDelete.id)

      const result = await deleteProperty(propertyToDelete.id)

      if (result.success) {
        console.log("Property deleted successfully with ID:", propertyToDelete.id)

        // Update local state immediately
        const updatedProperties = localProperties.filter((p) => p.id !== propertyToDelete.id)
        setLocalProperties(updatedProperties)

        toast({
          title: "Property deleted",
          description: "The property has been successfully deleted",
        })

        // Notify parent component
        if (onDeleteSuccess) {
          onDeleteSuccess(propertyToDelete.id)
        }

        // Force a refresh of the page data
        router.refresh()
      } else {
        console.error("Error from deleteProperty function:", result.error)
        toast({
          title: "Error deleting property",
          description: result.error || "Failed to delete property",
          variant: "destructive",
        })
      }
    } catch (error: any) {
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

  if (!localProperties.length) {
    return (
      <div className="text-center p-4">
        <h3 className="text-lg font-semibold mb-2">No properties found</h3>
        <p className="text-muted-foreground mb-4">Add your first property to get started.</p>
        <Link href="/dashboard/properties/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Property
          </Button>
        </Link>
      </div>
    )
  }

  const PropertyCard = ({ property, onDelete }) => (
    <Card key={property.id} className="overflow-hidden">
      <div className="aspect-video w-full bg-muted relative">
        {property.images && property.images.length > 0 ? (
          <img
            src={property.images[0] || "/placeholder.svg"}
            alt={property.title}
            className="object-cover w-full h-full"
          />
        ) : null}
        <div className="absolute top-2 right-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="bg-white/80 hover:bg-white">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/properties/${property.id}`}>
                  <Eye className="mr-2 h-4 w-4" />
                  View
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/properties/${property.id}/edit`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => confirmDelete(property)} className="text-destructive">
                <Trash className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4 text-white">
          <div className="font-semibold">{property.title}</div>
          <div className="text-sm">{property.address}</div>
        </div>
      </div>
      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-2">
          <div className="font-bold text-lg">₹{property.price?.toLocaleString("en-IN")}</div>
          <div
            className={`text-xs px-2 py-1 rounded-full ${
              property.status === "Active"
                ? "bg-green-100 text-green-800"
                : property.status === "Pending"
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-gray-100 text-gray-800"
            }`}
          >
            {property.status}
          </div>
        </div>
        <div className="flex justify-between text-sm text-muted-foreground">
          <div>{property.bedrooms || 0} beds</div>
          <div>{property.bathrooms || 0} baths</div>
          <div>{property.area || 0} sqft</div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {localProperties.map((property: any) => (
          <PropertyCard key={property.id} property={property} onDelete={() => confirmDelete(property)} />
        ))}
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
    </>
  )
}
