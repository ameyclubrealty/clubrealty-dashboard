"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LeadsList } from "@/components/leads-list"
import { getLeads } from "@/lib/firebase/leads"
import { useToast } from "@/hooks/use-toast"

export default function LeadsPage() {
  const [leads, setLeads] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    async function loadLeads() {
      try {
        const result = await getLeads()
        if (result.success) {
          setLeads(result?.leads)
        } else {
          toast({
            title: "Error loading leads",
            description: result.error,
            variant: "destructive",
          })
        }
      } catch (error) {
        toast({
          title: "Error loading leads",
          description: "An unexpected error occurred",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadLeads()
  }, [toast])

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Leads</h2>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Lead Management</CardTitle>
          <CardDescription>View and manage leads from your properties</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? <div className="flex justify-center p-4">Loading leads...</div> : <LeadsList leads={leads} />}
        </CardContent>
      </Card>
    </div>
  )
}
