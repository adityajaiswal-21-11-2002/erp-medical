"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { api } from "@/lib/api"
import { PageHeader } from "@/components/page-header"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type Log = {
  _id: string
  orderId?: string
  provider: string
  action: string
  statusCode?: number
  error?: string
  createdAt: string
}

export default function ShippingLogsPage() {
  const [logs, setLogs] = useState<Log[]>([])
  const [provider, setProvider] = useState<string>("")
  const [action, setAction] = useState<string>("")

  useEffect(() => {
    const load = async () => {
      try {
        const params = new URLSearchParams()
        if (provider) params.set("provider", provider)
        if (action) params.set("action", action)
        const res = await api.get(`/api/shipments/logs?${params.toString()}`)
        setLogs(res.data?.data?.items || [])
      } catch (e: any) {
        toast.error(e?.response?.data?.error || "Failed to load logs")
      }
    }
    load().catch(() => undefined)
  }, [provider, action])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Shipping Logs"
        description="Filter by provider and action."
      />
      <div className="flex gap-4 flex-wrap">
        <Select value={provider || "all"} onValueChange={(v) => setProvider(v === "all" ? "" : v)}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Provider" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All providers</SelectItem>
            <SelectItem value="SHIPROCKET">Shiprocket</SelectItem>
            <SelectItem value="RAPIDSHYP">RapidShyp</SelectItem>
          </SelectContent>
        </Select>
        <Select value={action || "all"} onValueChange={(v) => setAction(v === "all" ? "" : v)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Action" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All actions</SelectItem>
            <SelectItem value="AUTH">AUTH</SelectItem>
            <SelectItem value="CREATE_ORDER">CREATE_ORDER</SelectItem>
            <SelectItem value="ASSIGN">ASSIGN</SelectItem>
            <SelectItem value="AWB">AWB</SelectItem>
            <SelectItem value="TRACK">TRACK</SelectItem>
            <SelectItem value="CANCEL">CANCEL</SelectItem>
            <SelectItem value="WEBHOOK">WEBHOOK</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Provider</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Error</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log._id}>
                  <TableCell className="font-medium">{log.provider}</TableCell>
                  <TableCell>{log.action}</TableCell>
                  <TableCell>{log.statusCode ?? "-"}</TableCell>
                  <TableCell className="text-muted-foreground max-w-[200px] truncate">
                    {log.error || "-"}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {log.createdAt ? new Date(log.createdAt).toLocaleString() : "-"}
                  </TableCell>
                </TableRow>
              ))}
              {logs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    No logs
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
