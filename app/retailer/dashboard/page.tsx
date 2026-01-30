'use client'

import { useEffect, useState } from "react"
import Link from "next/link"
import { PageHeader } from "@/components/page-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ShoppingCart, Package, ArrowRight } from "lucide-react"
import { StatusBadge } from "@/components/status-badge"
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
    <div className="space-y-6">
      <PageHeader title="Retailer Dashboard" description="Your order activity at a glance." />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOrders}</div>
            <p className="text-xs text-muted-foreground">All orders placed</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Deliveries</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {recentOrders.filter((order) => order.status === "PLACED").length}
            </div>
            <p className="text-xs text-muted-foreground">Awaiting delivery</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>Last 5 orders placed</CardDescription>
          </div>
          <Button variant="outline" size="sm" className="bg-transparent" asChild>
            <Link href="/retailer/orders">View All</Link>
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentOrders.map((order) => (
                <TableRow key={order._id}>
                  <TableCell className="font-medium">{order.orderNumber}</TableCell>
                  <TableCell className="text-sm">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {order.items.reduce((sum, item) => sum + item.quantity, 0)}
                  </TableCell>
                  <TableCell className="font-semibold">₹{order.netAmount}</TableCell>
                  <TableCell>
                    <StatusBadge status={order.status} />
                  </TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm" className="bg-transparent" asChild>
                      <Link href={`/retailer/orders/${order._id}`}>
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {recentOrders.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    No orders yet
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
