"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function PropertyDisplay({ property }) {
  if (!property) {
    return <div>No property data available</div>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Property Data</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div>
            <strong>ID:</strong> {property.id}
          </div>
          <div>
            <strong>Title:</strong> {property.title}
          </div>
          <div>
            <strong>Type:</strong> {property.propertyType}
          </div>
          <div>
            <strong>Subtype:</strong> {property.propertySubtype}
          </div>
          <div>
            <strong>Address:</strong> {property.address}
          </div>
          <div>
            <strong>Price:</strong> ₹
            {property.startingPrice?.toLocaleString() || property.price?.toLocaleString() || "N/A"}
          </div>
          <div>
            <strong>Status:</strong> {property.status}
          </div>
          <div>
            <strong>Published:</strong> {property.published ? "Yes" : "No"}
          </div>
          <div>
            <strong>Created:</strong> {property.createdAt ? new Date(property.createdAt).toLocaleString() : "N/A"}
          </div>
          <div>
            <strong>Updated:</strong> {property.updatedAt ? new Date(property.updatedAt).toLocaleString() : "N/A"}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
