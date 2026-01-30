"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { api } from "@/lib/api"
import { PageHeader } from "@/components/page-header"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

type PaymentIntent = {
  _id: string
  amount: number
  status: string
  token: string
  createdAt?: string
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<PaymentIntent[]>([])

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/api/payments")
        setPayments(res.data?.data || [])
      } catch (error: any) {
        toast.error(error?.response?.data?.error || "Failed to load payments")
      }
    }
    load().catch(() => undefined)
  }, [])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payments & Settlements"
        description="Tokenized payment intents and reconciliation."
      />
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Token</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((payment) => (
                <TableRow key={payment._id}>
                  <TableCell className="font-mono text-xs">{payment.token}</TableCell>
                  <TableCell>₹{payment.amount}</TableCell>
                  <TableCell>{payment.status}</TableCell>
                  <TableCell>
                    {payment.createdAt ? new Date(payment.createdAt).toLocaleString() : "-"}
                  </TableCell>
                </TableRow>
              ))}
              {payments.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    No payments yet
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
