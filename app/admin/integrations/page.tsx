"use client"

import { useState } from "react"
import { api } from "@/lib/api"
import { getErrorMessage } from "@/lib/utils"
import { PageShell, PageHeader } from "@/components/ui-kit"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Truck, CreditCard, Loader2, Stethoscope, Check, X } from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

type Status = { connected: boolean; provider?: string; error?: string }

type DiagnosticCheck = { name: string; pass: boolean; message: string }
type DiagnosticResult = {
  provider: string
  allPass: boolean
  checks: DiagnosticCheck[]
  summary: string
}

export default function IntegrationsPage() {
  const [shiprocket, setShiprocket] = useState<Status | null>(null)
  const [rapidshyp, setRapidshyp] = useState<Status | null>(null)
  const [razorpay, setRazorpay] = useState<Status | null>(null)
  const [loading, setLoading] = useState<string | null>(null)
  const [diagnostic, setDiagnostic] = useState<DiagnosticResult | null>(null)
  const [diagnosticOpen, setDiagnosticOpen] = useState(false)

  const testShiprocket = async () => {
    setLoading("shiprocket")
    setDiagnostic(null)
    try {
      const res = await api.get("/api/shipments/integrations/shiprocket/test")
      setShiprocket(res.data?.data || { connected: false })
    } catch (e) {
      setShiprocket({ connected: false, error: getErrorMessage(e, "Request failed") })
    } finally {
      setLoading(null)
    }
  }

  const runDiagnostic = async () => {
    setLoading("diagnose")
    setDiagnostic(null)
    setDiagnosticOpen(true)
    try {
      const res = await api.get("/api/shipments/integrations/shiprocket/diagnose")
      setDiagnostic(res.data?.data || null)
    } catch (e) {
      setDiagnostic({
        provider: "SHIPROCKET",
        allPass: false,
        checks: [{ name: "Request", pass: false, message: getErrorMessage(e, "Failed to run diagnostic") }],
        summary: "Error",
      })
    } finally {
      setLoading(null)
    }
  }

  const testRapidshyp = async () => {
    setLoading("rapidshyp")
    try {
      const res = await api.get("/api/shipments/integrations/rapidshyp/test")
      setRapidshyp(res.data?.data || { connected: false })
    } catch (e) {
      setRapidshyp({ connected: false, error: getErrorMessage(e, "Request failed") })
    } finally {
      setLoading(null)
    }
  }

  const testRazorpay = async () => {
    setLoading("razorpay")
    try {
      await api.get("/api/payments/razorpay")
      setRazorpay({ connected: true, provider: "RAZORPAY" })
    } catch (e) {
      setRazorpay({ connected: false, error: getErrorMessage(e, "Request failed") })
    } finally {
      setLoading(null)
    }
  }

  return (
    <PageShell maxWidth="content" className="space-y-6">
      <PageHeader
        title="Integrations"
        subtitle="Shipping and payment provider connectivity (no secrets shown). Test each provider to verify configuration."
        breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "Integrations" }]}
      />
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Truck className="w-4 h-4" />
              Shiprocket
            </CardTitle>
            <div className="flex gap-1">
              <Button
                size="sm"
                variant="outline"
                onClick={testShiprocket}
                disabled={loading !== null}
              >
                {loading === "shiprocket" ? <Loader2 className="w-4 h-4 animate-spin" /> : "Test"}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={runDiagnostic}
                disabled={loading !== null}
                title="Run automated diagnostic for create-shipment 403"
              >
                {loading === "diagnose" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Stethoscope className="w-4 h-4" />}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {shiprocket === null ? (
              <p className="text-xs text-muted-foreground">Click Test to check connectivity, or Diagnose to run full checks.</p>
            ) : shiprocket.connected ? (
              <p className="text-xs text-green-600 dark:text-green-400">Connected</p>
            ) : (
              <p className="text-xs text-amber-600 dark:text-amber-400">
                {shiprocket.error || "Not connected"}
              </p>
            )}
            {diagnostic && (
              <Collapsible open={diagnosticOpen} onOpenChange={setDiagnosticOpen}>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-xs h-auto py-1 -mb-1">
                    {diagnostic.allPass ? (
                      <span className="text-green-600 dark:text-green-400">{diagnostic.summary} ✓</span>
                    ) : (
                      <span className="text-amber-600 dark:text-amber-400">{diagnostic.summary}</span>
                    )}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="mt-2 pt-2 border-t space-y-1 text-xs">
                    {diagnostic.checks?.map((c, i) => (
                      <div key={i} className="flex items-center gap-2">
                        {c.pass ? <Check className="w-3.5 h-3.5 text-green-600 shrink-0" /> : <X className="w-3.5 h-3.5 text-amber-600 shrink-0" />}
                        <span className={c.pass ? "text-muted-foreground" : "text-amber-600 dark:text-amber-400"}>
                          {c.name}: {c.message}
                        </span>
                      </div>
                    ))}
                  </div>
                </CollapsibleContent>
              </Collapsible>
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
    </PageShell>
  )
}
