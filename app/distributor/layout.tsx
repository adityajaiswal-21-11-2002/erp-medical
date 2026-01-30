"use client"

import React, { useState } from "react"
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
  const { isDark, setTheme } = useTheme()
  const pathname = usePathname()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")

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
          <Sidebar className="border-r">
            <SidebarHeader className="border-b px-6 py-4">
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
                          <SidebarMenuButton asChild data-active={isActive}>
                            <Link
                              href={item.href}
                              className={`flex items-center space-x-2 ${
                                isActive ? "bg-muted text-foreground" : ""
                              }`}
                            >
                              <item.icon className="w-4 h-4" />
                              <span>{item.title}</span>
                              {item.id === "orders" && (
                                <Badge variant="secondary" className="ml-auto text-xs">
                                  12
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

            <div className="border-t p-4 mt-auto space-y-2">
              <div className="flex items-center space-x-2 px-2">
                <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center text-foreground text-xs font-semibold">
                  DP
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">Delta Pharma</p>
                  <p className="text-xs text-muted-foreground truncate">ID: DIST-092</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-xs"
                onClick={() => router.push("/auth/login")}
              >
                <LogOut className="w-3 h-3 mr-2" />
                Logout
              </Button>
            </div>
          </Sidebar>

          <SidebarInset className="flex-1">
            <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6">
              <div className="flex items-center space-x-4 flex-1">
                <SidebarTrigger className="-ml-1" />
                <form onSubmit={handleSearch} className="hidden md:flex items-center space-x-2 flex-1 max-w-md">
                  <Search className="w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search orders, retailers..."
                    className="bg-muted border-0 text-sm h-9"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </form>
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setTheme(isDark ? "light" : "dark")}
                  title={`Switch to ${isDark ? "light" : "dark"} mode`}
                >
                  {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </Button>
                <Button variant="ghost" size="sm" className="relative">
                  <Bell className="w-4 h-4" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <User className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href="/distributor/profile">Profile Settings</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive" onClick={() => router.push("/auth/login")}>
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </header>

            <main className="flex-1 p-6 space-y-6">{children}</main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </AuthGate>
  )
}
