'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { QuantityStepper } from '@/components/quantity-stepper'
import { ProductCard } from '@/components/product-card'
import { ShoppingCart, Info, FileText, Truck, ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { useParams } from 'next/navigation'

export default function ProductDetailPage() {
  const params = useParams()
  const sku = params.sku as string
  const [quantity, setQuantity] = useState(1)

  // Mock product data
  const product = {
    sku,
    name: 'Aspirin 500mg',
    brand: 'GenericCo',
    packSize: '10 tablets per blister',
    mrp: 45,
    ptr: 40,
    discount: 11,
    availability: 'in-stock' as const,
    composition: 'Acetylsalicylic Acid 500mg',
    manufacturer: 'GenericCo Pharma Ltd.',
    mfgDate: 'Jan 2024',
    expDate: 'Dec 2026',
    batch: 'BAT2024001',
    usage: 'For relief from mild to moderate pain, fever, and inflammation',
    precautions: 'Not for children below 12 years. Consult doctor if allergic to salicylates.',
    packagingQty: 'Box of 10 blisters (10 tablets per blister)',
  }

  const relatedProducts = [
    { sku: 'PARACET001', name: 'Paracetamol 650mg', brand: 'PharmaCare', packSize: '15 tablets', mrp: 55, ptr: 48, availability: 'in-stock' as const },
    { sku: 'IBUPR001', name: 'Ibuprofen 400mg', brand: 'GenericCo', packSize: '20 tablets', mrp: 65, ptr: 58, availability: 'in-stock' as const },
    { sku: 'DICLOF001', name: 'Diclofenac 50mg', brand: 'PharmaCare', packSize: '10 tablets', mrp: 75, ptr: 67, availability: 'low-stock' as const },
  ]

  return (
    <div className="space-y-6">
          {/* Breadcrumb */}
          <Button variant="ghost" size="sm" className="bg-transparent mb-2" asChild>
            <Link href="/retailer/catalog" className="gap-1">
              <ChevronLeft className="w-4 h-4" />
              Back to Catalog
            </Link>
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Product Image & Details */}
            <div className="lg:col-span-1 space-y-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="aspect-square bg-muted rounded-lg flex items-center justify-center mb-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-muted-foreground">{sku}</div>
                      <p className="text-xs text-muted-foreground mt-2">Product Image</p>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Batch No.</span>
                      <span className="font-medium">{product.batch}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Mfg Date</span>
                      <span className="font-medium">{product.mfgDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Exp Date</span>
                      <span className="font-medium text-emerald-600">{product.expDate}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Product Info & Purchase */}
            <div className="lg:col-span-2 space-y-4">
              <div>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h1 className="text-3xl font-bold">{product.name}</h1>
                    <p className="text-lg text-muted-foreground">{product.brand}</p>
                  </div>
                  <Badge variant="secondary">{product.packSize}</Badge>
                </div>
              </div>

              {/* Pricing Cards */}
              <div className="grid grid-cols-3 gap-3">
                <Card>
                  <CardContent className="pt-4">
                    <p className="text-xs text-muted-foreground mb-1">MRP</p>
                    <p className="text-xl font-bold">₹{product.mrp}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <p className="text-xs text-muted-foreground mb-1">Your Price</p>
                    <p className="text-xl font-bold text-emerald-600">₹{product.ptr}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <p className="text-xs text-muted-foreground mb-1">Discount</p>
                    <p className="text-xl font-bold text-orange-600">{product.discount}%</p>
                  </CardContent>
                </Card>
              </div>

              {/* Availability */}
              <Card>
                <CardContent className="pt-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Availability</p>
                    <p className="text-xs text-muted-foreground">In Stock • Ready to ship</p>
                  </div>
                  <Badge className="bg-emerald-100 text-emerald-800">In Stock</Badge>
                </CardContent>
              </Card>

              {/* Add to Cart */}
              <Card>
                <CardContent className="pt-4 space-y-4">
                  <div>
                    <p className="text-sm font-medium mb-3">Quantity</p>
                    <QuantityStepper value={quantity} onChange={setQuantity} max={100} />
                  </div>
                  <Button className="w-full gap-2" size="lg">
                    <ShoppingCart className="w-5 h-5" />
                    Add to Cart
                  </Button>
                  <Button variant="outline" className="w-full bg-transparent">
                    Save for Later
                  </Button>
                </CardContent>
              </Card>

              {/* Manufacturer Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Manufacturer</CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Company</span>
                    <span className="font-medium">{product.manufacturer}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Packaging Qty</span>
                    <span className="font-medium">{product.packagingQty}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Tabs: Details, Usage, Shipping */}
          <Card>
            <Tabs defaultValue="details" className="w-full">
              <TabsList className="w-full justify-start border-b rounded-none bg-transparent p-0">
                <TabsTrigger value="details" className="border-b-2 border-transparent data-[state=active]:border-primary">
                  <Info className="w-4 h-4 mr-2" />
                  Details
                </TabsTrigger>
                <TabsTrigger value="usage" className="border-b-2 border-transparent data-[state=active]:border-primary">
                  <FileText className="w-4 h-4 mr-2" />
                  Usage & Precautions
                </TabsTrigger>
                <TabsTrigger value="shipping" className="border-b-2 border-transparent data-[state=active]:border-primary">
                  <Truck className="w-4 h-4 mr-2" />
                  Shipping & Returns
                </TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="p-6 space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Composition</h4>
                  <p className="text-sm text-muted-foreground">{product.composition}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Product Details</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between pb-2 border-b">
                      <span className="text-muted-foreground">Brand</span>
                      <span>{product.brand}</span>
                    </div>
                    <div className="flex justify-between pb-2 border-b">
                      <span className="text-muted-foreground">Pack Size</span>
                      <span>{product.packSize}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Manufacturer</span>
                      <span>{product.manufacturer}</span>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="usage" className="p-6 space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Usage</h4>
                  <p className="text-sm text-muted-foreground">{product.usage}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Precautions & Warnings</h4>
                  <p className="text-sm text-muted-foreground">{product.precautions}</p>
                </div>
              </TabsContent>

              <TabsContent value="shipping" className="p-6 space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Shipping Information</h4>
                  <p className="text-sm text-muted-foreground">Orders are typically shipped within 24-48 hours. Delivery time varies based on location.</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Returns & Exchanges</h4>
                  <p className="text-sm text-muted-foreground">Products can be returned within 7 days if unopened and in original packaging.</p>
                </div>
              </TabsContent>
            </Tabs>
          </Card>

          {/* Related Products */}
          <div>
            <h2 className="text-2xl font-bold mb-4">Related Products</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {relatedProducts.map((product) => (
                <ProductCard key={product.sku} {...product} />
              ))}
            </div>
          </div>
        </div>
  )
}
