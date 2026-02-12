"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { api } from "@/lib/api"
import { PageHeader } from "@/components/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

type PaymentIntent = {
  _id: string
  amount: number
  status: string
  token: string
  createdAt?: string
}

type RazorpayPayment = {
  _id: string
  orderId?: { orderNumber?: string }
  razorpayOrderId?: string
  razorpayPaymentId?: string
  amount: number
  currency: string
  status: string
  createdAt?: string
}

type WebhookEvent = {
  _id: string
  provider: string
  eventId: string
  status?: string
  createdAt?: string
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<PaymentIntent[]>([])
  const [razorpayPayments, setRazorpayPayments] = useState<RazorpayPayment[]>([])
  const [webhookEvents, setWebhookEvents] = useState<WebhookEvent[]>([])

  useEffect(() => {
    const load = async () => {
      try {
        const [res, rpRes, weRes] = await Promise.allSettled([
          api.get("/api/payments"),
          api.get("/api/payments/razorpay"),
          api.get("/api/payments/webhook-events"),
        ])
        if (res.status === "fulfilled") setPayments(res.value.data?.data || [])
        if (rpRes.status === "fulfilled") setRazorpayPayments(rpRes.value.data?.data?.items || [])
        if (weRes.status === "fulfilled") setWebhookEvents(weRes.value.data?.data?.items || [])
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
        description="Payment intents, Razorpay records, and webhook events."
      />
      <Tabs defaultValue="intents">
        <TabsList>
          <TabsTrigger value="intents">Payment intents</TabsTrigger>
          <TabsTrigger value="razorpay">Razorpay</TabsTrigger>
          <TabsTrigger value="webhooks">Webhook events</TabsTrigger>
        </TabsList>
        <TabsContent value="intents">
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
                        No payment intents
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="razorpay">
          <Card>
            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order</TableHead>
                    <TableHead>Razorpay Order ID</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {razorpayPayments.map((p) => (
                    <TableRow key={p._id}>
                      <TableCell className="text-sm">
                        {p.orderId && typeof p.orderId === "object" && "orderNumber" in p.orderId
                          ? p.orderId.orderNumber
                          : p.orderId ?? "-"}
                      </TableCell>
                      <TableCell className="font-mono text-xs">{p.razorpayOrderId || "-"}</TableCell>
                      <TableCell>₹{p.amount ?? 0}</TableCell>
                      <TableCell>{p.status}</TableCell>
                      <TableCell>
                        {p.createdAt ? new Date(p.createdAt).toLocaleString() : "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                  {razorpayPayments.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground">
                        No Razorpay payments
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="webhooks">
          <Card>
            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Provider</TableHead>
                    <TableHead>Event ID</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {webhookEvents.map((e) => (
                    <TableRow key={e._id}>
                      <TableCell>{e.provider}</TableCell>
                      <TableCell className="font-mono text-xs truncate max-w-[200px]">
                        {e.eventId}
                      </TableCell>
                      <TableCell>{e.status ?? "-"}</TableCell>
                      <TableCell>
                        {e.createdAt ? new Date(e.createdAt).toLocaleString() : "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                  {webhookEvents.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground">
                        No webhook events
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
