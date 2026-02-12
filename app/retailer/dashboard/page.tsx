'use client'

import { useEffect, useState } from "react"
import Link from "next/link"
import { PageShell, PageHeader, StatCard, StatCards, StatusBadge } from "@/components/ui-kit"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ShoppingCart, Package, ArrowRight } from "lucide-react"
import { api } from "@/lib/api"

type OrderRow = {
  _id: string
  orderNumber: string
  createdAt: string
  netAmount: number
  status: "PLACED" | "CANCELLED" | "DELIVERED"
  items: Array<{ quantity: number }>
}

export default function RetailerDashboardPage() {
  const [recentOrders, setRecentOrders] = useState<OrderRow[]>([])
  const [totalOrders, setTotalOrders] = useState(0)

  useEffect(() => {
    const fetchOrders = async () => {
      const res = await api.get("/api/orders?limit=5")
      setRecentOrders(res.data?.data?.items || [])
      setTotalOrders(res.data?.data?.total || 0)
    }
    fetchOrders().catch(() => undefined)
  }, [])

  return (
    <PageShell maxWidth="content" className="space-y-4 md:space-y-6">
      <PageHeader
        title="Retailer Dashboard"
        subtitle="Your order activity at a glance."
        breadcrumbs={[{ label: "Retailer", href: "/retailer" }, { label: "Dashboard" }]}
      />

      <StatCards>
        <StatCard
          title="Total Orders"
          value={totalOrders}
          description="All orders placed"
          icon={<ShoppingCart className="size-4" />}
        />
        <StatCard
          title="Pending Deliveries"
          value={recentOrders.filter((o) => o.status === "PLACED").length}
          description="Awaiting delivery"
          icon={<Package className="size-4" />}
        />
      </StatCards>

      <Card className="border border-border bg-card">
        <CardHeader className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between md:p-6">
          <div>
            <CardTitle className="text-lg font-semibold">Recent Orders</CardTitle>
            <CardDescription className="text-sm text-muted-foreground">Last 5 orders placed</CardDescription>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/retailer/orders">View All</Link>
          </Button>
        </CardHeader>
        <CardContent className="p-4 md:p-6 pt-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-xs font-semibold">Order ID</TableHead>
                <TableHead className="text-xs font-semibold">Date</TableHead>
                <TableHead className="text-xs font-semibold">Items</TableHead>
                <TableHead className="text-xs font-semibold">Amount</TableHead>
                <TableHead className="text-xs font-semibold">Status</TableHead>
                <TableHead className="text-xs font-semibold w-12"><span className="sr-only">Action</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentOrders.map((order) => (
                <TableRow key={order._id} className="border-border">
                  <TableCell className="font-medium text-sm">{order.orderNumber}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-sm">
                    {order.items.reduce((sum, item) => sum + item.quantity, 0)}
                  </TableCell>
                  <TableCell className="font-semibold text-sm">₹{order.netAmount}</TableCell>
                  <TableCell>
                    <StatusBadge status={order.status} />
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" className="h-8 w-8" asChild aria-label={`View order ${order.orderNumber}`}>
                      <Link href={`/retailer/orders/${order._id}`}>
                        <ArrowRight className="size-4" />
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {recentOrders.length === 0 && (
                <TableRow className="border-border">
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8 text-sm">
                    No orders yet
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </PageShell>
  )
}
