"use client"

import { useState } from "react"
import {
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  Eye,
  Download,
  MoreHorizontal,
  FileCheck,
  Calendar,
} from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { DataTable } from "./data-table"

const retailersMockData = [
  {
    id: "RET001",
    name: "Apollo Pharmacy - Delhi",
    email: "delhi@apollopharmacy.com",
    phone: "+91-11-4141-1111",
    kyc_status: "verified",
    license_number: "LIC-DL-2024-001",
    license_expiry: "2025-12-31",
    pan: "AAAA0000A",
    gst: "07AAAA0000A1Z0",
    docs_verified: ["License", "GST", "PAN", "Address"],
    joined_date: "2024-01-15",
    last_order: "2025-01-22",
    compliance_score: 98,
  },
  {
    id: "RET002",
    name: "MedPlus - Mumbai",
    email: "mumbai@medplus.com",
    phone: "+91-22-6123-6123",
    kyc_status: "verified",
    license_number: "LIC-MH-2024-002",
    license_expiry: "2025-08-15",
    pan: "BBBB0000B",
    gst: "27BBBB0000B1Z0",
    docs_verified: ["License", "GST", "PAN", "Address"],
    joined_date: "2024-02-20",
    last_order: "2025-01-23",
    compliance_score: 96,
  },
  {
    id: "RET003",
    name: "Pharmacy Plus - Bangalore",
    email: "bangalore@pharmacyplus.com",
    phone: "+91-80-4000-4000",
    kyc_status: "pending",
    license_number: "LIC-KA-2024-003",
    license_expiry: "2026-03-10",
    pan: "CCCC0000C",
    gst: "29CCCC0000C1Z0",
    docs_verified: ["License", "GST"],
    joined_date: "2024-12-01",
    last_order: "2025-01-20",
    compliance_score: 75,
  },
  {
    id: "RET004",
    name: "Health Care Retail - Hyderabad",
    email: "hyderabad@healthcare.com",
    phone: "+91-40-6666-6666",
    kyc_status: "expired",
    license_number: "LIC-TG-2024-004",
    license_expiry: "2024-12-31",
    pan: "DDDD0000D",
    gst: "36DDDD0000D1Z0",
    docs_verified: ["License", "GST", "PAN"],
    joined_date: "2023-11-10",
    last_order: "2024-11-15",
    compliance_score: 45,
  },
  {
    id: "RET005",
    name: "Generic Pharmacy - Chennai",
    email: "chennai@generic.com",
    phone: "+91-44-2222-2222",
    kyc_status: "verified",
    license_number: "LIC-TN-2024-005",
    license_expiry: "2025-06-20",
    pan: "EEEE0000E",
    gst: "33EEEE0000E1Z0",
    docs_verified: ["License", "GST", "PAN", "Address", "Bank"],
    joined_date: "2024-03-05",
    last_order: "2025-01-21",
    compliance_score: 97,
  },
  {
    id: "RET006",
    name: "Quick Meds - Pune",
    email: "pune@quickmeds.com",
    phone: "+91-20-5555-5555",
    kyc_status: "rejected",
    license_number: "LIC-MH-2024-006",
    license_expiry: "2025-02-14",
    pan: "FFFF0000F",
    gst: "27FFFF0000F1Z0",
    docs_verified: ["License", "GST"],
    joined_date: "2024-10-12",
    last_order: null,
    compliance_score: 25,
  },
]

