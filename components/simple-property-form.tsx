"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { db } from "@/lib/firebase/config"
import { collection, addDoc, serverTimestamp } from "firebase/firestore"
import { useToast } from "@/hooks/use-toast"
import { Spinner } from "@/components/ui/spinner"

export function SimplePropertyForm() {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [price, setPrice] = useState("")
  const [address, setAddress] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      // Basic validation
      if (!title || !description || !price || !address) {
        throw new Error("Please fill in all required fields")
      }

      // Log the attempt
      console.log("Attempting to add property to Firestore:", {
        title,
        description,
        price,
        address,
      })

      // Direct Firestore access
      const docRef = await addDoc(collection(db, "properties"), {
        title,
        description,
        price: Number.parseFloat(price),
        address,
        status: "Active",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })

      console.log("Property added successfully with ID:", docRef.id)

      toast({
        title: "Success!",
        description: "Property added successfully",
      })

      // Navigate back to properties dashboard
      router.push("/dashboard/properties/dashboard")
    } catch (err: any) {
      console.error("Error adding property:", err)
      setError(err.message || "An unknown error occurred")
      toast({
        title: "Error",
        description: err.message || "Failed to add property",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-6">
            <div className="space-y-2">
              <Label htmlFor="title">Property Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter property title"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter property description"
                className="min-h-32"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Price ($) *</Label>
              <Input
                id="price"
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="Enter price"
                min="0"
                step="1000"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address *</Label>
              <Input
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter property address"
                required
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {error && (
        <div className="bg-red-50 p-4 rounded-md border border-red-200">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting} className="flex items-center gap-2">
          {isSubmitting ? (
            <>
              <Spinner size="sm" /> Saving Property...
            </>
          ) : (
            "Save Property"
          )}
        </Button>
      </div>
    </form>
  )
}
