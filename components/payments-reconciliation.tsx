"use client"

import { useState } from "react"
import {
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  TrendingUp,
  Download,
  Eye,
  MoreHorizontal,
  Search,
  RefreshCw,
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

const paymentsMockData = [
  {
    id: "PAY001",
    order_id: "ORD001",
    retailer: "Apollo Pharmacy - Delhi",
    amount: 45230,
    status: "completed",
    method: "Bank Transfer",
    date: "2025-01-23",
    settlement_date: "2025-01-25",
    transaction_id: "TXN-2025-001234",
    fees: 452.30,
    net_amount: 44777.70,
  },
  {
    id: "PAY002",
    order_id: "ORD002",
    retailer: "MedPlus - Mumbai",
    amount: 32150,
    status: "pending",
    method: "UPI",
    date: "2025-01-22",
    settlement_date: "2025-01-24",
    transaction_id: "TXN-2025-001235",
    fees: 321.50,
    net_amount: 31828.50,
  },
  {
    id: "PAY003",
    order_id: "ORD003",
    retailer: "Pharmacy Plus - Bangalore",
    amount: 18750,
    status: "completed",
    method: "Credit Card",
    date: "2025-01-21",
    settlement_date: "2025-01-23",
    transaction_id: "TXN-2025-001236",
    fees: 281.25,
    net_amount: 18468.75,
  },
  {
    id: "PAY004",
    order_id: "ORD004",
    retailer: "Health Care Retail - Hyderabad",
    amount: 72450,
    status: "failed",
    method: "Bank Transfer",
    date: "2025-01-20",
    settlement_date: null,
    transaction_id: "TXN-2025-001237",
    fees: 0,
    net_amount: 0,
    failure_reason: "Insufficient funds",
  },
  {
    id: "PAY005",
    order_id: "ORD005",
    retailer: "Generic Pharmacy - Chennai",
    amount: 58900,
    status: "completed",
    method: "Bank Transfer",
    date: "2025-01-19",
    settlement_date: "2025-01-21",
    transaction_id: "TXN-2025-001238",
    fees: 589.00,
    net_amount: 58311.00,
  },
  {
    id: "PAY006",
    order_id: "ORD006",
    retailer: "Quick Meds - Pune",
    amount: 28400,
    status: "processing",
    method: "Cheque",
    date: "2025-01-18",
    settlement_date: "2025-01-28",
    transaction_id: "CHQ-2025-001239",
    fees: 0,
    net_amount: 28400,
  },
]

export function PaymentsReconciliation() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedPayment, setSelectedPayment] = useState<any>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [statusFilter, setStatusFilter] = useState("all")

  const filteredPayments = paymentsMockData.filter((payment) => {
    const matchesSearch =
      payment.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.retailer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.transaction_id.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" ? true : payment.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      completed: "bg-emerald-100 text-emerald-800",
      pending: "bg-amber-100 text-amber-800",
      processing: "bg-blue-100 text-blue-800",
      failed: "bg-red-100 text-red-800",
    }

    return (
      <Badge className={styles[status] || "bg-gray-100 text-gray-800"}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  const stats = {
    total: paymentsMockData.length,
    completed: paymentsMockData.filter((p) => p.status === "completed").length,
    pending: paymentsMockData.filter((p) => p.status === "pending").length,
    processing: paymentsMockData.filter((p) => p.status === "processing").length,
    failed: paymentsMockData.filter((p) => p.status === "failed").length,
  }

  const totalAmount = paymentsMockData
    .filter((p) => p.status === "completed")
    .reduce((sum, p) => sum + p.amount, 0)

  const totalFees = paymentsMockData
    .filter((p) => p.status === "completed")
    .reduce((sum, p) => sum + p.fees, 0)

  const totalSettled = paymentsMockData
    .filter((p) => p.status === "completed")
    .reduce((sum, p) => sum + p.net_amount, 0)

  const pendingAmount = paymentsMockData
    .filter((p) => p.status === "pending" || p.status === "processing")
    .reduce((sum, p) => sum + p.amount, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Payments & Reconciliation</h2>
          <p className="text-muted-foreground mt-1">Manage payment settlements, reconciliation, and financial reporting</p>
        </div>
        <Button className="bg-emerald-600 hover:bg-emerald-700">
          <RefreshCw className="w-4 h-4 mr-2" />
          Reconcile
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">All transactions</p>
          </CardContent>
        </Card>

        <Card className="border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Settled Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">₹{(totalSettled / 100000).toFixed(1)}L</div>
            <p className="text-xs text-muted-foreground">{stats.completed} completed</p>
          </CardContent>
        </Card>

        <Card className="border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">₹{(pendingAmount / 100000).toFixed(1)}L</div>
            <p className="text-xs text-muted-foreground">{stats.pending + stats.processing} in progress</p>
          </CardContent>
        </Card>

        <Card className="border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Transaction Fees</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalFees.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Platform & bank charges</p>
          </CardContent>
        </Card>

        <Card className="border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Failed Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
            <p className="text-xs text-muted-foreground">Needs retry</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex gap-4 items-center">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
          <Input
            placeholder="Search by payment ID, retailer, or transaction ID..."
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
          <TabsTrigger value="completed">Completed ({stats.completed})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({stats.pending})</TabsTrigger>
          <TabsTrigger value="processing">Processing ({stats.processing})</TabsTrigger>
          <TabsTrigger value="failed">Failed ({stats.failed})</TabsTrigger>
          <TabsTrigger value="disputed">Disputed (0)</TabsTrigger>
        </TabsList>

        <TabsContent value={statusFilter} className="mt-6">
          <Card className="border">
            <CardHeader>
              <CardTitle className="text-lg">Payment Transactions</CardTitle>
              <CardDescription>Click on a transaction to view details and reconciliation info</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead className="font-semibold text-xs">Payment ID</TableHead>
                      <TableHead className="font-semibold text-xs">Retailer</TableHead>
                      <TableHead className="font-semibold text-xs">Amount</TableHead>
                      <TableHead className="font-semibold text-xs">Method</TableHead>
                      <TableHead className="font-semibold text-xs">Date</TableHead>
                      <TableHead className="font-semibold text-xs">Settlement</TableHead>
                      <TableHead className="font-semibold text-xs">Status</TableHead>
                      <TableHead className="w-10 font-semibold text-xs">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPayments.map((payment) => (
                      <TableRow
                        key={payment.id}
                        className="hover:bg-muted/50 cursor-pointer"
                        onClick={() => {
                          setSelectedPayment(payment)
                          setDetailsOpen(true)
                        }}
                      >
                        <TableCell className="py-3 text-sm font-medium text-blue-600">{payment.id}</TableCell>
                        <TableCell className="py-3 text-sm">{payment.retailer}</TableCell>
                        <TableCell className="py-3 text-sm font-bold">₹{payment.amount.toLocaleString()}</TableCell>
                        <TableCell className="py-3 text-sm text-muted-foreground">{payment.method}</TableCell>
                        <TableCell className="py-3 text-sm">{payment.date}</TableCell>
                        <TableCell className="py-3 text-sm">
                          {payment.settlement_date ? (
                            payment.settlement_date
                          ) : (
                            <span className="text-muted-foreground">Pending</span>
                          )}
                        </TableCell>
                        <TableCell className="py-3">{getStatusBadge(payment.status)}</TableCell>
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
                              <DropdownMenuItem>Download Receipt</DropdownMenuItem>
                              {payment.status === "failed" && (
                                <DropdownMenuItem className="text-amber-600">Retry Payment</DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {filteredPayments.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">No payments found</div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Payment Details Dialog */}
      {selectedPayment && (
        <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{selectedPayment.id}</DialogTitle>
              <DialogDescription>{selectedPayment.order_id}</DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {/* Status Overview */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Payment Status</label>
                  <div className="mt-1">{getStatusBadge(selectedPayment.status)}</div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Transaction ID</label>
                  <p className="font-medium mt-1">{selectedPayment.transaction_id}</p>
                </div>
              </div>

              {/* Amount Breakdown */}
              <div>
                <h3 className="font-semibold mb-3">Amount Details</h3>
                <div className="space-y-2 bg-muted/30 p-4 rounded-lg">
                  <div className="flex justify-between">
                    <span className="text-sm">Gross Amount</span>
                    <span className="font-semibold">₹{selectedPayment.amount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Platform & Bank Fees</span>
                    <span className="font-semibold text-red-600">-₹{selectedPayment.fees.toLocaleString()}</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between">
                    <span className="text-sm font-semibold">Net Settlement</span>
                    <span className="font-bold text-lg">₹{selectedPayment.net_amount.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Payment Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Retailer</label>
                  <p className="font-medium mt-1">{selectedPayment.retailer}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Payment Method</label>
                  <p className="font-medium mt-1">{selectedPayment.method}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Payment Date</label>
                  <p className="font-medium mt-1">{selectedPayment.date}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Expected Settlement</label>
                  <p className="font-medium mt-1">{selectedPayment.settlement_date || "Processing"}</p>
                </div>
              </div>

              {/* Failure Info */}
              {selectedPayment.failure_reason && (
                <div className="bg-red-50 border border-red-200 rounded p-3">
                  <p className="text-sm font-semibold text-red-800">Failure Reason</p>
                  <p className="text-sm text-red-700 mt-1">{selectedPayment.failure_reason}</p>
                </div>
              )}

              {/* Reconciliation Status */}
              <div>
                <h3 className="font-semibold mb-3">Reconciliation Status</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span className="text-sm">Payment initiated</span>
                  </div>
                  {selectedPayment.status !== "failed" && (
                    <>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span className="text-sm">Fund transfer processed</span>
                      </div>
                      {selectedPayment.status === "completed" && (
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span className="text-sm">Reconciliation completed</span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-4 border-t">
                <Button variant="outline">Download Receipt</Button>
                {selectedPayment.status === "failed" && (
                  <Button className="bg-emerald-600 hover:bg-emerald-700">Retry Payment</Button>
                )}
                <Button variant="outline">View Order</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
