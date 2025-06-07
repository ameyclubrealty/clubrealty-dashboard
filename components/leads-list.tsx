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
import { Badge } from "@/components/ui/badge"
import { MoreHorizontal, Mail, Phone, Check, X, Trash } from "lucide-react"
import { updateLead, deleteLead } from "@/lib/firebase/leads"
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

export function LeadsList({ leads = [] }) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [leadToDelete, setLeadToDelete] = useState<any>(null)
  const router = useRouter()
  const { toast } = useToast()

  const getStatusColor = (status: string) => {
    switch (status) {
      case "New":
        return "bg-blue-100 text-blue-800"
      case "Contacted":
        return "bg-yellow-100 text-yellow-800"
      case "Qualified":
        return "bg-green-100 text-green-800"
      case "Unqualified":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const updateLeadStatus = async (leadId: string, newStatus: string) => {
    try {
      const result = await updateLead(leadId, { status: newStatus })

      if (result.success) {
        toast({
          title: "Lead updated",
          description: `Lead status changed to ${newStatus}`,
        })
        router.refresh()
      } else {
        toast({
          title: "Error updating lead",
          description: result.error,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error updating lead",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    }
  }

  const confirmDelete = (lead: any) => {
    setLeadToDelete(lead)
    setIsDeleteDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!leadToDelete) return

    try {
      const result = await deleteLead(leadToDelete.id)

      if (result.success) {
        toast({
          title: "Lead deleted",
          description: "The lead has been successfully deleted",
        })
        router.refresh()
      } else {
        toast({
          title: "Error deleting lead",
          description: result.error,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error deleting lead",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsDeleteDialogOpen(false)
    }
  }

  if (!leads.length) {
    return (
      <div className="text-center p-4">
        <h3 className="text-lg font-semibold mb-2">No leads found</h3>
        <p className="text-muted-foreground">Leads will appear here when users submit inquiries on your properties.</p>
      </div>
    )
  }

  return (
    <>
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Property</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leads.map((lead: any) => (
              <TableRow key={lead.id}>
                <TableCell className="font-medium">{lead.name}</TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <div className="flex items-center">
                      <Mail className="mr-1 h-3 w-3" />
                      <span className="text-xs">{lead.email}</span>
                    </div>
                    <div className="flex items-center mt-1">
                      <Phone className="mr-1 h-3 w-3" />
                      <span className="text-xs">{lead.phone}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{lead.property}</TableCell>
                <TableCell>{lead.date ? new Date(lead.date).toLocaleDateString() : "N/A"}</TableCell>
                <TableCell>
                  <Badge className={getStatusColor(lead.status)}>{lead.status}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => (window.location.href = `mailto:${lead.email}`)}>
                        <Mail className="mr-2 h-4 w-4" />
                          Send Email
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => (window.location.href = `tel:${lead.phone}`)}>
                        <Phone className="mr-2 h-4 w-4" />
                          Call
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => updateLeadStatus(lead.id, "Qualified")}>
                        <Check className="mr-2 h-4 w-4" />
                          Mark as Qualified
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => updateLeadStatus(lead.id, "Unqualified")}>
                        <X className="mr-2 h-4 w-4" />
                          Mark as Unqualified
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => confirmDelete(lead)} className="text-destructive">
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

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the lead and all associated data.
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
