"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { PropertyHeadingsTable } from "@/components/property-headings-table"
import { PropertyHeadingForm } from "@/components/property-heading-form"
import { getPropertyHeadings } from "@/lib/firebase/property-headings"
import { useToast } from "@/hooks/use-toast"

export default function PropertyHeadingsPage() {
  const [headings, setHeadings] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingHeading, setEditingHeading] = useState<any>(null)
  const { toast } = useToast()

  useEffect(() => {
    async function loadHeadings() {
      try {
        const result = await getPropertyHeadings()
        if (result.success) {
          setHeadings(result.headings)
        } else {
          toast({
            title: "Error loading property headings",
            description: result.error,
            variant: "destructive",
          })
        }
      } catch (error) {
        toast({
          title: "Error loading property headings",
          description: "An unexpected error occurred",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadHeadings()
  }, [toast])

  const handleEdit = (heading: any) => {
    setEditingHeading(heading)
    setIsFormOpen(true)
  }

  const handleCloseForm = () => {
    setIsFormOpen(false)
    setEditingHeading(null)
  }

  const handleSuccess = async () => {
    setIsFormOpen(false)
    setEditingHeading(null)
    setIsLoading(true)

    try {
      const result = await getPropertyHeadings()
      if (result.success) {
        setHeadings(result.headings)
      }
    } catch (error) {
      // Error handling already in the useEffect
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Property Headings</h2>
        <div className="flex items-center space-x-2">
          <Button onClick={() => setIsFormOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Heading
          </Button>
        </div>
      </div>

      {isFormOpen && (
        <Card>
          <CardHeader>
            <CardTitle>{editingHeading ? "Edit Heading" : "Add Heading"}</CardTitle>
            <CardDescription>
              {editingHeading ? "Update existing property heading" : "Create a new property heading"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PropertyHeadingForm heading={editingHeading} onClose={handleCloseForm} onSuccess={handleSuccess} />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Property Headings</CardTitle>
          <CardDescription>Manage headings/attributes shown on property listings</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center p-4">Loading headings...</div>
          ) : (
            <PropertyHeadingsTable headings={headings} onEdit={handleEdit} onSuccess={handleSuccess} />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
