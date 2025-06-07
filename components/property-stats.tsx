"use client"

import { Building, Home, DollarSign, Clock } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function PropertyStats({ properties = [] }) {
  // Calculate stats
  const stats = {
    total: properties.length,
    active: properties.filter(
      (p) => p.status?.toLowerCase() === "active" || p.status?.toLowerCase() === "sale" || !p.status,
    ).length,
    pending: properties.filter(
      (p) => p.status?.toLowerCase() === "pending" || p.status?.toLowerCase() === "under-construction",
    ).length,
    sold: properties.filter((p) => p.status?.toLowerCase() === "sold").length,
  }

  // Calculate total value of properties
  const totalValue = properties.reduce((sum, property) => {
    const price = property.price || property.startingPrice || 0
    return sum + (typeof price === "number" ? price : 0)
  }, 0)

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
      notation: "compact",
      compactDisplay: "short",
    }).format(amount)
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Properties</CardTitle>
          <Building className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.total}</div>
          <p className="text-xs text-muted-foreground mt-1">Total value: {formatCurrency(totalValue)}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Listings</CardTitle>
          <Home className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.active}</div>
          <p className="text-xs text-muted-foreground mt-1">
            {stats.total > 0 ? Math.round((stats.active / stats.total) * 100) : 0}% of inventory
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pending</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.pending}</div>
          <p className="text-xs text-muted-foreground mt-1">
            {stats.total > 0 ? Math.round((stats.pending / stats.total) * 100) : 0}% of inventory
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Sold</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.sold}</div>
          <p className="text-xs text-muted-foreground mt-1">
            {stats.total > 0 ? Math.round((stats.sold / stats.total) * 100) : 0}% of inventory
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
