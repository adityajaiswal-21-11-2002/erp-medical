"use client"
import React, { useEffect, useState } from "react"
import { Download, Truck } from "lucide-react"
import { api } from "@/lib/api"
import { getErrorMessage } from "@/lib/utils"
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export default function CustomerOrderDetailPage({ params }: { params: { id: string } }) {
  const orderId = params.id
  const [order, setOrder] = useState<any>(null)
  const [shipment, setShipment] = useState<any>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get(`/api/orders/${orderId}`)
        setOrder(res.data?.data || null)
      } catch (err) {
        toast.error(getErrorMessage(err, "Failed to load order"))
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

  const downloadOrderSummary = () => {
    if (!order) return
    const header = ["Product", "Quantity", "Amount"]
    const rows = (order.items || []).map((item: any) => [
      typeof item.product === "string" ? item.product : item.product?.name || "-",
      String(item.quantity),
      item.amount ? `₹${item.amount}` : "-",
    ])
    const csv = [
      ["Order", order.orderNumber].join(","),
      ["Date", order.createdAt ? new Date(order.createdAt).toISOString() : "-"].join(","),
      ["Net Amount", `₹${order.netAmount || 0}`].join(","),
      "",
      [header.join(","), ...rows.map((r) => r.join(","))].join("\n"),
    ].join("\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.setAttribute("download", `order-${order.orderNumber || orderId}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    toast.success("Order summary downloaded")
  }

  const timeline = [
    { id: "1", label: "Placed", description: "Order submitted", timestamp: order?.createdAt || "-", completed: true },
    { id: "2", label: "Payment", description: "Payment confirmed", timestamp: order?.createdAt || "-", completed: !!order },
    { id: "3", label: "Shipped", description: shipment ? `Courier: ${shipment.courierName || "-"}` : "Awaiting shipment", timestamp: shipment?.createdAt || "-", completed: !!shipment },
    { id: "4", label: "Delivered", description: "Order delivered", timestamp: "-", completed: order?.status === "DELIVERED" },
  ]

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 space-y-6">
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
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      className="gap-2"
                      onClick={downloadOrderSummary}
                      disabled={!order}
                    >
                      <Download className="w-4 h-4" />
                      Download order summary
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Download order details as CSV</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
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
