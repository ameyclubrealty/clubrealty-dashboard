"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { getProperties } from "../lib/firebase/properties" // Import your Firebase functions

export function PropertyFilters({ onFilterChange }) {
  const [filters, setFilters] = useState({
    status: "",
    propertyType: "",
    minPrice: 0,
    maxPrice: 5000000,
    bedrooms: "",
    bathrooms: "",
    listingIntent: "",
    publishedBy: ""
  })

  const [publishedByOptions, setPublishedByOptions] = useState([])
  const [customPublishedBy, setCustomPublishedBy] = useState("")

  useEffect(() => {
    const fetchPublishedByOptions = async () => {
      try {
        const { success, properties } = await getProperties()
        if (success) {
          // Extract unique publishedBy values from properties
          const uniquePublishedBy = [...new Set(properties.map(property => property.publishedBy).filter(Boolean))]
          setPublishedByOptions(uniquePublishedBy)
        }
      } catch (error) {
        console.error("Error fetching publishedBy options:", error)
      }
    }

    fetchPublishedByOptions()
  }, [])

  const handleFilterChange = (key, value) => {
    const updatedFilters = { ...filters, [key]: value }
    setFilters(updatedFilters)

    // Log the filter change
    console.log(`Filter changed: ${key} = ${value}`)
    console.log("Current filters:", updatedFilters)
  }

  const handlePublishedByChange = (value) => {
    if (value === "custom") {
      setCustomPublishedBy("")
      handleFilterChange("publishedBy", "")
    } else {
      handleFilterChange("publishedBy", value)
    }
  }

  const applyFilters = () => {
    // Log the filters being applied
    console.log("Applying filters:", filters)

    if (onFilterChange) {
      onFilterChange(filters)
    }
  }

  const resetFilters = () => {
    const defaultFilters = {
      status: "",
      propertyType: "",
      minPrice: 0,
      maxPrice: 5000000,
      bedrooms: "",
      bathrooms: "",
      listingIntent: "",
      publishedBy: ""
    }

    setFilters(defaultFilters)
    setCustomPublishedBy("")

    // Log the reset
    console.log("Filters reset to defaults")

    if (onFilterChange) {
      onFilterChange(defaultFilters)
    }
  }

  // Format price with commas and currency symbol
  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price)
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="status">Status</Label>
        <Select value={filters.status} onValueChange={(value) => handleFilterChange("status", value)}>
          <SelectTrigger id="status">
            <SelectValue placeholder="Any status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="any">Any status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="sold">Sold</SelectItem>
            <SelectItem value="under-construction">Under Construction</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="propertyType">Property Type</Label>
        <Select value={filters.propertyType} onValueChange={(value) => handleFilterChange("propertyType", value)}>
          <SelectTrigger id="propertyType">
            <SelectValue placeholder="Any type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="any">Any type</SelectItem>
            <SelectItem value="residential">Residential</SelectItem>
            <SelectItem value="commercial">Commercial</SelectItem>
            <SelectItem value="industrial">Industrial</SelectItem>
            <SelectItem value="land">Land</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="publishedBy" className="block">Published By</Label>
        <div className="flex items-center space-x-2">
          <Select value={filters.publishedBy || "custom"} onValueChange={handlePublishedByChange}>
            <SelectTrigger id="publishedBy">
              <SelectValue placeholder="Select a publisher" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="custom">Select Options</SelectItem>
              {publishedByOptions.map(option => (
                <SelectItem key={option} value={option}>{option}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {/* {filters.publishedBy === "" && (
            <Input
              id="customPublishedBy"
              placeholder="e.g. John Doe"
              value={customPublishedBy}
              onChange={(e) => {
                setCustomPublishedBy(e.target.value)
                handleFilterChange("publishedBy", e.target.value)
              }}
            />
          )} */}
        </div>
      </div>


      <div className="space-y-2">
        <Label htmlFor="listingIntent">Listing Intent</Label>
        <Select value={filters.listingIntent} onValueChange={(value) => handleFilterChange("listingIntent", value)}>
          <SelectTrigger id="listingIntent">
            <SelectValue placeholder="Any intent" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="any">Any intent</SelectItem>
            <SelectItem value="sell">For Sale</SelectItem>
            <SelectItem value="rent">For Rent</SelectItem>
            <SelectItem value="lease">For Lease</SelectItem>
            <SelectItem value="new project">New Project</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between">
          <Label>Price Range</Label>
          <span className="text-sm text-muted-foreground">
            {formatPrice(filters.minPrice)} - {formatPrice(filters.maxPrice)}
          </span>
        </div>
        <div className="pt-4">
          <Slider
            defaultValue={[filters.minPrice, filters.maxPrice]}
            max={5000000}
            step={50000}
            onValueChange={(values) => {
              handleFilterChange("minPrice", values[0])
              handleFilterChange("maxPrice", values[1])
            }}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="bedrooms">Bedrooms</Label>
          <Select value={filters.bedrooms} onValueChange={(value) => handleFilterChange("bedrooms", value)}>
            <SelectTrigger id="bedrooms">
              <SelectValue placeholder="Any" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any</SelectItem>
              <SelectItem value="1">1+</SelectItem>
              <SelectItem value="2">2+</SelectItem>
              <SelectItem value="3">3+</SelectItem>
              <SelectItem value="4">4+</SelectItem>
              <SelectItem value="5">5+</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="bathrooms">Bathrooms</Label>
          <Select value={filters.bathrooms} onValueChange={(value) => handleFilterChange("bathrooms", value)}>
            <SelectTrigger id="bathrooms">
              <SelectValue placeholder="Any" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any</SelectItem>
              <SelectItem value="1">1+</SelectItem>
              <SelectItem value="2">2+</SelectItem>
              <SelectItem value="3">3+</SelectItem>
              <SelectItem value="4">4+</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Separator />

      <div className="flex justify-end">
        <Button variant="outline" onClick={resetFilters} className="mr-2">
          Reset Filters
        </Button>
        <Button onClick={applyFilters}>Apply Filters</Button>
      </div>
    </div>
  )
}

export default PropertyFilters
