'use client'

import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ShoppingCart, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

interface ProductCardProps {
  sku: string
  name: string
  brand: string
  packSize: string
  mrp: number
  ptr: number
  availability: 'in-stock' | 'low-stock' | 'out-of-stock'
  discount?: number
  isPopular?: boolean
}

export function ProductCard({
  sku,
  name,
  brand,
  packSize,
  mrp,
  ptr,
  availability,
  discount = 0,
  isPopular = false,
}: ProductCardProps) {
  const [quantity, setQuantity] = useState(1)

  const availabilityConfig = {
    'in-stock': { label: 'In Stock', variant: 'default' as const },
    'low-stock': { label: 'Low Stock', variant: 'secondary' as const },
    'out-of-stock': { label: 'Out of Stock', variant: 'destructive' as const },
  }

  return (
    <Link href={`/retailer/catalog/${sku}`}>
      <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
        <CardContent className="pt-4 space-y-2">
          <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
            <div className="text-center">
              <div className="text-2xl font-bold text-muted-foreground">{sku}</div>
              <p className="text-xs text-muted-foreground">Product Image</p>
            </div>
          </div>

          {isPopular && (
            <Badge className="w-fit gap-1">
              <TrendingUp className="w-3 h-3" />
              Popular
            </Badge>
          )}

          <div>
            <h3 className="font-semibold text-sm line-clamp-2">{name}</h3>
            <p className="text-xs text-muted-foreground">{brand}</p>
            <p className="text-xs text-muted-foreground mt-1">{packSize}</p>
          </div>

          <div className="space-y-1">
            <div className="flex items-baseline gap-2">
              <span className="font-bold text-lg">₹{ptr}</span>
              <span className="text-sm line-through text-muted-foreground">₹{mrp}</span>
              {discount > 0 && <Badge variant="secondary" className="text-xs">{discount}% off</Badge>}
            </div>
          </div>

          <Badge variant={availabilityConfig[availability].variant} className="w-fit">
            {availabilityConfig[availability].label}
          </Badge>
        </CardContent>

        <CardFooter className="gap-2">
          <Button size="sm" className="flex-1" disabled={availability === 'out-of-stock'}>
            <ShoppingCart className="w-4 h-4 mr-1" />
            Add
          </Button>
        </CardFooter>
      </Card>
    </Link>
  )
}