export function RetailersKYC() {
  const [selectedRetailer, setSelectedRetailer] = useState<any>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [statusFilter, setStatusFilter] = useState("all")

  const filteredRetailers = retailersMockData.filter((r) =>
    statusFilter === "all" ? true : r.kyc_status === statusFilter
  )

  const getStatusBadge = (status: string) => {
    const styles: Record<string, any> = {
      verified: { className: "bg-emerald-100 text-emerald-800", icon: CheckCircle2 },
      pending: { className: "bg-amber-100 text-amber-800", icon: Clock },
      expired: { className: "bg-orange-100 text-orange-800", icon: AlertCircle },
      rejected: { className: "bg-red-100 text-red-800", icon: XCircle },
    }

    const style = styles[status] || styles.pending
    const Icon = style.icon

    return (
      <div className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        <span className="text-xs font-medium">{status.charAt(0).toUpperCase() + status.slice(1)}</span>
      </div>
    )
  }

  const columns = [
    {
      key: "id",
      label: "Retailer ID",
      sortable: true,
      render: (value: string) => (
        <span className="font-medium text-blue-600">{value}</span>
      ),
    },
    {
      key: "name",
      label: "Retailer Name",
      sortable: true,
    },
    {
      key: "email",
      label: "Email",
      sortable: false,
      render: (value: string) => <span className="text-xs">{value}</span>,
    },
    {
      key: "license_expiry",
      label: "License Expiry",
      sortable: true,
      render: (value: string) => {
        const expiry = new Date(value)
        const today = new Date()
        const daysLeft = Math.floor((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
        const isExpired = daysLeft < 0
        const isExpiringSoon = daysLeft < 30 && daysLeft >= 0

        return (
          <span className={`text-xs ${isExpired ? "text-red-600 font-semibold" : isExpiringSoon ? "text-amber-600" : ""}`}>
            {value} {isExpired ? "(Expired)" : isExpiringSoon ? `(${daysLeft}d left)` : ""}
          </span>
        )
      },
    },
    {
      key: "kyc_status",
      label: "KYC Status",
      sortable: true,
      render: (value: string) => (
        <Badge className={value === "verified" ? "bg-emerald-100 text-emerald-800" : value === "pending" ? "bg-amber-100 text-amber-800" : value === "expired" ? "bg-orange-100 text-orange-800" : "bg-red-100 text-red-800"}>
          {value}
        </Badge>
      ),
    },
    {
      key: "compliance_score",
      label: "Compliance",
      sortable: true,
      render: (value: number) => (
        <div className="flex items-center gap-2">
          <div className="w-12 h-2 bg-muted rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${
                value >= 80 ? "bg-emerald-500" : value >= 60 ? "bg-amber-500" : "bg-red-500"
              }`}
              style={{ width: `${value}%` }}
            />
          </div>
          <span className="text-xs font-semibold">{value}%</span>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Retailers KYC Management</h2>
          <p className="text-muted-foreground mt-1">Manage retailer profiles, verification documents, and compliance</p>
        </div>
        <Button className="bg-emerald-600 hover:bg-emerald-700">Add New Retailer</Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Retailers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{retailersMockData.length}</div>
            <p className="text-xs text-muted-foreground">+2 this month</p>
          </CardContent>
        </Card>

        <Card className="border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Verified</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">
              {retailersMockData.filter((r) => r.kyc_status === "verified").length}
            </div>
            <p className="text-xs text-muted-foreground">Fully compliant</p>
          </CardContent>
        </Card>

        <Card className="border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">
              {retailersMockData.filter((r) => r.kyc_status === "pending").length}
            </div>
            <p className="text-xs text-muted-foreground">Awaiting verification</p>
          </CardContent>
        </Card>

        <Card className="border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Action Required</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {retailersMockData.filter((r) => r.kyc_status === "expired" || r.kyc_status === "rejected").length}
            </div>
            <p className="text-xs text-muted-foreground">Expired or rejected</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter Tabs */}
      <Tabs value={statusFilter} onValueChange={setStatusFilter} className="w-full">
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="all">All ({retailersMockData.length})</TabsTrigger>
          <TabsTrigger value="verified">
            Verified ({retailersMockData.filter((r) => r.kyc_status === "verified").length})
          </TabsTrigger>
          <TabsTrigger value="pending">
            Pending ({retailersMockData.filter((r) => r.kyc_status === "pending").length})
          </TabsTrigger>
          <TabsTrigger value="expired">
            Expired ({retailersMockData.filter((r) => r.kyc_status === "expired").length})
          </TabsTrigger>
          <TabsTrigger value="rejected">
            Rejected ({retailersMockData.filter((r) => r.kyc_status === "rejected").length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={statusFilter} className="mt-6">
          <Card className="border">
            <CardHeader>
              <CardTitle className="text-lg">Retailer List</CardTitle>
              <CardDescription>Click on a row to view details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead className="font-semibold text-xs">ID</TableHead>
                      <TableHead className="font-semibold text-xs">Retailer Name</TableHead>
                      <TableHead className="font-semibold text-xs">Contact</TableHead>
                      <TableHead className="font-semibold text-xs">License Expiry</TableHead>
                      <TableHead className="font-semibold text-xs">Status</TableHead>
                      <TableHead className="font-semibold text-xs">Compliance</TableHead>
                      <TableHead className="w-10 font-semibold text-xs">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRetailers.map((retailer) => (
                      <TableRow
                        key={retailer.id}
                        className="hover:bg-muted/50 cursor-pointer"
                        onClick={() => {
                          setSelectedRetailer(retailer)
                          setDetailsOpen(true)
                        }}
                      >
                        <TableCell className="py-3 text-sm font-medium text-blue-600">{retailer.id}</TableCell>
                        <TableCell className="py-3 text-sm">{retailer.name}</TableCell>
                        <TableCell className="py-3 text-xs text-muted-foreground">{retailer.phone}</TableCell>
                        <TableCell className="py-3 text-sm">
                          {retailer.license_expiry}
                          {new Date(retailer.license_expiry) < new Date() && (
                            <AlertCircle className="w-3 h-3 text-red-600 ml-2 inline" />
                          )}
                        </TableCell>
                        <TableCell className="py-3">
                          <Badge
                            className={
                              retailer.kyc_status === "verified"
                                ? "bg-emerald-100 text-emerald-800"
                                : retailer.kyc_status === "pending"
                                  ? "bg-amber-100 text-amber-800"
                                  : retailer.kyc_status === "expired"
                                    ? "bg-orange-100 text-orange-800"
                                    : "bg-red-100 text-red-800"
                            }
                          >
                            {retailer.kyc_status}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-12 h-2 bg-muted rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  retailer.compliance_score >= 80
                                    ? "bg-emerald-500"
                                    : retailer.compliance_score >= 60
                                      ? "bg-amber-500"
                                      : "bg-red-500"
                                }`}
                                style={{ width: `${retailer.compliance_score}%` }}
                              />
                            </div>
                            <span className="text-xs font-semibold">{retailer.compliance_score}%</span>
                          </div>
                        </TableCell>
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
                              <DropdownMenuItem>
                                <FileCheck className="w-4 h-4 mr-2" />
                                View Documents
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Download className="w-4 h-4 mr-2" />
                                Download Report
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Details Dialog */}
      {selectedRetailer && (
        <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedRetailer.name}</DialogTitle>
              <DialogDescription>{selectedRetailer.id}</DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {/* Status Overview */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">KYC Status</label>
                  <Badge
                    className={`mt-1 ${
                      selectedRetailer.kyc_status === "verified"
                        ? "bg-emerald-100 text-emerald-800"
                        : selectedRetailer.kyc_status === "pending"
                          ? "bg-amber-100 text-amber-800"
                          : selectedRetailer.kyc_status === "expired"
                            ? "bg-orange-100 text-orange-800"
                            : "bg-red-100 text-red-800"
                    }`}
                  >
                    {selectedRetailer.kyc_status}
                  </Badge>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Compliance Score</label>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          selectedRetailer.compliance_score >= 80
                            ? "bg-emerald-500"
                            : selectedRetailer.compliance_score >= 60
                              ? "bg-amber-500"
                              : "bg-red-500"
                        }`}
                        style={{ width: `${selectedRetailer.compliance_score}%` }}
                      />
                    </div>
                    <span className="font-bold">{selectedRetailer.compliance_score}%</span>
                  </div>
                </div>
              </div>

              {/* Contact Info */}
              <div>
                <h3 className="font-semibold mb-3">Contact Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Email</span>
                    <p className="font-medium">{selectedRetailer.email}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Phone</span>
                    <p className="font-medium">{selectedRetailer.phone}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Joined Date</span>
                    <p className="font-medium">{selectedRetailer.joined_date}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Last Order</span>
                    <p className="font-medium">{selectedRetailer.last_order || "No orders"}</p>
                  </div>
                </div>
              </div>

              {/* Compliance Documents */}
              <div>
                <h3 className="font-semibold mb-3">Verified Documents</h3>
                <div className="space-y-2">
                  {["License", "GST", "PAN", "Address", "Bank"].map((doc) => {
                    const isVerified = selectedRetailer.docs_verified.includes(doc)
                    return (
                      <div key={doc} className="flex items-center gap-2 p-2 bg-muted/50 rounded">
                        {isVerified ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-muted-foreground" />
                        )}
                        <span className="text-sm">{doc}</span>
                        {doc === "License" && (
                          <span className="ml-auto text-xs text-muted-foreground">
                            Expires: {selectedRetailer.license_expiry}
                          </span>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-4 border-t">
                <Button className="bg-emerald-600 hover:bg-emerald-700" disabled={selectedRetailer.kyc_status === "verified"}>
                  Approve
                </Button>
                <Button variant="outline">Request Documents</Button>
                <Button variant="destructive" disabled={selectedRetailer.kyc_status === "rejected"}>
                  Reject
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
