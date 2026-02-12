'use client'

import { useState, useEffect } from "react"
import Script from "next/script"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import Link from "next/link"
import { CreditCard, Loader2 } from "lucide-react"
import { api } from "@/lib/api"
import { useCart } from "@/app/cart-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

declare global {
  interface Window {
    Razorpay?: any
  }
}

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
  const [razorpayKeyId, setRazorpayKeyId] = useState<string>("")

  useEffect(() => {
    api.get("/api/payments/razorpay/key").then((res) => {
      const keyId = res.data?.data?.keyId ?? ""
      setRazorpayKeyId(keyId || "")
    }).catch(() => setRazorpayKeyId(""))
  }, [])

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
    if (!razorpayKeyId) {
      toast.error("Payment is not configured. Please contact support.")
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
      if (!orderId) throw new Error("Order not created")
      const rzRes = await api.post("/api/payments/razorpay/order", { orderId })
      const data = rzRes.data?.data
      if (!data?.razorpayOrderId || !data?.keyId) throw new Error("Razorpay order failed")
      const options = {
        key: data.keyId,
        amount: data.amount,
        currency: data.currency || "INR",
        name: data.name || "PharmaHub",
        description: data.description || "Order payment",
        order_id: data.razorpayOrderId,
        prefill: data.prefill || {},
        handler: async (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
          try {
            await api.post("/api/payments/razorpay/verify", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              internalOrderId: orderId,
            })
            clearCart()
            toast.success("Payment successful. Order placed.")
            router.push(`/retailer/orders/${orderId}`)
          } catch (e: any) {
            toast.error(e?.response?.data?.error || "Payment verification failed")
          } finally {
            setPlacing(false)
          }
        },
        modal: { ondismiss: () => setPlacing(false) },
      }
      if (typeof window !== "undefined" && window.Razorpay) {
        const rz = new window.Razorpay(options)
        rz.open()
      } else {
        toast.error("Payment gateway not loaded")
        setPlacing(false)
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.error || "Failed to place order")
      setPlacing(false)
    }
  }

  const tax = Math.round(subtotal * 0.05 * 100) / 100
  const total = subtotal + tax

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Checkout</h1>
        <p className="text-muted-foreground mt-2">Review and complete your order. Payment required via Razorpay.</p>
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
                <div className="md:col-span-2 flex flex-col gap-3">
                  <div className="rounded-lg border border-primary bg-primary/5 p-3 flex items-center gap-3">
                    <CreditCard className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Pay with Razorpay</p>
                      <p className="text-xs text-muted-foreground">Card, UPI, Netbanking — payment required to place order</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button type="submit" disabled={placing || !razorpayKeyId}>
                      {placing ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                      Pay &amp; place order
                    </Button>
                    <Button variant="outline" className="bg-transparent" type="button" asChild>
                      <Link href="/retailer/cart">Back to Cart</Link>
                    </Button>
                  </div>
                  {!razorpayKeyId && (
                    <p className="text-xs text-amber-600 dark:text-amber-400">Payment is not configured. Contact support.</p>
                  )}
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
      {razorpayKeyId && (
        <Script
          src="https://checkout.razorpay.com/v1/checkout.js"
          strategy="afterInteractive"
        />
      )}
    </div>
  )
}
