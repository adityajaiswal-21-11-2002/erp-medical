"use client"
import React, { useEffect, useState } from "react"
import { AlertTriangle, Boxes, IndianRupee, PackageCheck } from "lucide-react"
import { api } from "@/lib/api"
import { PageShell, PageHeader, StatCard, StatCards, StatusBadge, toast } from "@/components/ui-kit"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

type DashboardOrder = {
  _id: string
  customerName: string
  netAmount: number
  workflow?: { distributorStatus?: string }
  createdAt?: string
}

export default function DistributorDashboardPage() {
  const [recentOrders, setRecentOrders] = useState<DashboardOrder[]>([])
  const [pendingCount, setPendingCount] = useState(0)
  const [dueAmount, setDueAmount] = useState(0)

  useEffect(() => {
    const load = async () => {
      try {
        const [ordersRes, settlementsRes] = await Promise.all([
          api.get("/api/distributor/orders"),
          api.get("/api/distributor/settlements"),
        ])
        const orders = ordersRes.data?.data || []
        setRecentOrders(orders.slice(0, 5))
        setPendingCount(
          orders.filter((o: any) =>
            ["PENDING_APPROVAL", "APPROVED"].includes(o.workflow?.distributorStatus),
          ).length,
        )
        const settlements = settlementsRes.data?.data || []
        setDueAmount(
          settlements.reduce((sum: number, row: any) => sum + (row.outstanding || 0), 0),
        )
      } catch (err: unknown) {
        const msg =
          err && typeof err === "object" && "response" in err && err.response && typeof err.response === "object" && "data" in err.response && err.response.data && typeof err.response.data === "object" && "error" in err.response.data
            ? String((err.response.data as { error?: string }).error)
            : "Failed to load dashboard data"
        toast.error(msg)
      }
    }
    load().catch(() => undefined)
  }, [])
  return (
    <PageShell maxWidth="content" className="space-y-4 md:space-y-6">
      <PageHeader
        title="Distributor Dashboard"
        subtitle="Track fulfillment performance, stock posture, and retailer activity."
        breadcrumbs={[{ label: "Distributor", href: "/distributor" }, { label: "Dashboard" }]}
      />

      <StatCards>
        <StatCard
          title="Pending Orders"
          value={pendingCount}
          description="+12% vs last week"
          icon={<PackageCheck className="size-4" />}
        />
        <StatCard
          title="Shipped Today"
          value={64}
          description="92% on-time dispatch"
          icon={<Boxes className="size-4" />}
        />
        <StatCard
          title="Out-of-stock SKUs"
          value={17}
          description="4 critical categories"
          icon={<AlertTriangle className="size-4" />}
        />
        <StatCard
          title="Due Amount"
          value={`₹${dueAmount}`}
          description="Invoices due in 7 days"
          icon={<IndianRupee className="size-4" />}
        />
      </StatCards>

      <div className="grid gap-4 md:gap-6 lg:grid-cols-3">
        <Card className="border border-border bg-card lg:col-span-2">
          <CardHeader className="p-4 md:p-6">
            <CardTitle className="text-lg font-semibold">Recent Orders</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 md:p-6 md:pt-0 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border bg-muted/50 hover:bg-transparent">
                  <TableHead className="text-xs font-semibold">Order ID</TableHead>
                  <TableHead className="text-xs font-semibold">Retailer</TableHead>
                  <TableHead className="text-xs font-semibold">Amount</TableHead>
                  <TableHead className="text-xs font-semibold">Status</TableHead>
                  <TableHead className="text-xs font-semibold">Payment</TableHead>
                  <TableHead className="text-xs font-semibold">Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentOrders.map((order) => (
                  <TableRow key={order._id} className="border-border">
                    <TableCell className="font-medium text-sm">{order._id}</TableCell>
                    <TableCell className="text-sm">{order.customerName}</TableCell>
                    <TableCell className="text-sm">₹{order.netAmount}</TableCell>
                    <TableCell>
                      <StatusBadge status={(order.workflow?.distributorStatus as "PENDING_APPROVAL") || "PENDING_APPROVAL"} />
                    </TableCell>
                    <TableCell>
                      <StatusBadge status="paid" />
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {order.createdAt ? new Date(order.createdAt).toLocaleString() : "-"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="border border-border bg-card">
          <CardHeader className="p-4 md:p-6">
            <CardTitle className="text-lg font-semibold">Alerts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 p-4 pt-0 md:p-6 md:pt-0">
            {[
              "Shipment updates pending in ERP",
              "Inventory allocation checks required",
              "Settlements awaiting reconciliation",
            ].map((alert) => (
              <div key={alert} className="flex items-start gap-3 rounded-lg border border-border bg-muted/30 p-3">
                <AlertTriangle className="size-4 text-muted-foreground mt-0.5 shrink-0" aria-hidden />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">{alert}</p>
                  <p className="text-xs text-muted-foreground">Review recommended actions.</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </PageShell>
  )
}
