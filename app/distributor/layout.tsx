"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  Bell,
  Home,
  Package,
  ClipboardList,
  Boxes,
  FileText,
  RotateCcw,
  Store,
  LifeBuoy,
  User,
  BarChart3,
  Wallet,
  Sun,
  Moon,
  Search,
  LogOut,
} from "lucide-react"

import { useAuth } from "@/app/auth-context"
import { AuthGate } from "@/components/auth-gate"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useTheme } from "@/app/theme-provider"
import { api } from "@/lib/api"

const menuItems = [
  { title: "Dashboard", icon: Home, href: "/distributor/dashboard", id: "dashboard" },
  { title: "Orders", icon: ClipboardList, href: "/distributor/orders", id: "orders" },
  { title: "Inventory", icon: Boxes, href: "/distributor/inventory", id: "inventory" },
  { title: "Invoices", icon: FileText, href: "/distributor/invoices", id: "invoices" },
  { title: "Settlements", icon: Wallet, href: "/distributor/settlements", id: "settlements" },
  { title: "Analytics", icon: BarChart3, href: "/distributor/analytics", id: "analytics" },
  { title: "Returns", icon: RotateCcw, href: "/distributor/returns", id: "returns" },
  { title: "Retailers", icon: Store, href: "/distributor/retailers", id: "retailers" },
  { title: "Support", icon: LifeBuoy, href: "/distributor/support", id: "support" },
  { title: "Profile", icon: User, href: "/distributor/profile", id: "profile" },
]

export default function DistributorLayout({ children }: { children: React.ReactNode }) {
  const { user, logout: authLogout } = useAuth()
  const { isDark, setTheme } = useTheme()
  const pathname = usePathname()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [ordersCount, setOrdersCount] = useState<number | null>(null)

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get("/api/distributor/orders")
        const data = res.data?.data
        const list = Array.isArray(data) ? data : []
        const pending = list.filter(
          (o: any) => (o.workflow?.distributorStatus || o.distributorStatus) === "PENDING_APPROVAL"
        )
        setOrdersCount(pending.length)
      } catch {
        setOrdersCount(0)
      }
    }
    fetchOrders().catch(() => undefined)
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/distributor/orders?search=${encodeURIComponent(searchQuery)}`)
    }
  }

  return (
    <AuthGate requiredAccountType="DISTRIBUTOR">
      <SidebarProvider>
        <div className="flex min-h-screen w-full bg-background">
          <Sidebar collapsible="icon" className="border-r border-sidebar-border">
            <SidebarHeader className="border-b border-sidebar-border px-4 py-4 md:px-6">
              <div className="flex items-center space-x-2">
                <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center">
                  <Package className="w-4 h-4 text-primary-foreground" />
                </div>
                <div>
                  <h2 className="font-semibold text-sm">PharmaHub</h2>
                  <p className="text-xs text-muted-foreground">Distributor Panel</p>
                </div>
              </div>
            </SidebarHeader>

            <SidebarContent>
              <SidebarGroup>
                <SidebarGroupLabel className="text-xs">Operations</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {menuItems.map((item) => {
                      const isActive = pathname === item.href || pathname?.startsWith(item.href + "/")
                      return (
                        <SidebarMenuItem key={item.id}>
                          <SidebarMenuButton asChild data-active={isActive} tooltip={item.title}>
                            <Link
                              href={item.href}
                              className={`flex items-center space-x-2 cursor-pointer transition-all duration-200 rounded-md ${
                                isActive ? "bg-sidebar-accent text-sidebar-accent-foreground" : "hover:bg-muted"
                              }`}
                            >
                              <item.icon className="size-4 shrink-0" aria-hidden />
                              <span>{item.title}</span>
                              {item.id === "orders" && ordersCount !== null && ordersCount > 0 && (
                                <Badge variant="secondary" className="ml-auto text-xs">
                                  {ordersCount > 99 ? "99+" : ordersCount}
                                </Badge>
                              )}
                            </Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      )
                    })}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>

            <div className="border-t border-sidebar-border p-4 mt-auto space-y-2">
              <div className="flex items-center space-x-2 px-2">
                <div className="w-8 h-8 bg-sidebar-accent rounded-full flex items-center justify-center text-sidebar-accent-foreground text-xs font-semibold shrink-0">
                  {(user?.name || "D").slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{user?.name || "Distributor"}</p>
                  <p className="text-xs text-muted-foreground truncate">{user?.email || "Signed in"}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-xs"
                onClick={() => {
                  authLogout()
                  router.push("/auth/login")
                }}
              >
                <LogOut className="w-3 h-3 mr-2" />
                Logout
              </Button>
            </div>
          </Sidebar>

          <SidebarInset className="flex-1">
            <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-border bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:px-6">
              <div className="flex items-center gap-2 md:gap-4 flex-1 min-w-0">
                <SidebarTrigger className="-ml-1 shrink-0" aria-label="Toggle sidebar" />
                <form onSubmit={handleSearch} className="hidden md:flex items-center flex-1 max-w-md">
                  <Search className="size-4 text-muted-foreground shrink-0" aria-hidden />
                  <Input
                    placeholder="Search orders, retailers..."
                    className="bg-muted/50 border-0 text-sm h-9 flex-1 min-w-0"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    aria-label="Search orders"
                  />
                </form>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9"
                  onClick={() => setTheme(isDark ? "light" : "dark")}
                  title={isDark ? "Switch to light mode" : "Switch to dark mode"}
                  aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
                >
                  {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
                </Button>
                <Button variant="ghost" size="icon" className="h-9 w-9 relative" aria-label="Notifications">
                  <Bell className="size-4" />
                  <span className="absolute top-1 right-1 size-2 bg-destructive rounded-full" aria-hidden />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-9 w-9" aria-label="Open profile menu">
                      <User className="size-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href="/distributor/profile">Profile Settings</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={() => {
                        authLogout()
                        router.push("/auth/login")
                      }}
                    >
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </header>

            <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-4 md:py-6 space-y-4 md:space-y-6">
              {children}
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </AuthGate>
  )
}
