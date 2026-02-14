"use client"

import { useEffect, useState } from "react"
import { RefreshCw, Truck } from "lucide-react"
import { toast } from "sonner"
import { api } from "@/lib/api"
import {
  PageShell,
  PageHeader,
  EmptyState,
  ErrorState,
  TableSkeleton,
} from "@/components/ui-kit"
import { Button } from "@/components/ui/button"
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
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      if (provider) params.set("provider", provider)
      if (action) params.set("action", action)
      const res = await api.get(`/api/shipments/logs?${params.toString()}`)
      setLogs(res.data?.data?.items || [])
    } catch (e: unknown) {
      const msg =
        e && typeof e === "object" && "response" in e && e.response && typeof e.response === "object" && "data" in e.response && e.response.data && typeof e.response.data === "object" && "error" in e.response.data
          ? String((e.response.data as { error?: string }).error)
          : "Failed to load shipping logs"
      setError(msg)
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load().catch(() => undefined)
  }, [provider, action])

  return (
    <PageShell maxWidth="content" className="space-y-6">
      <PageHeader
        title="Shipping Logs"
        subtitle="Filter by provider and action. View Shiprocket and RapidShyp API activity."
        breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "Shipping Logs" }]}
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={() => load()}
            disabled={loading}
            className="cursor-pointer transition-all duration-200 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed"
            aria-label="Refresh shipping logs"
          >
            <RefreshCw className={loading ? "size-4 animate-spin" : "size-4"} aria-hidden />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
        }
      />

      {error && (
        <Card className="rounded-2xl border bg-card shadow-sm transition-all duration-200">
          <CardContent className="p-6">
            <ErrorState message={error} onRetry={() => load()} />
          </CardContent>
        </Card>
      )}

      {!error && (
        <>
          <div className="flex gap-4 flex-wrap">
            <Select value={provider || "all"} onValueChange={(v) => setProvider(v === "all" ? "" : v)}>
              <SelectTrigger className="w-[160px] transition-all duration-200">
                <SelectValue placeholder="Provider" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All providers</SelectItem>
                <SelectItem value="SHIPROCKET">Shiprocket</SelectItem>
                <SelectItem value="RAPIDSHYP">RapidShyp</SelectItem>
              </SelectContent>
            </Select>
            <Select value={action || "all"} onValueChange={(v) => setAction(v === "all" ? "" : v)}>
              <SelectTrigger className="w-[180px] transition-all duration-200">
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

          {loading && <TableSkeleton rows={8} cols={5} className="shadow-sm transition-all duration-200" />}

          {!loading && logs.length === 0 && (
            <Card className="rounded-2xl border border-border bg-card shadow-sm transition-all duration-200 hover:shadow-md">
              <CardContent className="p-6">
                <EmptyState
                  icon={<Truck className="size-8 text-muted-foreground" />}
                  title="No shipping logs yet"
                  description="Logs will appear here when Shiprocket or RapidShyp API calls are made."
                  action={{ label: "Refresh", onClick: () => load() }}
                />
              </CardContent>
            </Card>
          )}

          {!loading && logs.length > 0 && (
            <Card className="rounded-2xl border border-border bg-card shadow-sm transition-all duration-200 hover:shadow-md overflow-hidden">
              <CardContent className="px-4 pt-4 pb-4 md:px-6 md:pt-6 md:pb-6">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border hover:bg-transparent bg-muted/50">
                      <TableHead className="text-xs font-medium">Provider</TableHead>
                      <TableHead className="text-xs font-medium">Action</TableHead>
                      <TableHead className="text-xs font-medium">Status</TableHead>
                      <TableHead className="text-xs font-medium">Error</TableHead>
                      <TableHead className="text-xs font-medium">Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logs.map((log) => (
                      <TableRow key={log._id} className="border-border">
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
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </PageShell>
  )
}
