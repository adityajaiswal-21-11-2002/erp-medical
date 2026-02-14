'use client'

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { QuantityStepper } from "@/components/quantity-stepper"
import { Trash2, ShoppingCart } from "lucide-react"
import Link from "next/link"
import { useCart } from "@/app/cart-context"
import { api } from "@/lib/api"

export default function CartPage() {
  const { items, subtotal, updateQuantity, removeItem } = useCart()
  const [preview, setPreview] = useState<{ subtotal: number; totalGst: number; netAmount: number } | null>(null)

  useEffect(() => {
    if (items.length === 0) {
      setPreview(null)
      return
    }
    api
      .post("/api/orders/preview", {
        items: items.map((item) => ({ product: item.productId, quantity: item.quantity })),
      })
      .then((res) => {
        const d = res.data?.data
        if (d) setPreview({ subtotal: d.subtotal, totalGst: d.totalGst, netAmount: d.netAmount })
      })
      .catch(() => setPreview(null))
  }, [items])

  const taxAmount = preview?.totalGst ?? Math.round(subtotal * 0.05 * 100) / 100
  const total = preview?.netAmount ?? subtotal + taxAmount

  if (items.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Shopping Cart</h1>
          <p className="text-muted-foreground mt-2">Your cart is empty</p>
        </div>

        <Card>
          <CardContent className="pt-12 text-center space-y-4">
            <ShoppingCart className="w-16 h-16 text-muted-foreground mx-auto" />
            <div>
              <h3 className="text-lg font-semibold">No items in your cart</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Start adding products to your cart
              </p>
            </div>
            <Button asChild>
              <Link href="/retailer/catalog">Continue Shopping</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Shopping Cart</h1>
        <p className="text-muted-foreground mt-2">{items.length} items in cart</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead className="text-center">Qty</TableHead>
                    <TableHead className="text-right">Subtotal</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => (
                    <TableRow key={item.productId}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-xs text-muted-foreground">{item.productId}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">₹{item.mrp}</TableCell>
                      <TableCell className="text-center">
                        <QuantityStepper
                          value={item.quantity}
                          onChange={(qty) => updateQuantity(item.productId, qty)}
                          min={1}
                        />
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        ₹{item.mrp * item.quantity}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeItem(item.productId)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>₹{(preview?.subtotal ?? subtotal).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{preview ? "GST" : "Tax (5%)"}</span>
                  <span>₹{taxAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t">
                  <span className="font-semibold">Total</span>
                  <span className="font-bold text-lg">₹{total.toFixed(2)}</span>
                </div>
              </div>

              <Button className="w-full" size="lg" asChild>
                <Link href="/retailer/checkout">Proceed to Checkout</Link>
              </Button>

              <Button variant="outline" className="w-full bg-transparent" asChild>
                <Link href="/retailer/catalog">Continue Shopping</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
