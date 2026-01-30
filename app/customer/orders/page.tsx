"use client"

import React, { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Filter } from "lucide-react"
import { api } from "@/lib/api"
import { toast } from "sonner"

import { StatusBadge } from "@/components/status-badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type OrderRow = {
  _id: string
  orderNumber: string
  createdAt: string
  netAmount: number
  status: string
  items: Array<{ quantity: number }>
}

export default function CustomerOrdersPage() {
  const [statusFilter, setStatusFilter] = useState("all")
  const [orders, setOrders] = useState<OrderRow[]>([])

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/api/orders?limit=200")
        setOrders(res.data?.data?.items || [])
      } catch (error: any) {
        toast.error(error?.response?.data?.error || "Failed to load orders")
      }
    }
    load().catch(() => undefined)
  }, [])

  const filteredOrders = useMemo(() => {
    if (statusFilter === "all") return orders
    return orders.filter((order) => order.status.toLowerCase() === statusFilter)
  }, [statusFilter, orders])

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Orders</h2>
          <p className="text-sm text-muted-foreground">Track your recent purchases.</p>
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-9 w-[160px] bg-muted border-0 text-xs">
              <SelectValue placeholder="Filter status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="placed">Placed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4">
        {filteredOrders.map((order) => (
          <Card key={order._id} className="border">
            <CardContent className="p-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-semibold">{order.orderNumber}</p>
                <p className="text-xs text-muted-foreground">
                  {order.items.reduce((sum, item) => sum + item.quantity, 0)} items •{" "}
                  {new Date(order.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <StatusBadge status={order.status as any} />
                <span className="text-sm font-medium">₹{order.netAmount}</span>
                <Link href={`/customer/orders/${order._id}`}>
                  <Button size="sm" variant="outline">View details</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
        {filteredOrders.length === 0 && (
          <Card className="border">
            <CardContent className="p-5 text-center text-muted-foreground">
              No orders yet
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
