"use client"

import React, { Suspense, useEffect, useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"
import { CatalogProductCard } from "@/components/catalog-product-card"
import {
  PageShell,
  PageHeader,
  FilterBar,
  EmptyState,
  ErrorState,
  CardListSkeleton,
  toast,
} from "@/components/ui-kit"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { api } from "@/lib/api"
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
  const initialSearch = searchParams.get("search") ?? ""
  const [searchTerm, setSearchTerm] = useState(initialSearch)
  const [category, setCategory] = useState("all")
  const [priceRange, setPriceRange] = useState("all")
  const [quantities, setQuantities] = useState<Record<string, number>>({})
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { addItem } = useCart()

  useEffect(() => {
    trackEvent("page_view", { page: "customer_catalog" })
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await api.get("/api/products?limit=200")
        setProducts(res.data?.data?.items ?? [])
      } catch (err: unknown) {
        const msg =
          err && typeof err === "object" && "response" in err && err.response && typeof err.response === "object" && "data" in err.response && err.response.data && typeof err.response.data === "object" && "error" in err.response.data
            ? String((err.response.data as { error?: string }).error)
            : "Failed to load products"
        setError(msg)
        toast.error(msg)
      } finally {
        setLoading(false)
      }
    }
    load().catch(() => {})
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

  const filterContent = (
    <>
      <Select value={category} onValueChange={setCategory}>
        <SelectTrigger className="h-9 w-full min-w-[140px] bg-muted/50 border-border text-sm">
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
        <SelectTrigger className="h-9 w-full min-w-[140px] bg-muted/50 border-border text-sm">
          <SelectValue placeholder="Price" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Prices</SelectItem>
          <SelectItem value="under-100">Under ₹100</SelectItem>
          <SelectItem value="100-200">₹100 - ₹200</SelectItem>
          <SelectItem value="200+">₹200+</SelectItem>
        </SelectContent>
      </Select>
    </>
  )

  return (
    <PageShell maxWidth="content" className="space-y-4 md:space-y-6">
      <PageHeader
        title="Catalog"
        subtitle="Browse and add items to your cart."
        breadcrumbs={[{ label: "Home", href: "/customer" }, { label: "Catalog" }]}
      />

      {error && (
        <ErrorState message={error} onRetry={() => window.location.reload()} />
      )}

      {!error && (
        <>
          <Card className="border border-border bg-card">
            <CardContent className="p-4 md:p-6">
              <FilterBar
                searchPlaceholder="Search by product, brand..."
                searchValue={searchTerm}
                onSearchChange={setSearchTerm}
                filterContent={filterContent}
                resultCount={filteredProducts.length}
              />
            </CardContent>
          </Card>

          {loading && <CardListSkeleton count={6} />}

          {!loading && filteredProducts.length === 0 && (
            <EmptyState
              title="No products found"
              description="Try changing filters or search."
              action={{ label: "Clear filters", onClick: () => {
                setSearchTerm("")
                setCategory("all")
                setPriceRange("all")
              }}
            />
          )}

          {!loading && filteredProducts.length > 0 && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 md:gap-6">
              {filteredProducts.map((product) => (
                <CatalogProductCard
                  key={product._id}
                  product={product}
                  productLink={`/customer/product/${product._id}`}
                  quantity={quantities[product._id] ?? 1}
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
          )}
        </>
      )}
    </PageShell>
  )
}

export default function CustomerCatalogPage() {
  return (
    <Suspense
      fallback={
        <PageShell maxWidth="content" className="space-y-4 md:space-y-6">
          <div className="h-20 rounded-lg bg-muted/30 animate-pulse" />
          <CardListSkeleton count={6} />
        </PageShell>
      }
    >
      <CustomerCatalogContent />
    </Suspense>
  )
}
