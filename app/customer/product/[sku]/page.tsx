"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"
import { ShoppingCart } from "lucide-react"
import { api } from "@/lib/api"
import { toast } from "sonner"
import { useCart } from "@/app/cart-context"

import { QuantityStepper } from "@/components/quantity-stepper"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export default function CustomerProductPage({ params }: { params: { sku: string } }) {
  const [qty, setQty] = useState(1)
  const sku = params.sku
  const { addItem } = useCart()
  const [product, setProduct] = useState<any>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get(`/api/products/${sku}`)
        setProduct(res.data?.data || null)
      } catch (error: any) {
        toast.error(error?.response?.data?.error || "Failed to load product")
      }
    }
    load().catch(() => undefined)
  }, [sku])

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 space-y-6">
      <div className="text-sm text-muted-foreground">
        <Link href="/customer/catalog" className="hover:text-foreground">
          Catalog
        </Link>{" "}
        / {sku}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border">
          <CardContent className="p-6 space-y-4">
            <div className="aspect-square rounded-lg border bg-muted/40 flex items-center justify-center text-sm text-muted-foreground">
              Image gallery placeholder
            </div>
            <div className="grid grid-cols-3 gap-3">
              {["Front", "Back", "Label"].map((label) => (
                <div
                  key={label}
                  className="aspect-square rounded-md border bg-muted/40 flex items-center justify-center text-[10px] text-muted-foreground"
                >
                  {label}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border">
          <CardContent className="p-6 space-y-4">
            <div>
              <h1 className="text-2xl font-semibold">{product?.name || `Product ${sku}`}</h1>
              <p className="text-sm text-muted-foreground">Brand: {product?.manufacturerName || "Generic"}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl font-semibold">₹{product?.mrp || 0}</span>
              <span className="text-sm text-muted-foreground">In stock</span>
            </div>
            <p className="text-sm text-muted-foreground">
              {product?.packaging || "Standard packaging"}
            </p>
            <div className="flex items-center gap-3">
              <QuantityStepper value={qty} onChange={setQty} />
              <Button
                className="gap-2"
                onClick={() => {
                  if (!product) return
                  addItem({ productId: product._id, name: product.name, mrp: product.mrp, quantity: qty })
                  toast.success("Added to cart")
                }}
              >
                <ShoppingCart className="w-4 h-4" />
                Add to cart
              </Button>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-lg border bg-muted/30 p-3 text-xs text-muted-foreground">
                Available in cold chain packaging.
              </div>
              <div className="rounded-lg border bg-muted/30 p-3 text-xs text-muted-foreground">
                Next dispatch window: 24-48 hours.
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
