"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { BannerList } from "@/components/banner-list"
import { getBanners } from "@/lib/firebase/banners"
import { useToast } from "@/hooks/use-toast"

export default function BannersPage() {
  const [banners, setBanners] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    async function loadBanners() {
      try {
        const result = await getBanners()
        if (result.success) {
          setBanners(result.banners)
        } else {
          toast({
            title: "Error loading banners",
            description: result.error,
            variant: "destructive",
          })
        }
      } catch (error) {
        toast({
          title: "Error loading banners",
          description: "An unexpected error occurred",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadBanners()
  }, [toast])

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Marketing Banners</h2>
        <div className="flex items-center space-x-2">
          <Link href="/dashboard/banners/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Banner
            </Button>
          </Link>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Banner Management</CardTitle>
          <CardDescription>Create and manage marketing banners for your website</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center p-4">Loading banners...</div>
          ) : (
            <BannerList banners={banners} />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
