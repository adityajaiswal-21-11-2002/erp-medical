"use client"
import React, { useEffect, useState } from "react"
import { AlertTriangle, Boxes, IndianRupee, PackageCheck } from "lucide-react"
import { api } from "@/lib/api"
import { toast } from "sonner"

import { PageHeader } from "@/components/page-header"
import { StatusBadge } from "@/components/status-badge"
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
      } catch (error: any) {
        toast.error(error?.response?.data?.error || "Failed to load dashboard data")
      }
    }
    load().catch(() => undefined)
  }, [])
  return (
    <div className="space-y-6">
      <PageHeader
        title="Distributor Dashboard"
        description="Track fulfillment performance, stock posture, and retailer activity."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
            <PackageCheck className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{pendingCount}</div>
            <p className="text-xs text-muted-foreground">+12% vs last week</p>
          </CardContent>
        </Card>
        <Card className="border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Shipped Today</CardTitle>
            <Boxes className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">64</div>
            <p className="text-xs text-muted-foreground">92% on-time dispatch</p>
          </CardContent>
        </Card>
        <Card className="border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Out-of-stock SKUs</CardTitle>
            <AlertTriangle className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">17</div>
            <p className="text-xs text-muted-foreground">4 critical categories</p>
          </CardContent>
        </Card>
        <Card className="border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Due Amount</CardTitle>
            <IndianRupee className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">₹{dueAmount}</div>
            <p className="text-xs text-muted-foreground">Invoices due in 7 days</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="border lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
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
                  <TableRow key={order._id}>
                    <TableCell className="font-medium">{order._id}</TableCell>
                    <TableCell>{order.customerName}</TableCell>
                    <TableCell>₹{order.netAmount}</TableCell>
                    <TableCell>
                      <StatusBadge status={order.workflow?.distributorStatus || "PENDING_APPROVAL"} />
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

        <Card className="border">
          <CardHeader>
            <CardTitle className="text-base">Alerts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              "Shipment updates pending in ERP",
              "Inventory allocation checks required",
              "Settlements awaiting reconciliation",
            ].map((alert) => (
              <div key={alert} className="flex items-start gap-3 rounded-lg border bg-muted/30 p-3">
                <AlertTriangle className="w-4 h-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">{alert}</p>
                  <p className="text-xs text-muted-foreground">Review recommended actions.</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
