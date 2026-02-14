"use client"

import React, { useMemo, useEffect, useState } from "react"
import Link from "next/link"
import { Trash2 } from "lucide-react"
import { useCart } from "@/app/cart-context"
import { api } from "@/lib/api"

import { QuantityStepper } from "@/components/quantity-stepper"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export default function CustomerCartPage() {
  const { items, updateQuantity, removeItem, subtotal } = useCart()
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

  const totals = useMemo(() => {
    if (preview) {
      return { subtotal: preview.subtotal, gst: preview.totalGst, total: preview.netAmount }
    }
    const gst = Math.round(subtotal * 0.12)
    const total = subtotal + gst
    return { subtotal, gst, total }
  }, [subtotal, preview])

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Your Cart</h2>
          <p className="text-sm text-muted-foreground">Review items before checkout.</p>
        </div>
        <Link href="/customer/checkout">
          <Button>Proceed to checkout</Button>
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="border lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Cart Items</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="text-xs font-semibold">Product</TableHead>
                  <TableHead className="text-xs font-semibold">Price</TableHead>
                  <TableHead className="text-xs font-semibold">Qty</TableHead>
                  <TableHead className="text-xs font-semibold">Total</TableHead>
                  <TableHead className="text-xs font-semibold text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.productId}>
                    <TableCell>
                      <div className="font-medium">{item.name}</div>
                      <div className="text-xs text-muted-foreground">{item.productId}</div>
                    </TableCell>
                    <TableCell>₹{item.mrp}</TableCell>
                    <TableCell>
                      <QuantityStepper
                        value={item.quantity}
                        onChange={(value) => updateQuantity(item.productId, value)}
                      />
                    </TableCell>
                    <TableCell>₹{item.mrp * item.quantity}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(item.productId)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {items.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      Your cart is empty
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="border">
          <CardHeader>
            <CardTitle className="text-base">Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span>₹{totals.subtotal}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{preview ? "GST" : "GST (12%)"}</span>
              <span>₹{totals.gst}</span>
            </div>
            <div className="border-t pt-3 flex items-center justify-between font-semibold">
              <span>Total</span>
              <span>₹{totals.total}</span>
            </div>
            <Link href="/customer/checkout">
              <Button className="w-full">Continue to checkout</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
