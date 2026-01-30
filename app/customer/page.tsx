import React from "react"
import Link from "next/link"
import { ArrowRight, Package, ShieldCheck, Truck } from "lucide-react"

import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

const categories = [
  { name: "Analgesics", count: "240 SKUs" },
  { name: "Antibiotics", count: "180 SKUs" },
  { name: "Supplements", count: "320 SKUs" },
  { name: "Diabetes Care", count: "90 SKUs" },
  { name: "Cardiology", count: "110 SKUs" },
  { name: "Dermatology", count: "75 SKUs" },
]

const featuredProducts = [
  { sku: "SKU-9081", name: "Paracetamol 650mg", brand: "MediCore", price: "₹118", mrp: "₹140" },
  { sku: "SKU-7712", name: "Amoxicillin 500mg", brand: "HealWell", price: "₹210", mrp: "₹255" },
  { sku: "SKU-5532", name: "Vitamin D3 60k", brand: "NutriPlus", price: "₹320", mrp: "₹360" },
  { sku: "SKU-3310", name: "Cetirizine 10mg", brand: "AllerFree", price: "₹60", mrp: "₹75" },
]

export default function CustomerHomePage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-6 space-y-8">
      <PageHeader
        title="Welcome to PharmaHub"
        description="Order trusted pharma products with fast, compliant delivery."
        actions={
          <Link href="/customer/catalog">
            <Button className="gap-2">
              Browse Catalog
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        }
      />

      <Card className="border overflow-hidden">
        <CardContent className="p-8 md:p-10">
          <div className="grid gap-6 md:grid-cols-2 items-center">
            <div className="space-y-4">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Enterprise storefront
              </p>
              <h2 className="text-3xl font-semibold">
                Consistent supply for your pharmacy operations
              </h2>
              <p className="text-sm text-muted-foreground">
                Access curated pharma inventory, transparent pricing, and delivery SLAs.
              </p>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" className="gap-2">
                  <Package className="w-4 h-4" />
                  18k+ SKUs
                </Button>
                <Button variant="outline" size="sm" className="gap-2">
                  <Truck className="w-4 h-4" />
                  24-48h delivery
                </Button>
                <Button variant="outline" size="sm" className="gap-2">
                  <ShieldCheck className="w-4 h-4" />
                  GDP compliant
                </Button>
              </div>
            </div>
            <div className="aspect-[4/3] rounded-lg border bg-muted/40 flex items-center justify-center">
              <span className="text-sm text-muted-foreground">Hero banner carousel</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Featured Categories</h3>
          <Link href="/customer/catalog" className="text-sm text-muted-foreground hover:text-foreground">
            View all
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <Card key={category.name} className="border">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{category.name}</p>
                  <p className="text-xs text-muted-foreground">{category.count}</p>
                </div>
                <Button variant="ghost" size="sm">
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Featured Products</h3>
          <Link href="/customer/catalog" className="text-sm text-muted-foreground hover:text-foreground">
            View catalog
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {featuredProducts.map((product) => (
            <Card key={product.sku} className="border">
              <CardContent className="p-4 space-y-3">
                <div className="aspect-square rounded-lg border bg-muted/40 flex items-center justify-center text-xs text-muted-foreground">
                  {product.sku}
                </div>
                <div>
                  <p className="text-sm font-medium">{product.name}</p>
                  <p className="text-xs text-muted-foreground">{product.brand}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-base font-semibold">{product.price}</span>
                  <span className="text-xs text-muted-foreground line-through">{product.mrp}</span>
                </div>
                <Link href={`/customer/product/${product.sku}`}>
                  <Button size="sm" className="w-full">View details</Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  )
}
