"use client"

import { useState } from "react"
import {
  AlertTriangle,
  Eye,
  Edit,
  Trash2,
  Search,
  Plus,
  Download,
  Clock,
  CheckCircle2,
  ImageOff,
} from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

const productsMockData = [
  {
    id: "SKU001",
    photoBase64: null as string | null,
    name: "Aspirin 500mg Tablets",
    category: "Pain Relief",
    manufacturer: "BioPharm Ltd",
    stock: 5420,
    min_stock: 500,
    max_stock: 10000,
    price: 45.50,
    status: "active",
    expiry_soon: false,
    last_updated: "2025-01-23",
  },
  {
    id: "SKU002",
    photoBase64: null as string | null,
    name: "Vitamin C 1000mg",
    category: "Supplements",
    manufacturer: "HealthCo Pharma",
    stock: 198,
    min_stock: 300,
    max_stock: 5000,
    price: 125.00,
    status: "low_stock",
    expiry_soon: false,
    last_updated: "2025-01-22",
  },
  {
    id: "SKU003",
    photoBase64: null as string | null,
    name: "Amoxicillin 500mg",
    category: "Antibiotics",
    manufacturer: "PharmaGlobal",
    stock: 3250,
    min_stock: 1000,
    max_stock: 8000,
    price: 220.75,
    status: "active",
    expiry_soon: true,
    last_updated: "2025-01-20",
  },
  {
    id: "SKU004",
    photoBase64: null as string | null,
    name: "Metformin 500mg",
    category: "Diabetes Care",
    manufacturer: "MediCare Solutions",
    stock: 0,
    min_stock: 800,
    max_stock: 6000,
    price: 85.00,
    status: "out_of_stock",
    expiry_soon: false,
    last_updated: "2025-01-15",
  },
  {
    id: "SKU005",
    photoBase64: null as string | null,
    name: "Atorvastatin 20mg",
    category: "Cardiac Care",
    manufacturer: "CarePharm",
    stock: 1850,
    min_stock: 500,
    max_stock: 4000,
    price: 310.00,
    status: "active",
    expiry_soon: false,
    last_updated: "2025-01-23",
  },
  {
    id: "SKU006",
    photoBase64: null as string | null,
    name: "Cetirizine 10mg",
    category: "Allergy Relief",
    manufacturer: "BioScience Inc",
    stock: 125,
    min_stock: 200,
    max_stock: 3000,
    price: 65.50,
    status: "low_stock",
    expiry_soon: true,
    last_updated: "2025-01-18",
  },
]

