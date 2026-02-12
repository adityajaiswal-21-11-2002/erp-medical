"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Script from "next/script"
import { CreditCard, MapPin, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { api } from "@/lib/api"
import { useCart } from "@/app/cart-context"
import { useAuth } from "@/app/auth-context"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

declare global {
  interface Window {
    Razorpay?: any
  }
}

const razorpayKeyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || ""

export default function CustomerCheckoutPage() {
  const router = useRouter()
  const { items, subtotal, clearCart } = useCart()
  const { user } = useAuth()
  const [refCode, setRefCode] = useState<string | null>(null)
  const [payWithRazorpay, setPayWithRazorpay] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
    pincode: "",
  })

  useEffect(() => {
    setRefCode(localStorage.getItem("ref_code"))
  }, [])

  const createOrderPayload = () => ({
    customerName: form.name || user?.name || "Customer",
    customerMobile: form.phone || "0000000000",
    customerAddress: `${form.address} ${form.city} ${form.pincode}`.trim() || "Address",
    items: items.map((item) => ({
      product: item.productId,
      quantity: item.quantity,
    })),
    referralCode: refCode || undefined,
  })

  const handlePlaceOrder = async () => {
    if (!items.length) {
      toast.error("Cart is empty")
      return
    }
    if (payWithRazorpay && razorpayKeyId) {
      await handleRazorpayCheckout()
      return
    }
    try {
      setLoading(true)
      const payload = createOrderPayload()
      const res = await api.post("/api/orders", payload)
      await api.post("/api/payments/intent", {
        orderId: res.data?.data?._id,
        amount: subtotal,
      })
      clearCart()
      toast.success("Order placed successfully")
      router.push("/customer/orders")
    } catch (error: any) {
      toast.error(error?.response?.data?.error || "Failed to place order")
    } finally {
      setLoading(false)
    }
  }

  const handleRazorpayCheckout = async () => {
    if (!razorpayKeyId) {
      toast.error("Online payment not configured")
      return
    }
    setLoading(true)
    try {
      const payload = createOrderPayload()
      const orderRes = await api.post("/api/orders", payload)
      const orderId = orderRes.data?.data?._id
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
            router.push("/customer/orders")
          } catch (e: any) {
            toast.error(e?.response?.data?.error || "Payment verification failed")
          } finally {
            setLoading(false)
          }
        },
        modal: { ondismiss: () => setLoading(false) },
      }
      if (typeof window !== "undefined" && window.Razorpay) {
        const rz = new window.Razorpay(options)
        rz.open()
      } else {
        toast.error("Payment gateway not loaded")
        setLoading(false)
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.error || "Failed to place order")
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Checkout</h2>
        <p className="text-sm text-muted-foreground">Confirm address and payment details.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="border lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Delivery Address</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Contact Name</label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Phone</label>
              <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-medium text-muted-foreground">Address</label>
              <Textarea value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">City</label>
              <Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Pincode</label>
              <Input value={form.pincode} onChange={(e) => setForm({ ...form, pincode: e.target.value })} />
            </div>
          </CardContent>
        </Card>

        <Card className="border">
          <CardHeader>
            <CardTitle className="text-base">Payment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {razorpayKeyId && (
              <div
                className={`rounded-lg border p-3 flex items-center gap-3 cursor-pointer ${payWithRazorpay ? "border-primary bg-primary/5" : "bg-muted/30"}`}
                onClick={() => setPayWithRazorpay(true)}
              >
                <CreditCard className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Pay online (Razorpay)</p>
                  <p className="text-xs text-muted-foreground">Card, UPI, Netbanking</p>
                </div>
              </div>
            )}
            <div
              className={`rounded-lg border p-3 flex items-center gap-3 cursor-pointer ${!payWithRazorpay ? "border-primary bg-primary/5" : "bg-muted/30"}`}
              onClick={() => setPayWithRazorpay(false)}
            >
              <MapPin className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Place order (pay later)</p>
                <p className="text-xs text-muted-foreground">Pay on delivery or later</p>
              </div>
            </div>
            {refCode && (
              <div className="rounded-lg border bg-card p-3 text-xs text-muted-foreground">
                Referral applied: <span className="font-medium text-foreground">{refCode}</span>
              </div>
            )}
            <Button className="w-full" onClick={handlePlaceOrder} disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {payWithRazorpay && razorpayKeyId ? "Pay with Razorpay" : "Place order"}
            </Button>
          </CardContent>
        </Card>
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
