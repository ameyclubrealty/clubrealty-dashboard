"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft } from "lucide-react"
import { getProperty, updateProperty } from "@/lib/firebase/properties"
import { PropertyDisplay } from "@/components/property-display"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export default function PropertyEditFallbackPage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const [property, setProperty] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState(null)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    propertyType: "",
    propertySubtype: "",
    address: "",
    startingPrice: 0,
    projectId: "", // Added Project ID field
    parkingAvailable: false, // Added Parking Available field
  })

  useEffect(() => {
    const fetchProperty = async () => {
      if (!params.id) return

      try {
        setIsLoading(true)
        const result = await getProperty(params.id)

        if (result.success) {
          setProperty(result.property)
          setFormData({
            title: result.property.title || "",
            description: result.property.description || "",
            propertyType: result.property.propertyType || "",
            propertySubtype: result.property.propertySubtype || "",
            address: result.property.address || "",
            startingPrice: result.property.startingPrice || result.property.price || 0,
            projectId: result.property.projectId || "", // Added Project ID field
            parkingAvailable: result.property.parkingAvailable || false, // Added Parking Available field
          })
        } else {
          setError(result.error || "Failed to load property")
          toast({
            title: "Error",
            description: result.error || "Failed to load property",
            variant: "destructive",
          })
        }
      } catch (err) {
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

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : type === "number" ? Number(value) : value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      // Merge the form data with the existing property data
      const updatedProperty = {
        ...property,
        ...formData,
      }

      const result = await updateProperty(property.id, updatedProperty)

      if (result.success) {
        toast({
          title: "Property updated",
          description: "The property has been successfully updated",
        })
        router.push(`/dashboard/properties/${property.id}`)
      } else {
        throw new Error(result.error || "Failed to update property")
      }
    } catch (error) {
      toast({
        title: "Error updating property",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
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
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" onClick={() => router.back()} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">Edit Property (Fallback)</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <PropertyDisplay property={property} />

          <div className="mt-4">
            <Button onClick={() => router.push(`/dashboard/properties/${property.id}/edit`)} className="w-full">
              Try Standard Edit Form
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Basic Property Edit</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input id="title" name="title" value={formData.title} onChange={handleInputChange} required />
              </div>

              <div>
                <Label htmlFor="propertyType">Property Type</Label>
                <Input
                  id="propertyType"
                  name="propertyType"
                  value={formData.propertyType}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div>
                <Label htmlFor="propertySubtype">Property Subtype</Label>
                <Input
                  id="propertySubtype"
                  name="propertySubtype"
                  value={formData.propertySubtype}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div>
                <Label htmlFor="address">Address</Label>
                <Input id="address" name="address" value={formData.address} onChange={handleInputChange} required />
              </div>

              <div>
                <Label htmlFor="startingPrice">Starting Price (₹)</Label>
                <Input
                  id="startingPrice"
                  name="startingPrice"
                  type="number"
                  value={formData.startingPrice}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div>
                <Label htmlFor="projectId">Project ID</Label>
                <Input id="projectId" name="projectId" value={formData.projectId} onChange={handleInputChange} />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="parkingAvailable"
                  name="parkingAvailable"
                  checked={formData.parkingAvailable}
                  onChange={handleInputChange}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <Label htmlFor="parkingAvailable">Parking Available</Label>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={5}
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Spinner size="sm" className="mr-2" /> Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
