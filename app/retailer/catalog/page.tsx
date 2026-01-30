'use client'

import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import { toast } from "sonner"
import { trackEvent } from "@/lib/analytics"
import { useCart } from "@/app/cart-context"
import { DataTable } from "@/components/data-table"
import { PageHeader } from "@/components/page-header"
import { StatusBadge } from "@/components/status-badge"
import { Button } from "@/components/ui/button"

type ProductRow = {
  _id: string
  name: string
  genericName: string
  category: string
  packaging: string
  mrp: number
  currentStock: number
  stockStatus: "IN_STOCK" | "LOW" | "OUT"
  status: "ACTIVE" | "INACTIVE"
}

export default function CatalogPage() {
  const [products, setProducts] = useState<ProductRow[]>([])
  const { addItem } = useCart()

  const fetchProducts = async () => {
    try {
      const res = await api.get("/api/products?limit=200")
      setProducts(res.data?.data?.items || [])
    } catch (error: any) {
      toast.error(error?.response?.data?.error || "Failed to load products")
    }
  }

  useEffect(() => {
    trackEvent("page_view", { page: "retailer_catalog" })
    fetchProducts().catch(() => undefined)
  }, [])

  return (
    <div className="space-y-6">
      <PageHeader title="Catalog" description="Browse products and add them to your cart." />

      <DataTable
        columns={[
          { key: "name", label: "Name" },
          { key: "genericName", label: "Generic" },
          { key: "category", label: "Category" },
          { key: "packaging", label: "Pack" },
          { key: "mrp", label: "MRP", render: (value: number) => `₹${value}` },
          {
            key: "stockStatus",
            label: "Stock",
            render: (value: ProductRow["stockStatus"]) => <StatusBadge status={value} />,
          },
        ]}
        data={products}
        searchableFields={["name", "genericName", "category"]}
        actions={[
          {
            label: "Add to Cart",
            onClick: (row) => {
              addItem({
                productId: row._id,
                name: row.name,
                mrp: row.mrp,
                quantity: 1,
              })
              toast.success("Added to cart")
            },
          },
        ]}
      />
    </div>
  )
}
