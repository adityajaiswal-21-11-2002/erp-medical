'use client'

import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { toast } from "sonner"
import { api } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { StatusBadge } from "@/components/status-badge"
import { Truck } from "lucide-react"

type OrderDetail = {
  _id: string
  orderNumber: string
  createdAt: string
  status: "PLACED" | "CANCELLED" | "DELIVERED"
  customerName: string
  customerMobile: string
  customerAddress: string
  items: Array<{
    product: { name?: string } | string
    quantity: number
    amount?: number
  }>
  subtotal?: number
  totalGst?: number
  netAmount: number
}

type Shipment = {
  awb?: string
  courierName?: string
  status: string
}

export default function OrderDetailPage() {
  const params = useParams()
  const orderId = params.id as string
  const [order, setOrder] = useState<OrderDetail | null>(null)
  const [shipment, setShipment] = useState<Shipment | null>(null)

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await api.get(`/api/orders/${orderId}`)
        setOrder(res.data?.data || null)
      } catch (error: any) {
        toast.error(error?.response?.data?.error || "Failed to load order")
      }
    }
    fetchOrder().catch(() => undefined)
  }, [orderId])

  useEffect(() => {
    const fetchShipment = async () => {
      try {
        const res = await api.get(`/api/shipments/${orderId}`)
        setShipment(res.data?.data || null)
      } catch {
        setShipment(null)
      }
    }
    if (orderId) fetchShipment().catch(() => undefined)
  }, [orderId])

  if (!order) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" className="bg-transparent" asChild>
          <Link href="/retailer/orders">Back to Orders</Link>
        </Button>
        <Card>
          <CardContent className="pt-6">Loading order...</CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <Button variant="ghost" size="sm" className="bg-transparent mb-4" asChild>
          <Link href="/retailer/orders">Back to Orders</Link>
        </Button>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold">{order.orderNumber}</h1>
            <p className="text-muted-foreground mt-1">
              Placed on {new Date(order.createdAt).toLocaleString()}
            </p>
          </div>
          <StatusBadge status={order.status} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm font-medium text-muted-foreground mb-1">Order Amount</p>
            <p className="text-2xl font-bold">₹{order.netAmount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm font-medium text-muted-foreground mb-1">Customer</p>
            <p className="text-base font-semibold">{order.customerName}</p>
            <p className="text-xs text-muted-foreground">{order.customerMobile}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm font-medium text-muted-foreground mb-1">Delivery Address</p>
            <p className="text-sm">{order.customerAddress}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Order Items</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead className="text-center">Qty</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {order.items.map((item, idx) => (
                <TableRow key={idx}>
                  <TableCell>
                    {typeof item.product === "string" ? item.product : item.product?.name}
                  </TableCell>
                  <TableCell className="text-center">{item.quantity}</TableCell>
                  <TableCell className="text-right">
                    {item.amount ? `₹${item.amount}` : "-"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="mt-4 space-y-2 text-sm border-t pt-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>₹{order.subtotal || order.netAmount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total GST</span>
              <span>₹{order.totalGst || 0}</span>
            </div>
            <div className="flex justify-between font-bold text-base">
              <span>Total</span>
              <span>₹{order.netAmount}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {shipment && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Truck className="w-4 h-4" />
              Shipping
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">Courier: {shipment.courierName || "-"}</p>
            <p className="text-sm">AWB: <span className="font-mono">{shipment.awb || "-"}</span></p>
            <p className="text-sm text-muted-foreground">Status: {shipment.status}</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
