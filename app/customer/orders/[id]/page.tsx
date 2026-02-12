"use client"
import React, { useEffect, useState } from "react"
import { Download, Truck } from "lucide-react"
import { api } from "@/lib/api"
import { toast } from "sonner"

import { Timeline } from "@/components/timeline"
import { StatusBadge } from "@/components/status-badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export default function CustomerOrderDetailPage({ params }: { params: { id: string } }) {
  const orderId = params.id
  const [order, setOrder] = useState<any>(null)
  const [shipment, setShipment] = useState<any>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get(`/api/orders/${orderId}`)
        setOrder(res.data?.data || null)
      } catch (error: any) {
        toast.error(error?.response?.data?.error || "Failed to load order")
      }
    }
    load().catch(() => undefined)
  }, [orderId])

  useEffect(() => {
    const loadShipment = async () => {
      try {
        const res = await api.get(`/api/shipments/${orderId}`)
        setShipment(res.data?.data || null)
      } catch {
        setShipment(null)
      }
    }
    if (orderId) loadShipment().catch(() => undefined)
  }, [orderId])

  const timeline = [
    { id: "1", label: "Placed", description: "Order submitted", timestamp: order?.createdAt || "-", completed: true },
    { id: "2", label: "Delivered", description: "Order delivered", timestamp: "-", completed: order?.status === "DELIVERED" },
  ]

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Order {order?.orderNumber || orderId}</h2>
          <p className="text-sm text-muted-foreground">
            {order?.createdAt ? `Placed on ${new Date(order.createdAt).toLocaleString()}` : "Loading..."}
          </p>
        </div>
        <StatusBadge status={order?.status || "PLACED"} />
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
                  <TableHead className="text-xs font-semibold">Product</TableHead>
                  <TableHead className="text-xs font-semibold">Qty</TableHead>
                  <TableHead className="text-xs font-semibold">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {order?.items?.map((item: any, idx: number) => (
                  <TableRow key={idx}>
                    <TableCell className="font-medium">
                      {typeof item.product === "string" ? item.product : item.product?.name}
                    </TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>{item.amount ? `₹${item.amount}` : "-"}</TableCell>
                  </TableRow>
                )) || null}
              </TableBody>
            </Table>
            <div className="flex justify-end pt-4">
              <Button variant="outline" className="gap-2">
                <Download className="w-4 h-4" />
                Download invoice
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border">
          <CardHeader>
            <CardTitle className="text-base">Order Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <Timeline items={timeline} />
          </CardContent>
        </Card>
      </div>

      {shipment && (
        <Card className="border">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Truck className="w-4 h-4" />
              Tracking
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
