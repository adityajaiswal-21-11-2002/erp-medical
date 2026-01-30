"use client"

import { useEffect, useMemo, useState } from "react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { api } from "@/lib/api"
import { DataTable } from "@/components/data-table"
import { PageHeader } from "@/components/page-header"
import { StatusBadge } from "@/components/status-badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

const statusSchema = z.object({
  status: z.enum(["PLACED", "CANCELLED", "DELIVERED"]),
})

const invoiceSchema = z.object({
  invoiceNumber: z.string().min(1),
})

type OrderRow = {
  _id: string
  orderNumber: string
  customerName: string
  customerMobile: string
  status: "PLACED" | "CANCELLED" | "DELIVERED"
  netAmount: number
  items: Array<{
    product: { name?: string } | string
    quantity: number
    amount?: number
  }>
  createdAt: string
  invoiceNumber?: string
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderRow[]>([])
  const [loading, setLoading] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)
  const [statusOpen, setStatusOpen] = useState(false)
  const [invoiceOpen, setInvoiceOpen] = useState(false)
  const [selected, setSelected] = useState<OrderRow | null>(null)

  const statusForm = useForm<z.infer<typeof statusSchema>>({
    resolver: zodResolver(statusSchema),
    defaultValues: { status: "PLACED" },
  })

  const invoiceForm = useForm<z.infer<typeof invoiceSchema>>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: { invoiceNumber: "" },
  })

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const res = await api.get("/api/orders?limit=200")
      setOrders(res.data?.data?.items || [])
    } catch (error: any) {
      toast.error(error?.response?.data?.error || "Failed to load orders")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders().catch(() => undefined)
  }, [])

  const columns = useMemo(
    () => [
      { key: "orderNumber", label: "Order #", sortable: true },
      { key: "customerName", label: "Customer" },
      { key: "customerMobile", label: "Mobile" },
      {
        key: "status",
        label: "Status",
        filterable: true,
        filterOptions: ["PLACED", "CANCELLED", "DELIVERED"],
        render: (value: OrderRow["status"]) => <StatusBadge status={value} />,
      },
      { key: "netAmount", label: "Amount", render: (value: number) => `₹${value}` },
      {
        key: "createdAt",
        label: "Placed",
        render: (value: string) => new Date(value).toLocaleString(),
      },
    ],
    [],
  )

  return (
    <div className="space-y-6">
      <PageHeader
        title="Orders"
        description="Review and manage all orders."
        actions={
          <Button onClick={fetchOrders} disabled={loading} variant="outline">
            Refresh
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={orders}
        searchableFields={["orderNumber", "customerName", "customerMobile"]}
        actions={[
          {
            label: "View",
            onClick: (row) => {
              setSelected(row)
              setDetailOpen(true)
            },
          },
          {
            label: "Update Status",
            onClick: (row) => {
              setSelected(row)
              statusForm.reset({ status: row.status })
              setStatusOpen(true)
            },
          },
          {
            label: "Set Invoice",
            onClick: (row) => {
              setSelected(row)
              invoiceForm.reset({ invoiceNumber: row.invoiceNumber || "" })
              setInvoiceOpen(true)
            },
          },
        ]}
      />

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-2 md:grid-cols-2 text-sm">
                <div>
                  <p className="text-muted-foreground">Order</p>
                  <p className="font-medium">{selected.orderNumber}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Customer</p>
                  <p className="font-medium">{selected.customerName}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Mobile</p>
                  <p className="font-medium">{selected.customerMobile}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Status</p>
                  <StatusBadge status={selected.status} />
                </div>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Qty</TableHead>
                    <TableHead>Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selected.items.map((item, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="font-medium">
                        {typeof item.product === "string" ? item.product : item.product?.name}
                      </TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>{item.amount ? `₹${item.amount}` : "-"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="text-right text-lg font-semibold">
                Net Amount: ₹{selected.netAmount}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={statusOpen} onOpenChange={setStatusOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Status</DialogTitle>
          </DialogHeader>
          <form
            className="space-y-4"
            onSubmit={statusForm.handleSubmit(async (values) => {
              if (!selected) return
              try {
                await api.patch(`/api/orders/${selected._id}/status`, values)
                toast.success("Status updated")
                setStatusOpen(false)
                fetchOrders()
              } catch (error: any) {
                toast.error(error?.response?.data?.error || "Failed to update status")
              }
            })}
          >
            <Select
              value={statusForm.watch("status")}
              onValueChange={(value) =>
                statusForm.setValue("status", value as "PLACED" | "CANCELLED" | "DELIVERED")
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PLACED">PLACED</SelectItem>
                <SelectItem value="CANCELLED">CANCELLED</SelectItem>
                <SelectItem value="DELIVERED">DELIVERED</SelectItem>
              </SelectContent>
            </Select>
            <DialogFooter>
              <Button type="submit" disabled={statusForm.formState.isSubmitting}>
                {statusForm.formState.isSubmitting ? "Saving..." : "Update"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={invoiceOpen} onOpenChange={setInvoiceOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Set Invoice Number</DialogTitle>
          </DialogHeader>
          <form
            className="space-y-4"
            onSubmit={invoiceForm.handleSubmit(async (values) => {
              if (!selected) return
              try {
                await api.patch(`/api/orders/${selected._id}/invoice`, values)
                toast.success("Invoice updated")
                setInvoiceOpen(false)
                fetchOrders()
              } catch (error: any) {
                toast.error(error?.response?.data?.error || "Failed to update invoice")
              }
            })}
          >
            <Input
              placeholder="Invoice number"
              {...invoiceForm.register("invoiceNumber")}
            />
            <DialogFooter>
              <Button type="submit" disabled={invoiceForm.formState.isSubmitting}>
                {invoiceForm.formState.isSubmitting ? "Saving..." : "Update"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
