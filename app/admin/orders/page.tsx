"use client"

import { useEffect, useMemo, useState } from "react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { api } from "@/lib/api"
import {
  PageShell,
  PageHeader,
  ResponsiveDataTable,
  StatusBadge,
  DetailDrawer,
  TableSkeleton,
  EmptyState,
  ErrorState,
  toast,
} from "@/components/ui-kit"
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
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [statusOpen, setStatusOpen] = useState(false)
  const [invoiceOpen, setInvoiceOpen] = useState(false)
  const [selected, setSelected] = useState<OrderRow | null>(null)
  const [shipment, setShipment] = useState<{
    provider?: string
    awb?: string
    courierName?: string
    status?: string
  } | null>(null)

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
    setError(null)
    try {
      const res = await api.get("/api/orders?limit=200")
      setOrders(res.data?.data?.items ?? [])
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "response" in err && err.response && typeof err.response === "object" && "data" in err.response && err.response.data && typeof err.response.data === "object" && "error" in err.response.data
          ? String((err.response.data as { error?: string }).error)
          : "Failed to load orders"
      setError(msg)
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders().catch(() => {})
  }, [])

  const columns = useMemo(
    () => [
      { key: "orderNumber", label: "Order #", sortable: true, primary: true as const },
      { key: "customerName", label: "Customer" },
      { key: "customerMobile", label: "Mobile" },
      {
        key: "status",
        label: "Status",
        render: (value: OrderRow["status"]) => <StatusBadge status={value} />,
      },
      { key: "netAmount", label: "Amount", render: (value: number) => `₹${value}` },
      {
        key: "createdAt",
        label: "Placed",
        render: (value: string) => new Date(value).toLocaleString(),
      },
    ],
    []
  )

  return (
    <PageShell maxWidth="content" className="space-y-4 md:space-y-6">
      <PageHeader
        title="Orders"
        subtitle="Review and manage all orders."
        breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "Orders" }]}
        actions={
          <Button onClick={() => fetchOrders()} disabled={loading} variant="outline" size="sm">
            Refresh
          </Button>
        }
      />

      {error && (
        <ErrorState
          message={error}
          onRetry={() => fetchOrders()}
        />
      )}

      {!error && loading && <TableSkeleton rows={8} cols={6} />}

      {!error && !loading && orders.length === 0 && (
        <EmptyState
          title="No orders yet"
          description="Orders will appear here once placed."
          action={{ label: "Refresh", onClick: () => fetchOrders() }}
        />
      )}

      {!error && !loading && orders.length > 0 && (
        <ResponsiveDataTable<OrderRow>
          columns={columns}
          data={orders}
          searchPlaceholder="Search by order #, customer, mobile..."
          searchableFields={["orderNumber", "customerName", "customerMobile"]}
          keyExtractor={(row) => row._id}
          emptyMessage="No orders match your filters."
          pageSize={20}
          actions={[
            {
              label: "View",
              onClick: async (row) => {
                setSelected(row)
                setShipment(null)
                setDetailOpen(true)
                try {
                  const res = await api.get(`/api/shipments/${row._id}`)
                  setShipment(res.data?.data || null)
                } catch {
                  setShipment(null)
                }
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
                invoiceForm.reset({ invoiceNumber: row.invoiceNumber ?? "" })
                setInvoiceOpen(true)
              },
            },
          ]}
          onRowClick={async (row) => {
            setSelected(row)
            setShipment(null)
            setDetailOpen(true)
            try {
              const res = await api.get(`/api/shipments/${row._id}`)
              setShipment(res.data?.data || null)
            } catch {
              setShipment(null)
            }
          }}
        />
      )}

      <DetailDrawer
        open={detailOpen}
        onOpenChange={setDetailOpen}
        title="Order Details"
        description={selected?.orderNumber}
      >
        {selected && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 text-sm">
              <div>
                <p className="text-muted-foreground text-xs">Order</p>
                <p className="font-medium text-foreground">{selected.orderNumber}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Customer</p>
                <p className="font-medium text-foreground">{selected.customerName}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Mobile</p>
                <p className="font-medium text-foreground">{selected.customerMobile}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Status</p>
                <StatusBadge status={selected.status} />
              </div>
            </div>
            <div className="rounded-lg border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="text-xs">Product</TableHead>
                    <TableHead className="text-xs">Qty</TableHead>
                    <TableHead className="text-xs">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selected.items.map((item, idx) => (
                    <TableRow key={idx} className="border-border">
                      <TableCell className="font-medium text-sm">
                        {typeof item.product === "string" ? item.product : item.product?.name ?? "-"}
                      </TableCell>
                      <TableCell className="text-sm">{item.quantity}</TableCell>
                      <TableCell className="text-sm">{item.amount != null ? `₹${item.amount}` : "-"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <p className="text-right text-lg font-semibold text-foreground">
              Net Amount: ₹{selected.netAmount}
            </p>
            <div className="rounded-lg border border-border p-3 space-y-2">
              <p className="text-xs font-medium text-muted-foreground">Shipment (Shiprocket / RapidShyp)</p>
              {shipment ? (
                <>
                  <p className="text-sm font-medium">Provider: {shipment.provider ?? "-"}</p>
                  <p className="text-sm">AWB: <span className="font-mono">{shipment.awb ?? "-"}</span></p>
                  <p className="text-sm">Courier: {shipment.courierName ?? "-"}</p>
                  <p className="text-sm">Status: {shipment.status ?? "-"}</p>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">Created automatically after payment, or pending.</p>
              )}
            </div>
          </div>
        )}
      </DetailDrawer>

      <Dialog open={statusOpen} onOpenChange={setStatusOpen}>
        <DialogContent className="max-w-sm">
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
              } catch (err: unknown) {
                const msg =
                  err && typeof err === "object" && "response" in err && err.response && typeof err.response === "object" && "data" in err.response && err.response.data && typeof err.response.data === "object" && "error" in err.response.data
                    ? String((err.response.data as { error?: string }).error)
                    : "Failed to update status"
                toast.error(msg)
              }
            })}
          >
            <Select
              value={statusForm.watch("status")}
              onValueChange={(value) =>
                statusForm.setValue("status", value as "PLACED" | "CANCELLED" | "DELIVERED")
              }
            >
              <SelectTrigger className="w-full">
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
                {statusForm.formState.isSubmitting ? "Saving…" : "Update"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={invoiceOpen} onOpenChange={setInvoiceOpen}>
        <DialogContent className="max-w-sm">
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
              } catch (err: unknown) {
                const msg =
                  err && typeof err === "object" && "response" in err && err.response && typeof err.response === "object" && "data" in err.response && err.response.data && typeof err.response.data === "object" && "error" in err.response.data
                    ? String((err.response.data as { error?: string }).error)
                    : "Failed to update invoice"
                toast.error(msg)
              }
            })}
          >
            <Input
              placeholder="Invoice number"
              className="w-full"
              {...invoiceForm.register("invoiceNumber")}
            />
            <DialogFooter>
              <Button type="submit" disabled={invoiceForm.formState.isSubmitting}>
                {invoiceForm.formState.isSubmitting ? "Saving…" : "Update"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </PageShell>
  )
}
