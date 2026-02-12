"use client"

import { useState } from "react"
import { toast } from "sonner"
import { api } from "@/lib/api"
import { PageHeader } from "@/components/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plug, Truck, CreditCard, Loader2 } from "lucide-react"

type Status = { connected: boolean; provider?: string; error?: string }

export default function IntegrationsPage() {
  const [shiprocket, setShiprocket] = useState<Status | null>(null)
  const [rapidshyp, setRapidshyp] = useState<Status | null>(null)
  const [razorpay, setRazorpay] = useState<Status | null>(null)
  const [loading, setLoading] = useState<string | null>(null)

  const testShiprocket = async () => {
    setLoading("shiprocket")
    try {
      const res = await api.get("/api/shipments/integrations/shiprocket/test")
      setShiprocket(res.data?.data || { connected: false })
    } catch (e: any) {
      setShiprocket({ connected: false, error: e?.response?.data?.error || "Request failed" })
    } finally {
      setLoading(null)
    }
  }

  const testRapidshyp = async () => {
    setLoading("rapidshyp")
    try {
      const res = await api.get("/api/shipments/integrations/rapidshyp/test")
      setRapidshyp(res.data?.data || { connected: false })
    } catch (e: any) {
      setRapidshyp({ connected: false, error: e?.response?.data?.error || "Request failed" })
    } finally {
      setLoading(null)
    }
  }

  const testRazorpay = async () => {
    setLoading("razorpay")
    try {
      await api.get("/api/payments/razorpay")
      setRazorpay({ connected: true, provider: "RAZORPAY" })
    } catch (e: any) {
      setRazorpay({ connected: false, error: e?.response?.data?.error || "Request failed" })
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Integrations"
        description="Shipping and payment provider connectivity (no secrets shown)."
      />
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Truck className="w-4 h-4" />
              Shiprocket
            </CardTitle>
            <Button
              size="sm"
              variant="outline"
              onClick={testShiprocket}
              disabled={loading !== null}
            >
              {loading === "shiprocket" ? <Loader2 className="w-4 h-4 animate-spin" /> : "Test"}
            </Button>
          </CardHeader>
          <CardContent>
            {shiprocket === null ? (
              <p className="text-xs text-muted-foreground">Click Test to check connectivity.</p>
            ) : shiprocket.connected ? (
              <p className="text-xs text-green-600 dark:text-green-400">Connected</p>
            ) : (
              <p className="text-xs text-amber-600 dark:text-amber-400">
                {shiprocket.error || "Not connected"}
              </p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Truck className="w-4 h-4" />
              RapidShyp
            </CardTitle>
            <Button
              size="sm"
              variant="outline"
              onClick={testRapidshyp}
              disabled={loading !== null}
            >
              {loading === "rapidshyp" ? <Loader2 className="w-4 h-4 animate-spin" /> : "Test"}
            </Button>
          </CardHeader>
          <CardContent>
            {rapidshyp === null ? (
              <p className="text-xs text-muted-foreground">Click Test to check connectivity.</p>
            ) : rapidshyp.connected ? (
              <p className="text-xs text-green-600 dark:text-green-400">Connected</p>
            ) : (
              <p className="text-xs text-amber-600 dark:text-amber-400">
                {rapidshyp.error || "Not connected"}
              </p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              Razorpay
            </CardTitle>
            <Button
              size="sm"
              variant="outline"
              onClick={testRazorpay}
              disabled={loading !== null}
            >
              {loading === "razorpay" ? <Loader2 className="w-4 h-4 animate-spin" /> : "Test"}
            </Button>
          </CardHeader>
          <CardContent>
            {razorpay === null ? (
              <p className="text-xs text-muted-foreground">Click Test to check connectivity.</p>
            ) : razorpay.connected ? (
              <p className="text-xs text-green-600 dark:text-green-400">Connected</p>
            ) : (
              <p className="text-xs text-amber-600 dark:text-amber-400">
                {razorpay.error || "Not connected"}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
