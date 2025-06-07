"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PropertyForm } from "@/components/property-form"

export default function AddPropertyPage() {
  console.log("Rendering AddPropertyPage component")
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Add Property</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Property Information</CardTitle>
          <CardDescription>Add a new property listing to the Club Realty website</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <PropertyForm />
        </CardContent>
      </Card>
    </div>
  )
}
