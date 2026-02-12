'use client'

import { useState } from "react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import Link from "next/link"
import { api } from "@/lib/api"
import { useCart } from "@/app/cart-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

const checkoutSchema = z.object({
  customerName: z.string().min(1),
  customerMobile: z.string().min(6),
  customerAddress: z.string().min(3),
  gstin: z.string().optional(),
  doctorName: z.string().optional(),
})

type CheckoutValues = z.infer<typeof checkoutSchema>

export default function CheckoutPage() {
  const router = useRouter()
  const { items, subtotal, clearCart } = useCart()
  const [placing, setPlacing] = useState(false)

  const form = useForm<CheckoutValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      customerName: "",
      customerMobile: "",
      customerAddress: "",
      gstin: "",
      doctorName: "",
    },
  })

  const handlePlaceOrder = async (values: CheckoutValues) => {
    if (items.length === 0) {
      toast.error("Cart is empty")
      return
    }
    setPlacing(true)
    try {
      const payload = {
        ...values,
        items: items.map((item) => ({
          product: item.productId,
          quantity: item.quantity,
        })),
      }
      const res = await api.post("/api/orders", payload)
      const orderId = res.data?.data?._id
      toast.success("Order placed")
      clearCart()
      router.push(orderId ? `/retailer/orders/${orderId}` : "/retailer/orders")
    } catch (error: any) {
      toast.error(error?.response?.data?.error || "Failed to place order")
    } finally {
      setPlacing(false)
    }
  }

  const tax = Math.round(subtotal * 0.05 * 100) / 100
  const total = subtotal + tax

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Checkout</h1>
        <p className="text-muted-foreground mt-2">Review and complete your order</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Customer Details</CardTitle>
            </CardHeader>
            <CardContent>
              <form
                className="grid grid-cols-1 gap-4 md:grid-cols-2"
                onSubmit={form.handleSubmit(handlePlaceOrder)}
              >
                <Input placeholder="Customer name" {...form.register("customerName")} />
                <Input placeholder="Customer mobile" {...form.register("customerMobile")} />
                <Input
                  placeholder="Doctor name (optional)"
                  {...form.register("doctorName")}
                />
                <Input placeholder="GSTIN (optional)" {...form.register("gstin")} />
                <Input
                  className="md:col-span-2"
                  placeholder="Customer address"
                  {...form.register("customerAddress")}
                />
                <div className="md:col-span-2 flex gap-3">
                  <Button type="submit" disabled={placing}>
                    {placing ? "Placing..." : "Place Order"}
                  </Button>
                  <Button variant="outline" className="bg-transparent" asChild>
                    <Link href="/retailer/cart">Back to Cart</Link>
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => (
                    <TableRow key={item.productId}>
                      <TableCell className="text-sm">
                        {item.name} x{item.quantity}
                      </TableCell>
                      <TableCell className="text-right">
                        ₹{item.mrp * item.quantity}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="space-y-2 text-sm border-t pt-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax (5%)</span>
                  <span>₹{tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-base border-t pt-2">
                  <span>Total</span>
                  <span>₹{total.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
