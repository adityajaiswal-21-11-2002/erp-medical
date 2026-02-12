'use client'

import { useEffect, useState, useMemo } from "react"
import { api } from "@/lib/api"
import { toast } from "sonner"
import { trackEvent } from "@/lib/analytics"
import { useCart } from "@/app/cart-context"
import { PageHeader } from "@/components/page-header"
import { CatalogProductCard } from "@/components/catalog-product-card"
import { CardGridSkeleton } from "@/components/ui-kit"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

type ProductRow = {
  _id: string
  name: string
  genericName: string
  category: string
  packaging: string
  mrp: number
  ptr?: number
  currentStock: number
  stockStatus: "IN_STOCK" | "LOW" | "OUT"
  status: "ACTIVE" | "INACTIVE"
  photoBase64?: string | null
}

export default function CatalogPage() {
  const [products, setProducts] = useState<ProductRow[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [quantities, setQuantities] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const { addItem } = useCart()

  const minLoadingMs = 400
  const fetchProducts = async () => {
    setLoading(true)
    const started = Date.now()
    try {
      const res = await api.get("/api/products?limit=200")
      const items = res.data?.data?.items || []
      setProducts(items)
      const elapsed = Date.now() - started
      const remaining = Math.max(0, minLoadingMs - elapsed)
      if (remaining > 0) {
        await new Promise((r) => setTimeout(r, remaining))
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.error || "Failed to load products")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    trackEvent("page_view", { page: "retailer_catalog" })
    fetchProducts().catch(() => undefined)
  }, [])

  const filteredProducts = useMemo(() => {
    if (!searchTerm.trim()) return products
    const term = searchTerm.toLowerCase()
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(term) ||
        (p.genericName || "").toLowerCase().includes(term) ||
        (p.category || "").toLowerCase().includes(term) ||
        (p.packaging || "").toLowerCase().includes(term)
    )
  }, [products, searchTerm])

  return (
    <div className="space-y-6">
      <PageHeader title="Catalog" description="Browse products and add them to your cart." />

      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name, generic, category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-muted border-0"
          />
        </div>
      </div>

      {loading && <CardGridSkeleton count={6} />}
      {!loading && filteredProducts.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProducts.map((product) => (
            <CatalogProductCard
              key={product._id}
              product={product}
              productLink={`/retailer/catalog/${product._id}`}
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
      )}

      {!loading && filteredProducts.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          No products found
        </div>
      )}
    </div>
  )
}
