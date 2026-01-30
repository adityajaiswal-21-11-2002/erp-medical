"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { api } from "@/lib/api"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

type Ticket = {
  _id: string
  subject: string
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED"
  priority: "LOW" | "MEDIUM" | "HIGH"
  createdAt?: string
}

export default function TicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([])

  const load = async () => {
    try {
      const res = await api.get("/api/tickets")
      setTickets(res.data?.data || [])
    } catch (error: any) {
      toast.error(error?.response?.data?.error || "Failed to load tickets")
    }
  }

  const updateStatus = async (id: string, status: Ticket["status"]) => {
    try {
      await api.patch(`/api/tickets/${id}`, { status })
      toast.success("Ticket updated")
      load()
    } catch (error: any) {
      toast.error(error?.response?.data?.error || "Failed to update ticket")
    }
  }

  useEffect(() => {
    load().catch(() => undefined)
  }, [])

  return (
    <div className="space-y-6">
      <PageHeader title="Support Tickets" description="Manage retailer and distributor issues." />
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Subject</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tickets.map((ticket) => (
            <TableRow key={ticket._id}>
              <TableCell>{ticket.subject}</TableCell>
              <TableCell>{ticket.status}</TableCell>
              <TableCell>{ticket.priority}</TableCell>
              <TableCell>
                {ticket.createdAt ? new Date(ticket.createdAt).toLocaleString() : "-"}
              </TableCell>
              <TableCell className="text-right">
                <Select
                  value={ticket.status}
                  onValueChange={(value) => updateStatus(ticket._id, value as Ticket["status"])}
                >
                  <SelectTrigger className="h-8 w-36">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="OPEN">OPEN</SelectItem>
                    <SelectItem value="IN_PROGRESS">IN_PROGRESS</SelectItem>
                    <SelectItem value="RESOLVED">RESOLVED</SelectItem>
                  </SelectContent>
                </Select>
              </TableCell>
            </TableRow>
          ))}
          {tickets.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-muted-foreground">
                No tickets found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <Button variant="outline" onClick={load}>
        Refresh
      </Button>
    </div>
  )
}
