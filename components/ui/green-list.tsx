"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Trash } from "lucide-react"
import { deleteGoGreenEntry } from "@/lib/firebase/green" // create this function
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
import { AlertDialogTrigger } from "@radix-ui/react-alert-dialog"

export function GoGreenList({ goGreenList = [] }: { goGreenList: any[] | null }) {

  const [leads, setLeads] = useState(goGreenList)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [entryToDelete, setEntryToDelete] = useState<any>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const { toast } = useToast()

  const confirmDelete = (entry: any) => {
        setEntryToDelete(entry)
        setIsDeleteDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!entryToDelete) return
    setIsDeleting(true)

    try {
      const result = await deleteGoGreenEntry(entryToDelete.id)

      if (result.success) {
        toast({
          title: "Entry deleted",
          description: "The entry has been successfully deleted",
        });
        setLeads((prev) => prev.filter((lead) => lead.id !== entryToDelete.id));
      } else {
        toast({
          title: "Error deleting entry",
          description: result.error,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error deleting entry",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
        console.error("Error deleting entry:", error)
    } finally {
        setIsDeleteDialogOpen(false)
        setIsDeleting(false)
    }
  }

  if(goGreenList === null || goGreenList.length === 0) {
    return (
      <div className="text-center p-4">
        <h3 className="text-lg font-semibold mb-2">No Go Green entries found</h3>
        <p className="text-muted-foreground">Entries will appear here when users submit the Go Green form.</p>
      </div>
    )
  }

  return (
    <div className="relative">
        {isDeleting && (
            <div className="absolute inset-0 z-10 bg-black/50 flex items-center justify-center rounded-md">
            <p className="text-white font-semibold text-lg">Deleting entry...</p>
            </div>
        )}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Photo</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leads.map((entry: any) => (
              <TableRow key={entry.id}>
                <TableCell className="font-medium">{entry.name}</TableCell>
                <TableCell>+91-{entry.phone}</TableCell>
                <TableCell>
                  {entry.image ? (
                    <img src={entry.image} alt="Photo" className="w-16 h-16 rounded-md object-cover" />
                  ) : (
                    "No photo"
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel className="text-center">Actions</DropdownMenuLabel>
                      <DropdownMenuItem 
                        onClick={() => confirmDelete(entry)} 
                        className="text-destructive cursor-pointer"
                      >
                        <Trash className="mr-2 h-4 w-4" />    
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={(val) => {
        if(!isDeleting){
            setIsDeleteDialogOpen(val)
        }
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the entry and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction disabled={isDeleting} onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

