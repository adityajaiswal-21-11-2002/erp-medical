"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"
import { FileText, PackageCheck, Truck, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { api } from "@/lib/api"
import { PageHeader } from "@/components/page-header"
import { StatusBadge } from "@/components/status-badge"
import { Timeline } from "@/components/timeline"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

type Order = {
  _id: string
  orderNumber: string
  status: string
  customerName: string
  customerMobile: string
  customerAddress: string
  netAmount: number
  items: Array<{
    product: { name?: string } | string
    quantity: number
    amount?: number
  }>
  createdAt?: string
}

type Shipment = {
  _id: string
  orderId: string
  provider: string
  awb?: string
  courierName?: string
  status: string
  tracking?: Record<string, unknown>
}

export default function DistributorOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [orderId, setOrderId] = useState<string | null>(null)
  const [order, setOrder] = useState<Order | null>(null)
  const [shipment, setShipment] = useState<Shipment | null>(null)
  const [loading, setLoading] = useState(true)
  const [tracking, setTracking] = useState(false)
  const [createShipmentLoading, setCreateShipmentLoading] = useState(false)

  const resolvedParams = React.use(params)
  const id = resolvedParams?.id

  const loadOrder = async () => {
    if (!id) return
    try {
      const res = await api.get(`/api/orders/${id}`)
      setOrder(res.data?.data || null)
    } catch (e: any) {
      toast.error(e?.response?.data?.error || "Failed to load order")
    }
  }

  const loadShipment = async () => {
    if (!id) return
    try {
      const res = await api.get(`/api/shipments/${id}`)
      setShipment(res.data?.data || null)
    } catch {
      setShipment(null)
    }
  }

  useEffect(() => {
    setOrderId(id || null)
  }, [id])

  useEffect(() => {
    if (!orderId) {
      setLoading(false)
      return
    }
    let done = false
    const run = async () => {
      await loadOrder()
      await loadShipment()
      if (!done) setLoading(false)
    }
    run().catch(() => setLoading(false))
    return () => { done = true }
  }, [orderId])

  const handleTrack = async () => {
    if (!orderId) return
    setTracking(true)
    try {
      await api.post(`/api/shipments/${orderId}/track`)
      toast.success("Tracking updated")
      await loadShipment()
    } catch (e: any) {
      toast.error(e?.response?.data?.error || "Failed to track")
    } finally {
      setTracking(false)
    }
  }

  const handleCreateShipment = async () => {
    if (!orderId) return
    setCreateShipmentLoading(true)
    try {
      await api.post(`/api/shipments/${orderId}/create`, {})
      toast.success("Shipment created successfully")
      await loadShipment()
    } catch (e: unknown) {
      const msg =
        e && typeof e === "object" && "response" in e && e.response && typeof e.response === "object" && "data" in e.response && e.response.data && typeof e.response.data === "object" && "error" in e.response.data
          ? String((e.response.data as { error?: string }).error)
          : "Failed to create shipment"
      toast.error(msg)
    } finally {
      setCreateShipmentLoading(false)
    }
  }

  const timelineItems = [
    { id: "1", label: "Order placed", description: order?.orderNumber || "", timestamp: order?.createdAt ? new Date(order.createdAt).toLocaleString() : "-", completed: true },
    { id: "2", label: "Shipment created", description: shipment ? "AWB assigned" : "Pending", timestamp: shipment?.awb || "Pending", completed: !!shipment },
    { id: "3", label: "In transit", description: shipment?.status === "IN_TRANSIT" ? "On the way" : "Pending", timestamp: shipment?.status === "IN_TRANSIT" ? "Active" : "Pending", completed: shipment?.status === "IN_TRANSIT" || shipment?.status === "DELIVERED" },
    { id: "4", label: "Delivered", description: shipment?.status === "DELIVERED" ? "Done" : "Pending", timestamp: shipment?.status === "DELIVERED" ? "Done" : "Pending", completed: shipment?.status === "DELIVERED" },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/distributor/orders">Back to Orders</Link>
        </Button>
        <Card>
          <CardContent className="pt-6">Order not found.</CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Order ${order.orderNumber || orderId}`}
        description="Review allocation, shipment, and internal notes."
        actions={<StatusBadge status={order.status} />}
      />

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Customer</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-base font-semibold">{order.customerName}</div>
            <p className="text-xs text-muted-foreground">{order.customerMobile}</p>
          </CardContent>
        </Card>
        <Card className="border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Order Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">₹{order.netAmount}</div>
          </CardContent>
        </Card>
        <Card className="border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Fulfillment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="flex items-center gap-2 text-sm">
              <PackageCheck className="w-4 h-4 text-muted-foreground" />
              {order.items?.length ?? 0} line items
            </div>
          </CardContent>
        </Card>
        <Card className="border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Shipment</CardTitle>
          </CardHeader>
          <CardContent>
            {shipment ? (
              <>
                <div className="text-sm">{shipment.courierName || "-"}</div>
                <p className="text-xs text-muted-foreground">{shipment.status}</p>
              </>
            ) : (
              <p className="text-xs text-muted-foreground">Not created</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="border lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Items</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="text-xs font-semibold">Item</TableHead>
                  <TableHead className="text-xs font-semibold">Qty</TableHead>
                  <TableHead className="text-xs font-semibold">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {order.items?.map((item: any, idx: number) => (
                  <TableRow key={idx}>
                    <TableCell className="font-medium">
                      {typeof item.product === "object" && item.product?.name ? item.product.name : String(item.product)}
                    </TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>{item.amount ? `₹${item.amount}` : "-"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="border">
          <CardHeader>
            <CardTitle className="text-base">Status Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <Timeline items={timelineItems} />
          </CardContent>
        </Card>
      </div>

      <Card className="border">
        <CardHeader>
          <CardTitle className="text-base">Shipping</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!shipment ? (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Shipment is created automatically after payment (Shiprocket/RapidShyp). You can create one manually if it did not appear.
              </p>
              <Button
                variant="outline"
                size="sm"
                disabled={createShipmentLoading || order?.status === "CANCELLED"}
                onClick={handleCreateShipment}
              >
                {createShipmentLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Creating…
                  </>
                ) : (
                  "Create shipment"
                )}
              </Button>
            </div>
          ) : (
            <>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-lg border bg-card p-4">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Truck className="w-4 h-4 text-muted-foreground" />
                    Courier
                  </div>
                  <p className="mt-2 text-sm">{shipment.courierName || "-"}</p>
                  <p className="text-xs text-muted-foreground">{shipment.status}</p>
                </div>
                <div className="rounded-lg border bg-card p-4">
                  <div className="text-sm font-medium">AWB</div>
                  <p className="mt-2 text-sm font-mono">{shipment.awb || "-"}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={handleTrack} disabled={tracking}>
                  {tracking ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  Refresh tracking
                </Button>
              </div>
              {shipment.tracking && Object.keys(shipment.tracking).length > 0 && (
                <div className="rounded-lg border p-3 text-sm">
                  <p className="font-medium mb-1">Tracking snapshot</p>
                  <pre className="text-xs overflow-auto max-h-32">
                    {JSON.stringify(shipment.tracking, null, 2)}
                  </pre>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
