"use client"
import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft } from "lucide-react"
import { getProperty } from "@/lib/firebase/properties"
import { PropertyEditForm } from "@/components/property-edit-form"

export default function PropertyEditPage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const [property, setProperty] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

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
        <h1 className="text-2xl font-bold tracking-tight">Edit Property</h1>
      </div>

      <PropertyEditForm propertyId={property.id} />
    </div>
  )
}
