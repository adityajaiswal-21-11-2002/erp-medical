"use client"

import React, { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Download, PackageCheck, Truck } from "lucide-react"
import { api } from "@/lib/api"
import { toast } from "sonner"

import { PageHeader } from "@/components/page-header"
import { StatusBadge } from "@/components/status-badge"
import { DataTable } from "@/components/data-table"
import { ModalConfirm } from "@/components/modal-confirm"
import { DrawerPanel } from "@/components/drawer-panel"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

type OrderStatus = "PENDING_APPROVAL" | "APPROVED" | "CONSOLIDATED" | "ALLOCATED" | "SHIPPED"

interface OrderRow {
  id: string
  retailer: string
  amount: number
  status: OrderStatus
  created: string
  city: string
}

export default function DistributorOrdersPage() {
  const router = useRouter()
  const [orders, setOrders] = useState<OrderRow[]>([])
  const [selectedOrder, setSelectedOrder] = useState<OrderRow | null>(null)
  const [confirmAction, setConfirmAction] = useState<"accept" | "reject" | null>(null)
  const [shipmentOpen, setShipmentOpen] = useState(false)
  const [allocationOpen, setAllocationOpen] = useState(false)

  const columns = useMemo(
    () => [
      { key: "id", label: "Order ID", sortable: true },
      { key: "retailer", label: "Retailer", sortable: true },
      { key: "amount", label: "Amount", sortable: true, render: (value: number) => `₹${value}` },
      {
        key: "status",
        label: "Status",
        sortable: true,
        filterable: true,
        filterOptions: ["PENDING_APPROVAL", "APPROVED", "CONSOLIDATED", "ALLOCATED", "SHIPPED"],
        render: (value: OrderStatus) => <StatusBadge status={value} />,
      },
      { key: "created", label: "Created", sortable: true },
    ],
    []
  )

  const actions = [
    {
      label: "View details",
      onClick: (row: OrderRow) => router.push(`/distributor/orders/${row.id}`),
    },
    {
      label: "Accept",
      onClick: (row: OrderRow) => {
        setSelectedOrder(row)
        setConfirmAction("accept")
      },
    },
    {
      label: "Reject",
      onClick: (row: OrderRow) => {
        setSelectedOrder(row)
        setConfirmAction("reject")
      },
      variant: "destructive" as const,
    },
    {
      label: "Allocate stock",
      onClick: (row: OrderRow) => {
        setSelectedOrder(row)
        setAllocationOpen(true)
      },
    },
    {
      label: "Add shipment details",
      onClick: (row: OrderRow) => {
        setSelectedOrder(row)
        setShipmentOpen(true)
      },
    },
    {
      label: "Mark shipped",
      onClick: (row: OrderRow) => {
        updateStatus(row.id, "SHIPPED")
      },
    },
  ]

  const fetchOrders = async () => {
    try {
      const res = await api.get("/api/distributor/orders")
      const rows = (res.data?.data || []).map((order: any) => ({
        id: order._id,
        retailer: order.customerName || "Retailer",
        amount: order.netAmount || 0,
        status: order.workflow?.distributorStatus || "PENDING_APPROVAL",
        created: order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "-",
        city: order.customerAddress || "-",
      }))
      setOrders(rows)
    } catch (error: any) {
      toast.error(error?.response?.data?.error || "Failed to load orders")
    }
  }

  const updateStatus = async (id: string, status: OrderStatus) => {
    try {
      await api.patch(`/api/distributor/orders/${id}`, { distributorStatus: status })
      toast.success("Order updated")
      fetchOrders()
    } catch (error: any) {
      toast.error(error?.response?.data?.error || "Failed to update order")
    }
  }

  useEffect(() => {
    fetchOrders().catch(() => undefined)
  }, [])

  const handleConfirm = () => {
    if (!selectedOrder || !confirmAction) return
    if (confirmAction === "accept") {
      updateStatus(selectedOrder.id, "APPROVED")
    }
    if (confirmAction === "reject") {
      toast.error("Reject flow is a stub in demo")
    }
    setConfirmAction(null)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Orders"
        description="Track order lifecycle, payment status, and allocation readiness."
        actions={
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Export
          </Button>
        }
      />

      <Card className="border">
        <CardContent className="p-6">
          <DataTable
            columns={columns}
            data={orders}
            searchableFields={["id", "retailer", "city"]}
            searchPlaceholder="Search orders, retailers, cities..."
            actions={actions}
            pagination
          />
        </CardContent>
      </Card>

      <ModalConfirm
        open={confirmAction !== null}
        onOpenChange={(open) => !open && setConfirmAction(null)}
        title={confirmAction === "reject" ? "Reject order?" : "Accept order?"}
        description={
          confirmAction === "reject"
            ? `Order ${selectedOrder?.id} will be removed from the queue.`
            : `Order ${selectedOrder?.id} will move to allocation.`
        }
        confirmLabel={confirmAction === "reject" ? "Reject" : "Accept"}
        variant={confirmAction === "reject" ? "destructive" : "default"}
        onConfirm={handleConfirm}
      />

      <DrawerPanel
        open={allocationOpen}
        onOpenChange={setAllocationOpen}
        title={`Allocate stock for ${selectedOrder?.id || ""}`}
        description="Reserve inventory and create pick lists for warehouse teams."
        actions={
          <Button
            className="gap-2"
            onClick={() => {
              if (selectedOrder) {
                updateStatus(selectedOrder.id, "ALLOCATED")
                setAllocationOpen(false)
              }
            }}
          >
            <PackageCheck className="w-4 h-4" />
            Confirm allocation
          </Button>
        }
      >
        <div className="space-y-3">
          {["Paracetamol 650mg", "Amoxicillin 500mg", "Vitamin D3 60k"].map((item) => (
            <div key={item} className="flex items-center justify-between rounded-lg border bg-card p-3">
              <div>
                <p className="text-sm font-medium">{item}</p>
                <p className="text-xs text-muted-foreground">Requested: 120 | Available: 340</p>
              </div>
              <div className="text-sm font-medium">Allocate 120</div>
            </div>
          ))}
        </div>
      </DrawerPanel>

      <Dialog open={shipmentOpen} onOpenChange={setShipmentOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add shipment details</DialogTitle>
            <DialogDescription>
              Capture courier partner and tracking IDs for {selectedOrder?.id}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-2">
              <label className="text-xs font-medium text-muted-foreground">Courier Partner</label>
              <Input placeholder="e.g. BlueDart" />
            </div>
            <div className="grid gap-2">
              <label className="text-xs font-medium text-muted-foreground">LR / AWB</label>
              <Input placeholder="Enter tracking number" />
            </div>
            <div className="grid gap-2">
              <label className="text-xs font-medium text-muted-foreground">Estimated Delivery</label>
              <Input placeholder="e.g. 02 Feb 2026" />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShipmentOpen(false)}>
                Cancel
              </Button>
              <Button className="gap-2" onClick={() => setShipmentOpen(false)}>
                <Truck className="w-4 h-4" />
                Save details
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
