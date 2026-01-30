"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { api } from "@/lib/api"
import { PageHeader } from "@/components/page-header"
import { Card, CardContent } from "@/components/ui/card"

export default function DistributorAnalyticsPage() {
  const [stats, setStats] = useState({ total: 0, pending: 0, shipped: 0 })

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/api/distributor/orders")
        const orders = res.data?.data || []
        setStats({
          total: orders.length,
          pending: orders.filter((o: any) => o.workflow?.distributorStatus === "PENDING_APPROVAL").length,
          shipped: orders.filter((o: any) => o.workflow?.distributorStatus === "SHIPPED").length,
        })
      } catch (error: any) {
        toast.error(error?.response?.data?.error || "Failed to load analytics")
      }
    }
    load().catch(() => undefined)
  }, [])

  return (
    <div className="space-y-6">
      <PageHeader title="Analytics" description="Basic fulfillment metrics." />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Total Orders</p>
            <p className="text-2xl font-bold">{stats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Pending Approval</p>
            <p className="text-2xl font-bold">{stats.pending}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Shipped</p>
            <p className="text-2xl font-bold">{stats.shipped}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