export function ProductCatalog() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedProduct, setSelectedProduct] = useState<any>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [statusFilter, setStatusFilter] = useState("all")

  const filteredProducts = productsMockData.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.manufacturer.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" ? true : p.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    const styles: Record<string, any> = {
      active: { className: "bg-emerald-100 text-emerald-800", icon: CheckCircle2 },
      low_stock: { className: "bg-amber-100 text-amber-800", icon: AlertTriangle },
      out_of_stock: { className: "bg-red-100 text-red-800", icon: AlertTriangle },
      discontinued: { className: "bg-gray-100 text-gray-800" },
    }

    const style = styles[status] || styles.active

    return (
      <Badge className={style.className}>
        {status === "out_of_stock" ? "Out of Stock" : status === "low_stock" ? "Low Stock" : status}
      </Badge>
    )
  }

  const stats = {
    total: productsMockData.length,
    active: productsMockData.filter((p) => p.status === "active").length,
    low_stock: productsMockData.filter((p) => p.status === "low_stock").length,
    out_of_stock: productsMockData.filter((p) => p.status === "out_of_stock").length,
    expiry_soon: productsMockData.filter((p) => p.expiry_soon).length,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Product Catalog Monitoring</h2>
          <p className="text-muted-foreground mt-1">Track inventory levels, pricing, and product status across the network</p>
        </div>
        <Button className="bg-emerald-600 hover:bg-emerald-700">
          <Plus className="w-4 h-4 mr-2" />
          Add Product
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total SKUs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Active products</p>
          </CardContent>
        </Card>

        <Card className="border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">In Stock</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">{stats.active}</div>
            <p className="text-xs text-muted-foreground">Available</p>
          </CardContent>
        </Card>

        <Card className="border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{stats.low_stock}</div>
            <p className="text-xs text-muted-foreground">Below threshold</p>
          </CardContent>
        </Card>

        <Card className="border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.out_of_stock}</div>
            <p className="text-xs text-muted-foreground">Needs restocking</p>
          </CardContent>
        </Card>

        <Card className="border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Expiry Soon</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.expiry_soon}</div>
            <p className="text-xs text-muted-foreground">Within 90 days</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Search */}
      <div className="flex gap-4 items-center">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
          <Input
            placeholder="Search by product name, SKU, or manufacturer..."
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

      {/* Tabs and Product Cards */}
      <Tabs value={statusFilter} onValueChange={setStatusFilter}>
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="all">All ({stats.total})</TabsTrigger>
          <TabsTrigger value="active">Active ({stats.active})</TabsTrigger>
          <TabsTrigger value="low_stock">Low Stock ({stats.low_stock})</TabsTrigger>
          <TabsTrigger value="out_of_stock">Out of Stock ({stats.out_of_stock})</TabsTrigger>
          <TabsTrigger value="expiry">Expiry Soon ({stats.expiry_soon})</TabsTrigger>
        </TabsList>

        <TabsContent value={statusFilter} className="mt-6">
          <Card className="border">
            <CardHeader>
              <CardTitle className="text-lg">Product List</CardTitle>
              <CardDescription>Click on a product to view details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredProducts.map((product) => (
                  <Card
                    key={product.id}
                    className="border hover:shadow-md transition-shadow cursor-pointer overflow-hidden"
                    onClick={() => {
                      setSelectedProduct(product)
                      setDetailsOpen(true)
                    }}
                  >
                    <CardContent className="p-0">
                      <div className="aspect-square bg-muted/40 flex items-center justify-center">
                        {product.photoBase64 ? (
                          <img
                            src={product.photoBase64.startsWith("data:") ? product.photoBase64 : `data:image/jpeg;base64,${product.photoBase64}`}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="flex flex-col items-center text-muted-foreground">
                            <ImageOff className="w-10 h-10" />
                            <span className="text-xs mt-1">No image</span>
                          </div>
                        )}
                      </div>
                      <div className="p-3 space-y-2">
                        <p className="text-xs font-medium text-blue-600">{product.id}</p>
                        <p className="text-sm font-semibold line-clamp-2">{product.name}</p>
                        <p className="text-xs text-muted-foreground">{product.manufacturer}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold">₹{product.price.toFixed(2)}</span>
                          {getStatusBadge(product.status)}
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                product.stock > product.max_stock * 0.8
                                  ? "bg-emerald-500"
                                  : product.stock > product.min_stock
                                    ? "bg-amber-500"
                                    : "bg-red-500"
                              }`}
                              style={{
                                width: `${Math.min((product.stock / product.max_stock) * 100, 100)}%`,
                              }}
                            />
                          </div>
                          <span className="text-xs font-medium">{product.stock.toLocaleString()}</span>
                        </div>
                        <div className="flex gap-2 pt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 h-8 text-xs"
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedProduct(product)
                              setDetailsOpen(true)
                            }}
                          >
                            <Eye className="w-3 h-3 mr-1" />
                            View
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 text-red-600 hover:text-red-700"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              {filteredProducts.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">No products found</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Product Details Dialog */}
      {selectedProduct && (
        <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{selectedProduct.name}</DialogTitle>
              <DialogDescription>{selectedProduct.id}</DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {/* Product Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Category</label>
                  <p className="font-medium mt-1">{selectedProduct.category}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Manufacturer</label>
                  <p className="font-medium mt-1">{selectedProduct.manufacturer}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Unit Price</label>
                  <p className="font-medium mt-1">₹{selectedProduct.price.toFixed(2)}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Status</label>
                  <div className="mt-1">{getStatusBadge(selectedProduct.status)}</div>
                </div>
              </div>

              {/* Stock Information */}
              <div>
                <h3 className="font-semibold mb-3">Stock Information</h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Current Stock</span>
                      <span className="font-bold">{selectedProduct.stock.toLocaleString()} units</span>
                    </div>
                    <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          selectedProduct.stock > selectedProduct.max_stock * 0.8
                            ? "bg-emerald-500"
                            : selectedProduct.stock > selectedProduct.min_stock
                              ? "bg-amber-500"
                              : "bg-red-500"
                        }`}
                        style={{
                          width: `${Math.min((selectedProduct.stock / selectedProduct.max_stock) * 100, 100)}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div className="bg-muted/50 p-2 rounded">
                      <span className="text-muted-foreground text-xs">Min Stock</span>
                      <p className="font-bold">{selectedProduct.min_stock.toLocaleString()}</p>
                    </div>
                    <div className="bg-muted/50 p-2 rounded">
                      <span className="text-muted-foreground text-xs">Max Stock</span>
                      <p className="font-bold">{selectedProduct.max_stock.toLocaleString()}</p>
                    </div>
                    <div className="bg-muted/50 p-2 rounded">
                      <span className="text-muted-foreground text-xs">Updated</span>
                      <p className="font-bold text-xs">{selectedProduct.last_updated}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Alerts */}
              {(selectedProduct.status === "low_stock" ||
                selectedProduct.status === "out_of_stock" ||
                selectedProduct.expiry_soon) && (
                <div className="bg-amber-50 border border-amber-200 rounded p-3 space-y-1">
                  {selectedProduct.status === "low_stock" && (
                    <div className="flex items-start gap-2 text-sm">
                      <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                      <span className="text-amber-800">Stock level is below minimum threshold</span>
                    </div>
                  )}
                  {selectedProduct.status === "out_of_stock" && (
                    <div className="flex items-start gap-2 text-sm">
                      <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                      <span className="text-red-800">Product is out of stock and needs immediate reordering</span>
                    </div>
                  )}
                  {selectedProduct.expiry_soon && (
                    <div className="flex items-start gap-2 text-sm">
                      <Clock className="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5" />
                      <span className="text-orange-800">Multiple batches expiring within 90 days</span>
                    </div>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-4 border-t">
                <Button className="bg-emerald-600 hover:bg-emerald-700" disabled={selectedProduct.status !== "low_stock"}>
                  Reorder Stock
                </Button>
                <Button variant="outline">View History</Button>
                <Button variant="outline">Edit Details</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
