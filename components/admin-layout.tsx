"use client"

import React, { useMemo } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/app/auth-context"
import { useTheme } from "@/app/theme-provider"
import {
  LayoutDashboard,
  Users,
  Package,
  ClipboardList,
  Settings,
  Activity,
  ShieldCheck,
  Bell,
  CreditCard,
  LifeBuoy,
  BarChart3,
  FileText,
  RefreshCw,
  LogOut,
  Sun,
  Moon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar"

const menuItems = [
  { title: "Dashboard", icon: LayoutDashboard, href: "/admin/dashboard", id: "dashboard" },
  { title: "Users", icon: Users, href: "/admin/users", id: "users" },
  { title: "Products", icon: Package, href: "/admin/products", id: "products" },
  { title: "Orders", icon: ClipboardList, href: "/admin/orders", id: "orders" },
  { title: "Feature Flags", icon: Settings, href: "/admin/feature-flags", id: "feature-flags" },
  { title: "ERP Sync", icon: RefreshCw, href: "/admin/erp-sync", id: "erp-sync" },
  { title: "Loyalty & Schemes", icon: Activity, href: "/admin/loyalty", id: "loyalty" },
  { title: "Payments", icon: CreditCard, href: "/admin/payments", id: "payments" },
  { title: "Analytics", icon: BarChart3, href: "/admin/analytics", id: "analytics" },
  { title: "Compliance Logs", icon: ShieldCheck, href: "/admin/compliance", id: "compliance" },
  { title: "Banners", icon: Bell, href: "/admin/banners", id: "banners" },
  { title: "Tickets", icon: LifeBuoy, href: "/admin/tickets", id: "tickets" },
  { title: "Reports", icon: FileText, href: "/admin/reports", id: "reports" },
]

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const { logout, user } = useAuth()
  const { isDark, setTheme } = useTheme()
  const router = useRouter()

  const initials = useMemo(() => {
    const name = user?.name || "Admin"
    const parts = name.split(" ").filter(Boolean)
    return parts.slice(0, 2).map((p) => p[0]?.toUpperCase()).join("") || "AD"
  }, [user])

  const handleLogout = () => {
    logout()
    router.push("/auth/login")
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <Sidebar className="border-r">
          <SidebarHeader className="border-b px-6 py-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <LayoutDashboard className="w-4 h-4 text-primary-foreground" />
              </div>
              <div>
                <h2 className="font-semibold text-sm">PharmaHub</h2>
                <p className="text-xs text-muted-foreground">Admin Panel</p>
              </div>
            </div>
          </SidebarHeader>

          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs">Management</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {menuItems.map((item) => (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton asChild>
                        <a href={item.href} className="flex items-center space-x-2">
                          <item.icon className="w-4 h-4" />
                          <span>{item.title}</span>
                        </a>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <div className="border-t p-4 mt-auto space-y-2">
            <div className="flex items-center space-x-2 px-2">
              <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center text-xs font-semibold">
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user?.name || "Admin"}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email || "Signed in"}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-xs"
              onClick={handleLogout}
            >
              <LogOut className="w-3 h-3 mr-2" />
              Logout
            </Button>
          </div>
        </Sidebar>

        <SidebarInset className="flex-1 pt-8">
          <header className="sticky top-8 z-40 flex h-16 items-center justify-between border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6">
            <div className="flex items-center space-x-4">
              <SidebarTrigger className="-ml-1" />
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTheme(isDark ? "light" : "dark")}
              title={`Switch to ${isDark ? "light" : "dark"} mode`}
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
          </header>
          <main className="flex-1 p-6 space-y-6">{children}</main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
