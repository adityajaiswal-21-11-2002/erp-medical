"use client"

import { useState } from "react"
import {
  Clock,
  CheckCircle2,
  Truck,
  AlertCircle,
  Eye,
  Download,
  MoreHorizontal,
  Search,
  PackageOpen,
} from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

const ordersMockData = [
  {
    id: "ORD001",
    retailer: "Apollo Pharmacy - Delhi",
    retailer_id: "RET001",
    order_date: "2025-01-23",
    delivery_date: "2025-01-25",
    items: 12,
    total_amount: 45230,
    status: "pending",
    items_list: [
      { sku: "SKU001", name: "Aspirin 500mg", qty: 100, price: 45.50 },
      { sku: "SKU003", name: "Amoxicillin 500mg", qty: 50, price: 220.75 },
    ],
  },
  {
    id: "ORD002",
    retailer: "MedPlus - Mumbai",
    retailer_id: "RET002",
    order_date: "2025-01-22",
    delivery_date: "2025-01-24",
    items: 8,
    total_amount: 32150,
    status: "processing",
    items_list: [
      { sku: "SKU005", name: "Atorvastatin 20mg", qty: 75, price: 310.00 },
      { sku: "SKU002", name: "Vitamin C 1000mg", qty: 25, price: 125.00 },
    ],
  },
  {
    id: "ORD003",
    retailer: "Pharmacy Plus - Bangalore",
    retailer_id: "RET003",
    order_date: "2025-01-21",
    delivery_date: "2025-01-23",
    items: 5,
    total_amount: 18750,
    status: "shipped",
    items_list: [
      { sku: "SKU006", name: "Cetirizine 10mg", qty: 200, price: 65.50 },
    ],
  },
  {
    id: "ORD004",
    retailer: "Health Care Retail - Hyderabad",
    retailer_id: "RET004",
    order_date: "2025-01-20",
    delivery_date: "2025-01-22",
    items: 15,
    total_amount: 72450,
    status: "delivered",
    items_list: [
      { sku: "SKU001", name: "Aspirin 500mg", qty: 150, price: 45.50 },
      { sku: "SKU002", name: "Vitamin C 1000mg", qty: 60, price: 125.00 },
    ],
  },
  {
    id: "ORD005",
    retailer: "Generic Pharmacy - Chennai",
    retailer_id: "RET005",
    order_date: "2025-01-19",
    delivery_date: "2025-01-21",
    items: 10,
    total_amount: 58900,
    status: "delivered",
    items_list: [
      { sku: "SKU005", name: "Atorvastatin 20mg", qty: 120, price: 310.00 },
    ],
  },
  {
    id: "ORD006",
    retailer: "Quick Meds - Pune",
    retailer_id: "RET006",
    order_date: "2025-01-18",
    delivery_date: "2025-01-20",
    items: 7,
    total_amount: 28400,
    status: "cancelled",
    items_list: [
      { sku: "SKU001", name: "Aspirin 500mg", qty: 80, price: 45.50 },
    ],
  },
]

