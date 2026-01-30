"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { api } from "@/lib/api"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

type OrderRow = {
  _id: string
  orderNumber: string
  customerName: string
  netAmount: number
  status: string
  createdAt: string
}

export default function ReportsPage() {
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

  const exportCsv = () => {
    const header = ["orderNumber", "customerName", "netAmount", "status", "createdAt"]
    const rows = orders.map((order) => [
      order.orderNumber,
      order.customerName,
      String(order.netAmount),
      order.status,
      order.createdAt,
    ])
    const csv = [header, ...rows].map((row) => row.join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.setAttribute("download", "orders-report.csv")
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports & Exports"
        description="Export operational reports for analytics and audits."
        actions={<Button onClick={exportCsv}>Export CSV</Button>}
      />
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order #</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Placed</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order._id}>
              <TableCell>{order.orderNumber}</TableCell>
              <TableCell>{order.customerName}</TableCell>
              <TableCell>₹{order.netAmount}</TableCell>
              <TableCell>{order.status}</TableCell>
              <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
            </TableRow>
          ))}
          {orders.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-muted-foreground">
                No orders to export
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
