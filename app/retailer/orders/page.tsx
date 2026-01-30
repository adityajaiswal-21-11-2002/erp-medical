'use client'

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { toast } from "sonner"
import { api } from "@/lib/api"
import { DataTable } from "@/components/data-table"
import { PageHeader } from "@/components/page-header"
import { StatusBadge } from "@/components/status-badge"
import { Button } from "@/components/ui/button"

type OrderRow = {
  _id: string
  orderNumber: string
  createdAt: string
  netAmount: number
  status: "PLACED" | "CANCELLED" | "DELIVERED"
  items: Array<{ quantity: number }>
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderRow[]>([])

  const fetchOrders = async () => {
    try {
      const res = await api.get("/api/orders?limit=200")
      setOrders(res.data?.data?.items || [])
    } catch (error: any) {
      toast.error(error?.response?.data?.error || "Failed to load orders")
    }
  }

  useEffect(() => {
    fetchOrders().catch(() => undefined)
  }, [])

  const columns = useMemo(
    () => [
      { key: "orderNumber", label: "Order #" },
      {
        key: "createdAt",
        label: "Date",
        render: (value: string) => new Date(value).toLocaleDateString(),
      },
      {
        key: "items",
        label: "Items",
        render: (value: OrderRow["items"]) =>
          value.reduce((sum, item) => sum + item.quantity, 0),
      },
      { key: "netAmount", label: "Amount", render: (value: number) => `₹${value}` },
      {
        key: "status",
        label: "Status",
        render: (value: OrderRow["status"]) => <StatusBadge status={value} />,
      },
    ],
    [],
  )

  return (
    <div className="space-y-6">
      <PageHeader
        title="Orders"
        description="Track your orders and delivery status."
        actions={
          <Button onClick={fetchOrders} variant="outline">
            Refresh
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={orders}
        searchableFields={["orderNumber"]}
        actions={[
          {
            label: "View",
            onClick: (row) => {
              window.location.href = `/retailer/orders/${row._id}`
            },
          },
        ]}
      />
    </div>
  )
}