export function OrdersManagement() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedOrder, setSelectedOrder] = useState<any>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [statusFilter, setStatusFilter] = useState("all")

  const filteredOrders = ordersMockData.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.retailer.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" ? true : order.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    const styles: Record<string, any> = {
      pending: { className: "bg-slate-100 text-slate-800", icon: Clock },
      processing: { className: "bg-blue-100 text-blue-800", icon: PackageOpen },
      shipped: { className: "bg-purple-100 text-purple-800", icon: Truck },
      delivered: { className: "bg-emerald-100 text-emerald-800", icon: CheckCircle2 },
      cancelled: { className: "bg-red-100 text-red-800", icon: AlertCircle },
    }

    const style = styles[status] || styles.pending
    const Icon = style.icon

    return (
      <Badge className={style.className}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  const stats = {
    total: ordersMockData.length,
    pending: ordersMockData.filter((o) => o.status === "pending").length,
    processing: ordersMockData.filter((o) => o.status === "processing").length,
    shipped: ordersMockData.filter((o) => o.status === "shipped").length,
    delivered: ordersMockData.filter((o) => o.status === "delivered").length,
  }

  const totalRevenue = ordersMockData
    .filter((o) => o.status === "delivered")
    .reduce((sum, o) => sum + o.total_amount, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Orders Management</h2>
          <p className="text-muted-foreground mt-1">Track and manage all retail orders across the distribution network</p>
        </div>
        <Button className="bg-emerald-600 hover:bg-emerald-700">Create New Order</Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card className="border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-600">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">Awaiting processing</p>
          </CardContent>
        </Card>

        <Card className="border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">In Transit</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {stats.processing + stats.shipped}
            </div>
            <p className="text-xs text-muted-foreground">Shipped & processing</p>
          </CardContent>
        </Card>

        <Card className="border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Delivered</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">{stats.delivered}</div>
            <p className="text-xs text-muted-foreground">Completed</p>
          </CardContent>
        </Card>

        <Card className="border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Revenue (Delivered)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{(totalRevenue / 100000).toFixed(1)}L</div>
            <p className="text-xs text-muted-foreground">From completed orders</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex gap-4 items-center">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
          <Input
            placeholder="Search by order ID or retailer name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-muted border-0 h-10"
          />
        </div>
        <Button variant="outline" size="sm">
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
      </div>

      {/* Tabs and Table */}
      <Tabs value={statusFilter} onValueChange={setStatusFilter}>
        <TabsList className="grid grid-cols-6 w-full">
          <TabsTrigger value="all">All ({stats.total})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({stats.pending})</TabsTrigger>
          <TabsTrigger value="processing">Processing ({stats.processing})</TabsTrigger>
          <TabsTrigger value="shipped">Shipped ({stats.shipped})</TabsTrigger>
          <TabsTrigger value="delivered">Delivered ({stats.delivered})</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
        </TabsList>

        <TabsContent value={statusFilter} className="mt-6">
          <Card className="border">
            <CardHeader>
              <CardTitle className="text-lg">Order List</CardTitle>
              <CardDescription>Click on an order to view details and update status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead className="font-semibold text-xs">Order ID</TableHead>
                      <TableHead className="font-semibold text-xs">Retailer</TableHead>
                      <TableHead className="font-semibold text-xs">Date</TableHead>
                      <TableHead className="font-semibold text-xs">Delivery Date</TableHead>
                      <TableHead className="font-semibold text-xs">Items</TableHead>
                      <TableHead className="font-semibold text-xs">Amount</TableHead>
                      <TableHead className="font-semibold text-xs">Status</TableHead>
                      <TableHead className="w-10 font-semibold text-xs">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrders.map((order) => (
                      <TableRow
                        key={order.id}
                        className="hover:bg-muted/50 cursor-pointer"
                        onClick={() => {
                          setSelectedOrder(order)
                          setDetailsOpen(true)
                        }}
                      >
                        <TableCell className="py-3 text-sm font-medium text-blue-600">{order.id}</TableCell>
                        <TableCell className="py-3 text-sm">{order.retailer}</TableCell>
                        <TableCell className="py-3 text-sm text-muted-foreground">{order.order_date}</TableCell>
                        <TableCell className="py-3 text-sm">{order.delivery_date}</TableCell>
                        <TableCell className="py-3 text-sm font-medium">{order.items}</TableCell>
                        <TableCell className="py-3 text-sm font-bold">₹{order.total_amount.toLocaleString()}</TableCell>
                        <TableCell className="py-3">{getStatusBadge(order.status)}</TableCell>
                        <TableCell className="py-3">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Eye className="w-4 h-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem>Update Status</DropdownMenuItem>
                              <DropdownMenuItem>Print Invoice</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {filteredOrders.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">No orders found</div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Order Details Dialog */}
      {selectedOrder && (
        <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedOrder.id}</DialogTitle>
              <DialogDescription>{selectedOrder.retailer}</DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {/* Status Overview */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Order Status</label>
                  <div className="mt-1">{getStatusBadge(selectedOrder.status)}</div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Expected Delivery</label>
                  <p className="font-medium mt-1">{selectedOrder.delivery_date}</p>
                </div>
              </div>

              {/* Order Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Order Date</label>
                  <p className="font-medium mt-1">{selectedOrder.order_date}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Total Amount</label>
                  <p className="font-bold text-lg mt-1">₹{selectedOrder.total_amount.toLocaleString()}</p>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h3 className="font-semibold mb-3">Order Items</h3>
                <div className="space-y-2 border rounded-lg divide-y">
                  {selectedOrder.items_list.map((item: any, idx: number) => (
                    <div key={idx} className="p-3 flex justify-between items-start">
                      <div>
                        <p className="font-medium text-sm">{item.name}</p>
                        <p className="text-xs text-muted-foreground">{item.sku}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold">{item.qty} units</p>
                        <p className="text-xs text-muted-foreground">₹{item.price.toFixed(2)} each</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Timeline */}
              <div>
                <h3 className="font-semibold mb-3">Order Timeline</h3>
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-sm">Order Placed</p>
                      <p className="text-xs text-muted-foreground">{selectedOrder.order_date}</p>
                    </div>
                  </div>
                  {selectedOrder.status !== "pending" && (
                    <div className="flex gap-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-sm">Order Processing</p>
                        <p className="text-xs text-muted-foreground">Processing initiated</p>
                      </div>
                    </div>
                  )}
                  {(selectedOrder.status === "shipped" ||
                    selectedOrder.status === "delivered") && (
                    <div className="flex gap-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-sm">Order Shipped</p>
                        <p className="text-xs text-muted-foreground">In transit</p>
                      </div>
                    </div>
                  )}
                  {selectedOrder.status === "delivered" && (
                    <div className="flex gap-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-sm">Order Delivered</p>
                        <p className="text-xs text-muted-foreground">{selectedOrder.delivery_date}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-4 border-t">
                {selectedOrder.status !== "delivered" && selectedOrder.status !== "cancelled" && (
                  <Button className="bg-emerald-600 hover:bg-emerald-700">Update Status</Button>
                )}
                <Button variant="outline">Print Invoice</Button>
                <Button variant="outline">Send Notification</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
