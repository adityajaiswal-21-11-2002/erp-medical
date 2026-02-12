"use client"

import { useEffect, useState } from "react"
import { PageShell, PageHeader, StatCard, StatCards, ErrorState, StatCardsSkeleton } from "@/components/ui-kit"
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
  const [kpis, setKpis] = useState<KpiState | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    trackEvent("page_view", { page: "admin_dashboard" })
    const fetchKpis = async () => {
      try {
        setError(null)
        const [usersRes, productsRes, ordersRes] = await Promise.allSettled([
          api.get("/api/users?limit=1"),
          api.get("/api/products?limit=1"),
          api.get("/api/orders?limit=100"),
        ])

        const users =
          usersRes.status === "fulfilled" ? usersRes.value.data?.data?.total ?? 0 : 0
        const products =
          productsRes.status === "fulfilled" ? productsRes.value.data?.data?.total ?? 0 : 0
        const ordersData =
          ordersRes.status === "fulfilled" ? ordersRes.value.data?.data?.items ?? [] : []
        const ordersTotal =
          ordersRes.status === "fulfilled" ? ordersRes.value.data?.data?.total ?? 0 : 0
        const revenue = ordersData.reduce(
          (sum: number, order: { netAmount?: number }) => sum + (order.netAmount ?? 0),
          0
        )

        setKpis({ users, products, orders: ordersTotal, revenue })
      } catch (e) {
        setError("Failed to load dashboard data.")
      }
    }

    fetchKpis().catch(() => setError("Failed to load dashboard data."))
  }, [])

  return (
    <PageShell maxWidth="content" className="space-y-4 md:space-y-6">
      <PageHeader
        title="Admin Dashboard"
        subtitle="Overview of users, inventory, and orders."
        breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "Dashboard" }]}
      />

      {error && (
        <ErrorState message={error} onRetry={() => window.location.reload()} />
      )}

      {!error && !kpis && <StatCardsSkeleton count={4} />}

      {!error && kpis && (
        <StatCards>
          <StatCard
            title="Users"
            value={kpis.users}
            description="Active system users"
            icon={<Users className="size-4" />}
          />
          <StatCard
            title="Products"
            value={kpis.products}
            description="Catalog items"
            icon={<Package className="size-4" />}
          />
          <StatCard
            title="Orders"
            value={kpis.orders}
            description="Total orders"
            icon={<ClipboardList className="size-4" />}
          />
          <StatCard
            title="Revenue"
            value={`₹${kpis.revenue.toFixed(0)}`}
            description="From latest 100 orders"
            icon={<TrendingUp className="size-4" />}
          />
        </StatCards>
      )}
    </PageShell>
  )
}
