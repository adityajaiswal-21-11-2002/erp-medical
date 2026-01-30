"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { CreditCard, MapPin } from "lucide-react"
import { toast } from "sonner"
import { api } from "@/lib/api"
import { useCart } from "@/app/cart-context"
import { useAuth } from "@/app/auth-context"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

export default function CustomerCheckoutPage() {
  const router = useRouter()
  const { items, subtotal, clearCart } = useCart()
  const { user } = useAuth()
  const [refCode, setRefCode] = useState<string | null>(null)
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

  const handlePlaceOrder = async () => {
    if (!items.length) {
      toast.error("Cart is empty")
      return
    }
    try {
      const payload = {
        customerName: form.name || user?.name || "Customer",
        customerMobile: form.phone || "0000000000",
        customerAddress: `${form.address} ${form.city} ${form.pincode}`.trim() || "Address",
        items: items.map((item) => ({
          product: item.productId,
          quantity: item.quantity,
        })),
        referralCode: refCode || undefined,
      }
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
            <div className="rounded-lg border bg-muted/30 p-3 flex items-center gap-3">
              <CreditCard className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">UPI / Netbanking</p>
                <p className="text-xs text-muted-foreground">Pay within 24 hours</p>
              </div>
            </div>
            <div className="rounded-lg border bg-muted/30 p-3 flex items-center gap-3">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Pay on Delivery</p>
                <p className="text-xs text-muted-foreground">Available for select regions</p>
              </div>
            </div>
            {refCode && (
              <div className="rounded-lg border bg-card p-3 text-xs text-muted-foreground">
                Referral applied: <span className="font-medium text-foreground">{refCode}</span>
              </div>
            )}
            <Button className="w-full" onClick={handlePlaceOrder}>
              Place order
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
