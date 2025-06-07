"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Edit, Trash, ArrowUp, ArrowDown } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { deletePropertyHeading, updatePropertyHeading } from "@/lib/firebase/property-headings"
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

export function PropertyHeadingsTable({ headings = [], onEdit, onSuccess }) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [headingToDelete, setHeadingToDelete] = useState<any>(null)
  const { toast } = useToast()

  const confirmDelete = (heading: any) => {
    setHeadingToDelete(heading)
    setIsDeleteDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!headingToDelete) return

    try {
      const result = await deletePropertyHeading(headingToDelete.id)

      if (result.success) {
        toast({
          title: "Heading deleted",
          description: "The property heading has been successfully deleted",
        })
        onSuccess()
      } else {
        toast({
          title: "Error deleting heading",
          description: result.error,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error deleting heading",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsDeleteDialogOpen(false)
    }
  }

  const updateHeadingOrder = async (heading: any, direction: "up" | "down") => {
    const newOrder = direction === "up" ? Math.max(1, heading.order - 1) : heading.order + 1

    try {
      const result = await updatePropertyHeading(heading.id, { order: newOrder })

      if (result.success) {
        toast({
          title: "Order updated",
          description: "The heading order has been updated",
        })
        onSuccess()
      } else {
        toast({
          title: "Error updating order",
          description: result.error,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error updating order",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    }
  }

  if (!headings.length) {
    return (
      <div className="text-center p-4">
        <h3 className="text-lg font-semibold mb-2">No headings found</h3>
        <p className="text-muted-foreground mb-4">Add property headings to display on property listings.</p>
      </div>
    )
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Display Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Required</TableHead>
            <TableHead>Visible</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {[...headings]
            .sort((a, b) => a.order - b.order)
            .map((heading) => (
              <TableRow key={heading.id}>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <span>{heading.order}</span>
                    <div className="flex flex-col">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5"
                        onClick={() => updateHeadingOrder(heading, "up")}
                        disabled={heading.order <= 1}
                      >
                        <ArrowUp className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5"
                        onClick={() => updateHeadingOrder(heading, "down")}
                      >
                        <ArrowDown className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{heading.name}</TableCell>
                <TableCell>{heading.displayName}</TableCell>
                <TableCell>
                  <Badge variant="outline">{heading.type}</Badge>
                </TableCell>
                <TableCell>
                  {heading.required ? (
                    <Badge className="bg-green-100 text-green-800">Yes</Badge>
                  ) : (
                    <Badge variant="outline">No</Badge>
                  )}
                </TableCell>
                <TableCell>
                  {heading.visible ? (
                    <Badge className="bg-green-100 text-green-800">Yes</Badge>
                  ) : (
                    <Badge variant="outline">No</Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-2">
                    <Button variant="ghost" size="icon" onClick={() => onEdit(heading)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => confirmDelete(heading)}
                      className="text-destructive"
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the property heading.
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
