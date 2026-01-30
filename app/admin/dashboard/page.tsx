'use client'

import { useEffect, useState } from "react"
import { PageHeader } from "@/components/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Package, ClipboardList, TrendingUp } from "lucide-react"
import { api } from "@/lib/api"
import { trackEvent } from "@/lib/analytics"

type KpiState = {
  users: number
  products: number
  orders: number
  revenue: number
}

export default function AdminDashboardPage() {
  const [kpis, setKpis] = useState<KpiState>({
    users: 0,
    products: 0,
    orders: 0,
    revenue: 0,
  })

  useEffect(() => {
    trackEvent("page_view", { page: "admin_dashboard" })
    const fetchKpis = async () => {
      const [usersRes, productsRes, ordersRes] = await Promise.allSettled([
        api.get("/api/users?limit=1"),
        api.get("/api/products?limit=1"),
        api.get("/api/orders?limit=100"),
      ])

      const users =
        usersRes.status === "fulfilled" ? usersRes.value.data?.data?.total || 0 : 0
      const products =
        productsRes.status === "fulfilled" ? productsRes.value.data?.data?.total || 0 : 0
      const ordersData =
        ordersRes.status === "fulfilled" ? ordersRes.value.data?.data?.items || [] : []
      const ordersTotal =
        ordersRes.status === "fulfilled" ? ordersRes.value.data?.data?.total || 0 : 0
      const revenue = ordersData.reduce(
        (sum: number, order: any) => sum + (order.netAmount || 0),
        0,
      )

      setKpis({ users, products, orders: ordersTotal, revenue })
    }

    fetchKpis().catch(() => undefined)
  }, [])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Admin Dashboard"
        description="Overview of users, inventory, and orders."
      />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis.users}</div>
            <p className="text-xs text-muted-foreground">Active system users</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis.products}</div>
            <p className="text-xs text-muted-foreground">Catalog items</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Orders</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis.orders}</div>
            <p className="text-xs text-muted-foreground">Total orders</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{kpis.revenue.toFixed(0)}</div>
            <p className="text-xs text-muted-foreground">From latest 100 orders</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
