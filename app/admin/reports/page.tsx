"use client"

import { useEffect, useState } from "react"
import { RefreshCw, FileText } from "lucide-react"
import { toast } from "sonner"
import { api } from "@/lib/api"
import { getErrorMessage } from "@/lib/utils"
import {
  PageShell,
  PageHeader,
  TableSkeleton,
  EmptyState,
  ErrorState,
} from "@/components/ui-kit"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

type OrderRow = {
  _id: string
  orderNumber: string
  customerName: string
  netAmount: number
  status: string
  createdAt: string
}

export default function ReportsPage() {
  const [orders, setOrders] = useState<OrderRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({ limit: "200" })
      if (dateFrom) params.set("dateFrom", dateFrom)
      if (dateTo) params.set("dateTo", dateTo)
      const res = await api.get(`/api/orders?${params.toString()}`)
      setOrders(res.data?.data?.items || [])
    } catch (err) {
      const msg = getErrorMessage(err, "Failed to load orders")
      setError(msg)
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load().catch(() => undefined)
  }, [])

  const exportCsv = () => {
    const header = ["orderNumber", "customerName", "netAmount", "status", "createdAt"]
    const rows = orders.map((order) => [
      order.orderNumber,
      order.customerName,
      String(order.netAmount),
      order.status,
      order.createdAt,
    ])
    const csv = [header, ...rows].map((row) => row.join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    const timestamp = new Date().toISOString().slice(0, 10)
    link.setAttribute("download", `orders-report-${timestamp}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    toast.success("Report exported")
  }

  return (
    <PageShell maxWidth="content" className="space-y-6">
      <PageHeader
        title="Reports & Exports"
        subtitle="Export operational reports for analytics and audits. Use date filters to narrow results."
        breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "Reports" }]}
        actions={
          <div className="flex flex-shrink-0 flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => load()}
              disabled={loading}
              className="cursor-pointer transition-all duration-200 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed"
              aria-label="Refresh report"
            >
              <RefreshCw className={loading ? "size-4 animate-spin" : "size-4"} aria-hidden />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
            <Button
              size="sm"
              onClick={exportCsv}
              disabled={loading || orders.length === 0}
              className="cursor-pointer transition-all duration-200 disabled:cursor-not-allowed"
            >
              <FileText className="size-4" aria-hidden />
              Export CSV
            </Button>
          </div>
        }
      />

      <div className="flex flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <Label htmlFor="dateFrom" className="text-sm whitespace-nowrap">From</Label>
          <Input
            id="dateFrom"
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="w-[140px]"
          />
        </div>
        <div className="flex items-center gap-2">
          <Label htmlFor="dateTo" className="text-sm whitespace-nowrap">To</Label>
          <Input
            id="dateTo"
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="w-[140px]"
          />
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => load()}
          disabled={loading}
        >
          Apply filters
        </Button>
      </div>

      {error && (
        <Card className="rounded-2xl border bg-card shadow-sm transition-all duration-200">
          <CardContent className="p-6">
            <ErrorState message={error} onRetry={() => load()} />
          </CardContent>
        </Card>
      )}

      {!error && loading && (
        <TableSkeleton rows={10} cols={5} className="shadow-sm transition-all duration-200" />
      )}

      {!error && !loading && orders.length === 0 && (
        <Card className="rounded-2xl border border-border bg-card shadow-sm transition-all duration-200 hover:shadow-md">
          <CardContent className="p-6">
            <EmptyState
              icon={<FileText className="size-8 text-muted-foreground" />}
              title="No orders to export"
              description="No orders match the current filters. Try adjusting the date range or refresh."
              action={{ label: "Refresh", onClick: () => load() }}
            />
          </CardContent>
        </Card>
      )}

      {!error && !loading && orders.length > 0 && (
        <Card className="rounded-2xl border border-border bg-card shadow-sm transition-all duration-200 hover:shadow-md overflow-hidden">
          <CardContent className="px-4 pt-4 pb-4 md:px-6 md:pt-6 md:pb-6">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent bg-muted/50">
                  <TableHead className="text-xs font-medium">Order #</TableHead>
                  <TableHead className="text-xs font-medium">Customer</TableHead>
                  <TableHead className="text-xs font-medium">Amount</TableHead>
                  <TableHead className="text-xs font-medium">Status</TableHead>
                  <TableHead className="text-xs font-medium">Placed</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order._id} className="border-border">
                    <TableCell className="font-medium">{order.orderNumber}</TableCell>
                    <TableCell>{order.customerName}</TableCell>
                    <TableCell>₹{order.netAmount}</TableCell>
                    <TableCell>{order.status}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </PageShell>
  )
}
