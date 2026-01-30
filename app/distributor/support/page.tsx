import React, { useEffect, useState } from "react"
import { LifeBuoy, MessageSquare } from "lucide-react"
import { api } from "@/lib/api"
import { toast } from "sonner"

import { PageHeader } from "@/components/page-header"
import { StatusBadge } from "@/components/status-badge"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function DistributorSupportPage() {
  const [tickets, setTickets] = useState<any[]>([])

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/api/tickets")
        setTickets(res.data?.data || [])
      } catch (error: any) {
        toast.error(error?.response?.data?.error || "Failed to load tickets")
      }
    }
    load().catch(() => undefined)
  }, [])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Support"
        description="Track escalations and distributor support tickets."
        actions={
          <Button
            className="gap-2"
            onClick={async () => {
              try {
                await api.post("/api/tickets", {
                  subject: "Distributor support request",
                  description: "Describe the issue",
                  priority: "MEDIUM",
                })
                toast.success("Ticket submitted")
                const res = await api.get("/api/tickets")
                setTickets(res.data?.data || [])
              } catch (error: any) {
                toast.error(error?.response?.data?.error || "Failed to submit ticket")
              }
            }}
          >
            <MessageSquare className="w-4 h-4" />
            New ticket
          </Button>
        }
      />

      <div className="grid gap-4">
        {tickets.map((ticket) => (
          <Card key={ticket._id} className="border">
            <CardContent className="p-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                  <LifeBuoy className="w-4 h-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-semibold">{ticket.subject}</p>
                  <p className="text-xs text-muted-foreground">Ticket ID: {ticket._id}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge status={ticket.status as any} />
                <span className="text-xs text-muted-foreground">Priority: {ticket.priority}</span>
                <Button variant="outline" size="sm">
                  View
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {tickets.length === 0 && (
          <Card className="border">
            <CardContent className="p-5 text-center text-muted-foreground">
              No tickets yet
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
