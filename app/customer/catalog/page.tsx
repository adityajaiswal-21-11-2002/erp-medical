"use client"

import React, { Suspense, useEffect, useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Filter, Search } from "lucide-react"

import { CatalogProductCard } from "@/components/catalog-product-card"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { api } from "@/lib/api"
import { toast } from "sonner"
import { useCart } from "@/app/cart-context"
import { trackEvent } from "@/lib/analytics"

type Product = {
  _id: string
  name: string
  genericName?: string
  category: string
  mrp: number
  packaging: string
  stockStatus?: "IN_STOCK" | "LOW" | "OUT"
  photoBase64?: string | null
}

function CustomerCatalogContent() {
  const searchParams = useSearchParams()
  const initialSearch = searchParams.get("search") || ""
  const [searchTerm, setSearchTerm] = useState(initialSearch)
  const [category, setCategory] = useState("all")
  const [priceRange, setPriceRange] = useState("all")
  const [quantities, setQuantities] = useState<Record<string, number>>({})
  const { addItem } = useCart()

  const [products, setProducts] = useState<Product[]>([])

  useEffect(() => {
    trackEvent("page_view", { page: "customer_catalog" })
    const load = async () => {
      try {
        const res = await api.get("/api/products?limit=200")
        setProducts(res.data?.data?.items || [])
      } catch (error: any) {
        toast.error(error?.response?.data?.error || "Failed to load products")
      }
    }
    load().catch(() => undefined)
  }, [])

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch = searchTerm
        ? `${product.name} ${product.packaging}`.toLowerCase().includes(searchTerm.toLowerCase())
        : true
      const matchesCategory = category === "all" ? true : product.category === category
      const matchesPrice =
        priceRange === "all"
          ? true
          : priceRange === "under-100"
            ? product.mrp < 100
            : priceRange === "100-200"
              ? product.mrp >= 100 && product.mrp <= 200
              : product.mrp > 200

      return matchesSearch && matchesCategory && matchesPrice
    })
  }, [searchTerm, category, priceRange, products])

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Catalog</h2>
          <p className="text-sm text-muted-foreground">Browse and add items to your cart.</p>
        </div>
        <div className="flex items-center gap-2">
          <Search className="w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by SKU, brand, product"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-muted border-0 h-9"
          />
        </div>
      </div>

      <Card className="border">
        <CardContent className="p-4 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Filter className="w-4 h-4" />
            Filters
          </div>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="h-9 w-[160px] bg-muted border-0 text-xs">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="Analgesic">Analgesic</SelectItem>
              <SelectItem value="Antibiotic">Antibiotic</SelectItem>
              <SelectItem value="Supplements">Supplements</SelectItem>
              <SelectItem value="Allergy">Allergy</SelectItem>
              <SelectItem value="Cardiology">Cardiology</SelectItem>
              <SelectItem value="Diabetes">Diabetes</SelectItem>
            </SelectContent>
          </Select>
          <Select value={priceRange} onValueChange={setPriceRange}>
            <SelectTrigger className="h-9 w-[160px] bg-muted border-0 text-xs">
              <SelectValue placeholder="Price" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Prices</SelectItem>
              <SelectItem value="under-100">Under ₹100</SelectItem>
              <SelectItem value="100-200">₹100 - ₹200</SelectItem>
              <SelectItem value="200+">₹200+</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredProducts.map((product) => (
          <CatalogProductCard
            key={product._id}
            product={product}
            productLink={`/customer/product/${product._id}`}
            quantity={quantities[product._id] || 1}
            onQuantityChange={(id, value) =>
              setQuantities((prev) => ({ ...prev, [id]: value }))
            }
            showQuantityStepper
            onAddToCart={(p, qty) => {
              addItem({
                productId: p._id,
                name: p.name,
                mrp: p.mrp,
                quantity: qty,
              })
              toast.success("Added to cart")
            }}
          />
        ))}
      </div>
    </div>
  )
}

export default function CustomerCatalogPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-6xl px-4 py-6 space-y-6" />}>
      <CustomerCatalogContent />
    </Suspense>
  )
}
