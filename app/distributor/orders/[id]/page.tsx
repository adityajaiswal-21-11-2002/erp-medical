import React from "react"
import { FileText, PackageCheck, Truck } from "lucide-react"

import { PageHeader } from "@/components/page-header"
import { StatusBadge } from "@/components/status-badge"
import { Timeline } from "@/components/timeline"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const mockItems = [
  { sku: "SKU-9081", name: "Paracetamol 650mg", qty: 120, allocated: 120, status: "Allocated" },
  { sku: "SKU-7712", name: "Amoxicillin 500mg", qty: 60, allocated: 48, status: "Partial" },
  { sku: "SKU-5532", name: "Vitamin D3 60k", qty: 40, allocated: 40, status: "Allocated" },
]

const timelineItems = [
  { id: "1", label: "Order placed", description: "Retailer submitted PO", timestamp: "Jan 29, 09:12 AM", completed: true },
  { id: "2", label: "Payment verified", description: "NEFT confirmation received", timestamp: "Jan 29, 10:05 AM", completed: true },
  { id: "3", label: "Stock allocated", description: "Pick list created", timestamp: "Jan 29, 12:30 PM", completed: true },
  { id: "4", label: "Packed", description: "Warehouse packing complete", timestamp: "Jan 29, 04:10 PM", completed: false },
  { id: "5", label: "Shipped", description: "Awaiting courier pickup", timestamp: "Pending", completed: false },
  { id: "6", label: "Delivered", description: "ETA Feb 01", timestamp: "Pending", completed: false },
]

export default function DistributorOrderDetailPage({ params }: { params: { id: string } }) {
  const orderId = params.id

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Order ${orderId}`}
        description="Review allocation, shipment, and internal notes."
        actions={<StatusBadge status="allocated" />}
      />

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Retailer</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-base font-semibold">Apollo Pharmacy - Delhi</div>
            <p className="text-xs text-muted-foreground">Retailer ID: RET-0082</p>
          </CardContent>
        </Card>
        <Card className="border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Order Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">₹1,24,500</div>
            <p className="text-xs text-muted-foreground">Payment: Paid</p>
          </CardContent>
        </Card>
        <Card className="border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Fulfillment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="flex items-center gap-2 text-sm">
              <PackageCheck className="w-4 h-4 text-muted-foreground" />
              3 line items
            </div>
            <div className="flex items-center gap-2 text-sm">
              <FileText className="w-4 h-4 text-muted-foreground" />
              Invoice INV-23901
            </div>
          </CardContent>
        </Card>
        <Card className="border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Shipment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm">Courier: BlueDart</div>
            <p className="text-xs text-muted-foreground">ETA: Feb 01, 2026</p>
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
                  <TableHead className="text-xs font-semibold">SKU</TableHead>
                  <TableHead className="text-xs font-semibold">Item</TableHead>
                  <TableHead className="text-xs font-semibold">Qty</TableHead>
                  <TableHead className="text-xs font-semibold">Allocated</TableHead>
                  <TableHead className="text-xs font-semibold">Stock Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockItems.map((item) => (
                  <TableRow key={item.sku}>
                    <TableCell className="font-medium">{item.sku}</TableCell>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{item.qty}</TableCell>
                    <TableCell>{item.allocated}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{item.status}</TableCell>
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

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="border lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Shipment Panel</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border bg-card p-4">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Truck className="w-4 h-4 text-muted-foreground" />
                Courier Partner
              </div>
              <p className="mt-2 text-sm">BlueDart Express</p>
              <p className="text-xs text-muted-foreground">Pickup scheduled for Jan 30</p>
            </div>
            <div className="rounded-lg border bg-card p-4">
              <div className="text-sm font-medium">LR / AWB</div>
              <p className="mt-2 text-sm">BD-229193332</p>
              <p className="text-xs text-muted-foreground">Tracking activated</p>
            </div>
            <div className="rounded-lg border bg-card p-4">
              <div className="text-sm font-medium">ETA</div>
              <p className="mt-2 text-sm">Feb 01, 2026</p>
              <p className="text-xs text-muted-foreground">Standard delivery</p>
            </div>
            <div className="rounded-lg border bg-card p-4">
              <div className="text-sm font-medium">Delivery Address</div>
              <p className="mt-2 text-sm">Apollo Pharmacy Warehouse</p>
              <p className="text-xs text-muted-foreground">Okhla, New Delhi</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border">
          <CardHeader>
            <CardTitle className="text-base">Internal Notes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-lg border bg-muted/30 p-3">
              <p className="text-sm font-medium">Warehouse</p>
              <p className="text-xs text-muted-foreground">
                Partial allocation on SKU-7712, restocked expected tomorrow.
              </p>
            </div>
            <div className="rounded-lg border bg-muted/30 p-3">
              <p className="text-sm font-medium">Collections</p>
              <p className="text-xs text-muted-foreground">
                Payment received via NEFT - verified by finance.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
