"use client"

import Link from "next/link"
import { Building, Plus, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

export function PropertyEmptyState({ filtered = false, onRefresh }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
        <Building className="h-10 w-10 text-muted-foreground" />
      </div>
      <h3 className="mt-6 text-lg font-semibold">{filtered ? "No matching properties" : "No properties found"}</h3>
      <p className="mt-2 text-sm text-muted-foreground max-w-sm">
        {filtered
          ? "Try adjusting your filters or search query to find what you're looking for."
          : "Get started by adding your first property listing to your portfolio."}
      </p>
      <div className="mt-6 flex gap-3">
        {filtered ? (
          <>
            <Button variant="outline" onClick={onRefresh}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
            <Link href="/dashboard/properties/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Property
              </Button>
            </Link>
          </>
        ) : (
          <Link href="/dashboard/properties/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Property
            </Button>
          </Link>
        )}
      </div>
    </div>
  )
}
