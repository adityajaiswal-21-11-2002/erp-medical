'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ShoppingCart, ImageOff } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

type Product = {
  _id: string
  name: string
  genericName?: string
  category?: string
  packaging?: string
  mrp: number
  ptr?: number
  currentStock?: number
  stockStatus?: 'IN_STOCK' | 'LOW' | 'OUT'
  photoBase64?: string | null
}

interface CatalogProductCardProps {
  product: Product
  onAddToCart: (product: Product, quantity: number) => void
  quantity?: number
  onQuantityChange?: (productId: string, value: number) => void
  productLink: string
  showQuantityStepper?: boolean
}

function ProductImage({ photoBase64, name, className }: { photoBase64?: string | null; name: string; className?: string }) {
  const [imgError, setImgError] = useState(false)
  const hasValidImage = photoBase64 && !imgError
  const src = hasValidImage
    ? (photoBase64.startsWith('data:') ? photoBase64 : `data:image/jpeg;base64,${photoBase64}`)
    : null

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={`object-cover rounded-lg ${className || ''}`}
        onError={() => setImgError(true)}
      />
    )
  }

  return (
    <div
      className={`flex flex-col items-center justify-center rounded-lg bg-muted/60 ${className || ''}`}
      aria-hidden
    >
      <ImageOff className="w-8 h-8 text-muted-foreground/60" />
      <span className="text-xs text-muted-foreground mt-1">No image</span>
    </div>
  )
}

export function CatalogProductCard({
  product,
  onAddToCart,
  quantity = 1,
  onQuantityChange,
  productLink,
  showQuantityStepper = false,
}: CatalogProductCardProps) {
  const availability = product.stockStatus === 'OUT' ? 'out-of-stock' : product.stockStatus === 'LOW' ? 'low-stock' : 'in-stock'
  const isOutOfStock = availability === 'out-of-stock'

  return (
    <Card className="border hover:shadow-md transition-shadow h-full flex flex-col">
      <Link href={productLink} className="block flex-1">
        <CardContent className="pt-4 space-y-3 flex-1 flex flex-col">
          <div className="aspect-square rounded-lg overflow-hidden bg-muted/40">
            <ProductImage
              photoBase64={product.photoBase64}
              name={product.name}
              className="w-full h-full"
            />
          </div>
          <div className="flex-1 space-y-1">
            <p className="text-sm font-semibold line-clamp-2">{product.name}</p>
            {product.genericName && (
              <p className="text-xs text-muted-foreground">{product.genericName}</p>
            )}
            {product.packaging && (
              <p className="text-xs text-muted-foreground">{product.packaging}</p>
            )}
            {product.category && (
              <p className="text-xs text-muted-foreground">{product.category}</p>
            )}
          </div>
          <div className="flex items-center justify-between">
            <span className="text-lg font-semibold">₹{product.mrp}</span>
            <Badge
              variant={
                availability === 'in-stock'
                  ? 'default'
                  : availability === 'low-stock'
                    ? 'secondary'
                    : 'destructive'
              }
              className="text-xs"
            >
              {availability === 'in-stock' ? 'In Stock' : availability === 'low-stock' ? 'Low Stock' : 'Out of Stock'}
            </Badge>
          </div>
        </CardContent>
      </Link>
      <div className="p-4 pt-0 flex items-center gap-2">
        {showQuantityStepper && onQuantityChange && (
          <div className="flex items-center gap-1 border rounded-md">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault()
                if (quantity > 1) onQuantityChange(product._id, quantity - 1)
              }}
              className="h-8 w-8 flex items-center justify-center hover:bg-muted rounded-l-md"
              disabled={quantity <= 1}
            >
              −
            </button>
            <input
              type="number"
              value={quantity}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10)
                if (!isNaN(val) && val >= 1) onQuantityChange(product._id, val)
              }}
              className="h-8 w-12 text-center border-0 bg-transparent text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              min={1}
            />
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault()
                onQuantityChange(product._id, quantity + 1)
              }}
              className="h-8 w-8 flex items-center justify-center hover:bg-muted rounded-r-md"
            >
              +
            </button>
          </div>
        )}
        <Button
          size="sm"
          className="flex-1 gap-2"
          disabled={isOutOfStock}
          onClick={(e) => {
            e.preventDefault()
            onAddToCart(product, quantity)
          }}
        >
          <ShoppingCart className="w-4 h-4" />
          Add to Cart
        </Button>
      </div>
    </Card>
  )
}
