"use client"

import { useState } from "react"
import { toast } from "sonner"
import { api } from "@/lib/api"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"

export default function RetailerPaymentsPage() {
  const [amount, setAmount] = useState(0)
  const [token, setToken] = useState<string | null>(null)

  const createIntent = async () => {
    try {
      const res = await api.post("/api/payments/intent", { amount })
      setToken(res.data?.data?.token || null)
      toast.success("Payment token created")
    } catch (error: any) {
      toast.error(error?.response?.data?.error || "Failed to create payment token")
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payments"
        description="Generate tokenized payment intents (no card data stored)."
      />
      <Card>
        <CardContent className="pt-6 space-y-4">
          <Input
            type="number"
            placeholder="Amount"
            value={amount || ""}
            onChange={(e) => setAmount(Number(e.target.value))}
          />
          <Button onClick={createIntent}>Create Token</Button>
          {token && (
            <div className="text-sm text-muted-foreground">
              Latest token: <span className="font-mono text-foreground">{token}</span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
