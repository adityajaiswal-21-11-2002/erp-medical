"use client"

import { useEffect, useMemo, useState } from "react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  RefreshCw,
  ClipboardList,
  Package,
  User,
  Phone,
  FileText,
  Truck,
  Loader2,
  Receipt,
} from "lucide-react"
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { TruncatedText } from "@/components/ui/truncated-text"

const statusSchema = z.object({
  status: z.enum(["PLACED", "CANCELLED", "DELIVERED"]),
})

const invoiceSchema = z.object({
  invoiceNumber: z.string().min(1, "Invoice number is required"),
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
  const [cancelConfirmOpen, setCancelConfirmOpen] = useState(false)
  const [pendingStatusValues, setPendingStatusValues] = useState<z.infer<typeof statusSchema> | null>(null)
  const [selected, setSelected] = useState<OrderRow | null>(null)
  const [shipment, setShipment] = useState<{
    provider?: string
    awb?: string
    courierName?: string
    status?: string
  } | null>(null)
  const [createShipmentLoading, setCreateShipmentLoading] = useState(false)
  const [createShipmentProvider, setCreateShipmentProvider] = useState<"SHIPROCKET" | "RAPIDSHYP">("RAPIDSHYP")

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

  const handleStatusSubmit = async (values: z.infer<typeof statusSchema>) => {
    if (!selected) return
    if (values.status === "CANCELLED") {
      setPendingStatusValues(values)
      setCancelConfirmOpen(true)
      return
    }
    await submitStatusUpdate(values)
  }

  const submitStatusUpdate = async (values: z.infer<typeof statusSchema>) => {
    if (!selected) return
    try {
      await api.patch(`/api/orders/${selected._id}/status`, values)
      toast.success("Order status updated")
      setStatusOpen(false)
      setCancelConfirmOpen(false)
      setPendingStatusValues(null)
      fetchOrders()
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "response" in err && err.response && typeof err.response === "object" && "data" in err.response && err.response.data && typeof err.response.data === "object" && "error" in err.response.data
          ? String((err.response.data as { error?: string }).error)
          : "Failed to update status"
      toast.error(msg)
    }
  }

  const confirmCancelOrder = async () => {
    if (pendingStatusValues) {
      await submitStatusUpdate(pendingStatusValues)
    }
  }

  return (
    <PageShell maxWidth="content" className="space-y-6">
      <PageHeader
        title="Orders"
        subtitle="Review and manage all orders. Update status, view details, or set invoice numbers."
        breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "Orders" }]}
        actions={
          <div className="flex flex-shrink-0 flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchOrders()}
              disabled={loading}
              className="cursor-pointer transition-all duration-200 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed"
              aria-label="Refresh orders"
            >
              <RefreshCw className={loading ? "size-4 animate-spin" : "size-4"} aria-hidden />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
          </div>
        }
      />

      {/* Error state */}
      {error && (
        <Card className="rounded-2xl border bg-card shadow-sm transition-all duration-200">
          <CardContent className="p-6">
            <ErrorState message={error} onRetry={() => fetchOrders()} />
          </CardContent>
        </Card>
      )}

      {/* Loading skeleton */}
      {!error && loading && (
        <TableSkeleton rows={8} cols={6} className="shadow-sm transition-all duration-200" />
      )}

      {/* Empty state */}
      {!error && !loading && orders.length === 0 && (
        <Card className="rounded-2xl border border-border bg-card shadow-sm transition-all duration-200 hover:shadow-md">
          <CardContent className="p-6">
            <EmptyState
              icon={<ClipboardList className="size-8 text-muted-foreground" />}
              title="No orders yet"
              description="Orders will appear here once customers or retailers place them."
              action={{ label: "Refresh", onClick: () => fetchOrders() }}
            />
          </CardContent>
        </Card>
      )}

      {/* Table */}
      {!error && !loading && orders.length > 0 && (
        <Card className="rounded-2xl border border-border bg-card shadow-sm transition-all duration-200 hover:shadow-md overflow-hidden">
          <CardContent className="px-4 pt-4 pb-4 md:px-6 md:pt-6 md:pb-6">
            <ResponsiveDataTable<OrderRow>
              columns={columns}
              data={orders}
              searchPlaceholder="Search by order #, customer, mobile..."
              searchableFields={["orderNumber", "customerName", "customerMobile"]}
              keyExtractor={(row) => row._id}
              emptyMessage="No orders match your filters."
              pageSize={20}
              searchDebounceMs={300}
              toolbarAction={
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => fetchOrders()}
                  disabled={loading}
                  className="cursor-pointer transition-all duration-200 disabled:cursor-not-allowed"
                  aria-label="Refresh orders list"
                >
                  <RefreshCw className={loading ? "size-4 animate-spin" : "size-4"} aria-hidden />
                  Refresh
                </Button>
              }
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
          </CardContent>
        </Card>
      )}

      {/* Order detail drawer */}
      <DetailDrawer
        open={detailOpen}
        onOpenChange={setDetailOpen}
        title="Order Details"
        description={selected?.orderNumber}
      >
        {selected && (
          <div className="space-y-6">
            <Card className="rounded-2xl border border-border bg-card shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Order info</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2 text-sm">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                    <FileText className="size-4 text-muted-foreground" aria-hidden />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-muted-foreground">Order</p>
                    <p className="font-medium text-foreground truncate">{selected.orderNumber}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                    <User className="size-4 text-muted-foreground" aria-hidden />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-muted-foreground">Customer</p>
                    <TruncatedText maxWidth="max-w-[180px]" tooltip>{selected.customerName ?? ""}</TruncatedText>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                    <Phone className="size-4 text-muted-foreground" aria-hidden />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-muted-foreground">Mobile</p>
                    <p className="font-medium text-foreground">{selected.customerMobile}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                    <Receipt className="size-4 text-muted-foreground" aria-hidden />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-muted-foreground">Status</p>
                    <StatusBadge status={selected.status} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Separator />

            <Card className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Package className="size-4" aria-hidden />
                  Line items
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border hover:bg-transparent bg-muted/50">
                      <TableHead className="text-xs font-medium">Product</TableHead>
                      <TableHead className="text-xs font-medium w-16">Qty</TableHead>
                      <TableHead className="text-xs font-medium text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selected.items.map((item, idx) => (
                      <TableRow key={idx} className="border-border">
                        <TableCell className="font-medium text-sm max-w-[200px]">
                          <TruncatedText maxWidth="max-w-[200px]" tooltip>
                            {typeof item.product === "string" ? item.product : (item.product?.name ?? "-")}
                          </TruncatedText>
                        </TableCell>
                        <TableCell className="text-sm">{item.quantity}</TableCell>
                        <TableCell className="text-sm text-right tabular-nums">
                          {item.amount != null ? `₹${item.amount}` : "—"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
            <p className="text-right text-lg font-semibold text-foreground tabular-nums">
              Net Amount: ₹{selected.netAmount}
            </p>

            <Separator />

            <Card className="rounded-2xl border border-border bg-card shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Truck className="size-4" aria-hidden />
                  Shipment (Shiprocket / RapidShyp)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                {shipment ? (
                  <div className="grid gap-2 sm:grid-cols-2">
                    <div>
                      <p className="text-xs text-muted-foreground">Provider</p>
                      <p className="font-medium">{shipment.provider ?? "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">AWB</p>
                      <p className="font-mono text-xs">{shipment.awb ?? "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Courier</p>
                      <p className="font-medium">{shipment.courierName ?? "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Status</p>
                      <p className="font-medium">{shipment.status ?? "—"}</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="text-muted-foreground">
                      Created automatically after payment, or pending. You can manually create a shipment if it failed.
                    </p>
                    <div className="flex flex-wrap items-center gap-2">
                      <Select
                        value={createShipmentProvider}
                        onValueChange={(v) => setCreateShipmentProvider(v as "SHIPROCKET" | "RAPIDSHYP")}
                      >
                        <SelectTrigger className="w-[140px] h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="RAPIDSHYP">RapidShyp</SelectItem>
                          <SelectItem value="SHIPROCKET">Shiprocket</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={createShipmentLoading || selected.status === "CANCELLED"}
                        className="cursor-pointer transition-all duration-200 disabled:cursor-not-allowed"
                        onClick={async () => {
                          if (!selected) return
                          setCreateShipmentLoading(true)
                          try {
                            await api.post(`/api/shipments/${selected._id}/create`, { provider: createShipmentProvider })
                          const res = await api.get(`/api/shipments/${selected._id}`)
                          setShipment(res.data?.data || null)
                          toast.success("Shipment created successfully")
                        } catch (err: unknown) {
                          const msg =
                            err && typeof err === "object" && "response" in err && err.response && typeof err.response === "object" && "data" in err.response && err.response.data && typeof err.response.data === "object" && "error" in err.response.data
                              ? String((err.response.data as { error?: string }).error)
                              : "Failed to create shipment"
                          toast.error(msg)
                          } finally {
                            setCreateShipmentLoading(false)
                          }
                        }}
                      >
                        {createShipmentLoading ? (
                          <>
                            <Loader2 className="size-4 animate-spin" aria-hidden />
                            Creating…
                          </>
                        ) : (
                          "Create shipment"
                        )}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Use RapidShyp if Shiprocket returns 403 (e.g. warehouse not configured).
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </DetailDrawer>

      {/* Update status dialog */}
      <Dialog open={statusOpen} onOpenChange={setStatusOpen}>
        <DialogContent className="max-w-sm rounded-2xl">
          <DialogHeader>
            <DialogTitle>Update order status</DialogTitle>
            <DialogDescription>
              Change the current status of this order. Cancelling will mark the order as cancelled.
            </DialogDescription>
          </DialogHeader>
          <form
            className="space-y-4"
            onSubmit={statusForm.handleSubmit(handleStatusSubmit)}
          >
            <div className="space-y-2">
              <Label htmlFor="order-status">Order status</Label>
              <Select
                value={statusForm.watch("status")}
                onValueChange={(value) =>
                  statusForm.setValue("status", value as "PLACED" | "CANCELLED" | "DELIVERED")
                }
              >
                <SelectTrigger id="order-status" className="w-full transition-all duration-200">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PLACED">PLACED</SelectItem>
                  <SelectItem value="CANCELLED">CANCELLED</SelectItem>
                  <SelectItem value="DELIVERED">DELIVERED</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">Select the new status for this order.</p>
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStatusOpen(false)}
                className="cursor-pointer transition-all duration-200"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={statusForm.formState.isSubmitting}
                className="cursor-pointer transition-all duration-200 min-w-[100px]"
              >
                {statusForm.formState.isSubmitting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" aria-hidden />
                    Saving…
                  </>
                ) : (
                  "Update"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Set invoice dialog */}
      <Dialog open={invoiceOpen} onOpenChange={setInvoiceOpen}>
        <DialogContent className="max-w-sm rounded-2xl">
          <DialogHeader>
            <DialogTitle>Set invoice number</DialogTitle>
            <DialogDescription>
              Enter the invoice number for this order. This will be stored and shown in order details.
            </DialogDescription>
          </DialogHeader>
          <form
            className="space-y-4"
            onSubmit={invoiceForm.handleSubmit(async (values) => {
              if (!selected) return
              try {
                await api.patch(`/api/orders/${selected._id}/invoice`, values)
                toast.success("Invoice number updated")
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
            <div className="space-y-2">
              <Label htmlFor="invoice-number">Invoice number</Label>
              <Input
                id="invoice-number"
                placeholder="e.g. INV-2024-001"
                className="w-full transition-all duration-200"
                {...invoiceForm.register("invoiceNumber")}
              />
              {invoiceForm.formState.errors.invoiceNumber && (
                <p className="text-xs text-destructive">
                  {invoiceForm.formState.errors.invoiceNumber.message}
                </p>
              )}
              <p className="text-xs text-muted-foreground">Required. Used for accounting and tracking.</p>
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => setInvoiceOpen(false)}
                className="cursor-pointer transition-all duration-200"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={invoiceForm.formState.isSubmitting}
                className="cursor-pointer transition-all duration-200 min-w-[100px]"
              >
                {invoiceForm.formState.isSubmitting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" aria-hidden />
                    Saving…
                  </>
                ) : (
                  "Update"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Confirm cancel order */}
      <AlertDialog open={cancelConfirmOpen} onOpenChange={setCancelConfirmOpen}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel this order?</AlertDialogTitle>
            <AlertDialogDescription>
              This will mark the order as cancelled. This action can be changed later by updating the status again.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="cursor-pointer transition-all duration-200">Keep order</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => await confirmCancelOrder()}
              className="cursor-pointer transition-all duration-200 bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Cancel order
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageShell>
  )
}
