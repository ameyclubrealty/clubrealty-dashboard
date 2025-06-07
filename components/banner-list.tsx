"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Edit, Eye, MoreHorizontal, Trash, Plus } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { deleteBanner } from "@/lib/firebase/banners"
import { useToast } from "@/hooks/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export function BannerList({ banners = [] }) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [bannerToDelete, setBannerToDelete] = useState<any>(null)
  const router = useRouter()
  const { toast } = useToast()

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800"
      case "Scheduled":
        return "bg-blue-100 text-blue-800"
      case "Expired":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const confirmDelete = (banner: any) => {
    setBannerToDelete(banner)
    setIsDeleteDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!bannerToDelete) return

    try {
      const result = await deleteBanner(bannerToDelete.id)

      if (result.success) {
        toast({
          title: "Banner deleted",
          description: "The banner has been successfully deleted",
        })
        router.refresh()
      } else {
        toast({
          title: "Error deleting banner",
          description: result.error,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error deleting banner",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsDeleteDialogOpen(false)
    }
  }

  if (!banners.length) {
    return (
      <div className="text-center p-4">
        <h3 className="text-lg font-semibold mb-2">No banners found</h3>
        <p className="text-muted-foreground mb-4">Create your first marketing banner to promote your properties.</p>
        <Link href="/dashboard/banners/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Banner
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {banners.map((banner: any) => (
          <Card key={banner.id} className="overflow-hidden">
            <div className="h-32 bg-muted relative">
              {banner.imageUrl && (
                <img
                  src={banner.imageUrl || "/placeholder.svg"}
                  alt={banner.title}
                  className="object-cover w-full h-full"
                />
              )}
              <div className="absolute top-2 right-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="bg-white/80 hover:bg-white">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem asChild>
                      <Link href={`/dashboard/banners/${banner.id}`}>
                        <Eye className="mr-2 h-4 w-4" />
                        View
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/dashboard/banners/${banner.id}/edit`}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => confirmDelete(banner)} className="text-destructive">
                      <Trash className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4 text-white">
                <div className="font-semibold">{banner.title}</div>
                <div className="text-sm">{banner.description}</div>
              </div>
            </div>
            <CardContent className="p-4">
              <div className="flex justify-between items-center mb-2">
                <div className="text-sm text-muted-foreground">{banner.position}</div>
                <Badge className={getStatusColor(banner.status)}>{banner.status}</Badge>
              </div>
              <div className="text-xs text-muted-foreground">
                {banner.startDate && new Date(banner.startDate).toLocaleDateString()} -
                {banner.endDate && new Date(banner.endDate).toLocaleDateString()}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the banner and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
