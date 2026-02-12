"use client"

import React, { useEffect, useState } from "react"
import { LifeBuoy, MessageSquare } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { StatusBadge } from "@/components/status-badge"
import { api } from "@/lib/api"
import { toast } from "sonner"

type Ticket = { _id?: string; id?: string; subject?: string; status?: string }

export default function CustomerSupportPage() {
  const [tickets, setTickets] = useState<Ticket[]>([])

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/api/tickets")
        const data = res.data?.data
        setTickets(Array.isArray(data) ? data : [])
      } catch {
        setTickets([])
      }
    }
    load().catch(() => undefined)
  }, [])

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Support</h2>
          <p className="text-sm text-muted-foreground">Raise queries and track responses.</p>
        </div>
        <Button className="gap-2">
          <MessageSquare className="w-4 h-4" />
          New ticket
        </Button>
      </div>

      <div className="grid gap-4">
        {tickets.length === 0 && (
          <Card className="border">
            <CardContent className="p-8 text-center text-muted-foreground">
              No support tickets yet.
            </CardContent>
          </Card>
        )}
        {tickets.map((ticket) => (
          <Card key={ticket._id || ticket.id || String(Math.random())} className="border">
            <CardContent className="p-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                  <LifeBuoy className="w-4 h-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-semibold">{ticket.subject || "Support request"}</p>
                  <p className="text-xs text-muted-foreground">
                    Ticket ID: {ticket._id || ticket.id || "—"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge status={(ticket.status as any) || "OPEN"} />
                <Button variant="outline" size="sm">
                  View
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
