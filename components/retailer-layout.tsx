'use client'

import React, { useEffect, useMemo, useState } from "react"
import { useAuth } from "@/app/auth-context"
import { useRouter } from "next/navigation"
import {
  Bell,
  FileText,
  Headphones,
  Home,
  LogOut,
  Moon,
  Package,
  RotateCcw,
  Search,
  ShoppingCart,
  Sun,
  User,
  Users,
  Zap,
  Gift,
  CreditCard,
} from "lucide-react"

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

const baseMenuItems = [
  { title: 'Dashboard', icon: Home, href: '/retailer/dashboard', id: 'dashboard' as const },
  { title: 'Complete KYC', icon: FileText, href: '/retailer/kyc', id: 'kyc' as const },
  { title: 'Catalog', icon: Package, href: '/retailer/catalog', id: 'catalog' as const },
  { title: 'Cart', icon: ShoppingCart, href: '/retailer/cart', id: 'cart' as const },
  { title: 'Orders', icon: Zap, href: '/retailer/orders', id: 'orders' as const },
  { title: 'Returns', icon: RotateCcw, href: '/retailer/returns', id: 'returns' as const },
  { title: 'Schemes & Coupons', icon: Gift, href: '/retailer/schemes', id: 'schemes' as const },
  { title: 'Loyalty', icon: Users, href: '/retailer/loyalty', id: 'loyalty' as const },
  { title: 'Payments', icon: CreditCard, href: '/retailer/payments', id: 'payments' as const },
  { title: 'Affiliate', icon: Users, href: '/retailer/affiliate', id: 'affiliate' as const },
  { title: 'Support', icon: Headphones, href: '/retailer/support', id: 'support' as const },
  { title: 'Profile', icon: User, href: '/retailer/profile', id: 'profile' as const },
]

export function RetailerLayout({ children }: { children: React.ReactNode }) {
  const { logout, user } = useAuth()
  const { isDark, setTheme } = useTheme()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [kycStatus, setKycStatus] = useState<'NOT_STARTED' | 'PENDING' | 'APPROVED' | 'REJECTED' | null>(null)

  useEffect(() => {
    const fetchKyc = async () => {
      try {
        const res = await api.get('/api/kyc/status')
        const status = res.data?.data?.kycStatus || 'NOT_STARTED'
        setKycStatus(status)
      } catch {
        setKycStatus('NOT_STARTED')
      }
    }
    fetchKyc().catch(() => undefined)
  }, [])

  const menuItems = useMemo(() => {
    return baseMenuItems.map((item) => {
      if (item.id !== 'kyc') return { ...item, badge: undefined as string | undefined }
      if (kycStatus === 'APPROVED') return { ...item, badge: undefined }
      if (kycStatus === 'REJECTED') return { ...item, badge: 'Rejected' as string }
      return { ...item, badge: 'Pending' as string }
    })
  }, [kycStatus])

  const initials = useMemo(() => {
    const name = user?.name || "Retailer"
    const parts = name.split(" ").filter(Boolean)
    return parts.slice(0, 2).map((p) => p[0]?.toUpperCase()).join("") || "RT"
  }, [user])

  const handleLogout = () => {
    logout()
    router.push('/auth/login')
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/retailer/catalog?search=${encodeURIComponent(searchQuery)}`)
    }
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <Sidebar collapsible="icon" className="border-r border-sidebar-border">
          <SidebarHeader className="border-b border-sidebar-border px-4 py-4 md:px-6">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shrink-0">
                <Package className="w-4 h-4 text-primary-foreground" aria-hidden />
              </div>
              <div>
                <h2 className="font-semibold text-sm">PharmaHub</h2>
                <p className="text-xs text-muted-foreground">Retailer Portal</p>
              </div>
            </div>
          </SidebarHeader>

          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs">Main</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {menuItems.map((item) => (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton asChild tooltip={item.title}>
                        <a
                          href={item.href}
                          className="flex items-center space-x-2 relative cursor-pointer transition-all duration-200 hover:bg-muted rounded-md"
                        >
                          <item.icon className="size-4 shrink-0" aria-hidden />
                          <span>{item.title}</span>
                          {item.badge && (
                            <Badge variant="secondary" className="ml-auto text-xs">
                              {item.badge}
                            </Badge>
                          )}
                        </a>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <div className="border-t border-sidebar-border p-4 mt-auto space-y-2">
            <div className="flex items-center space-x-2 px-2">
              <div className="w-8 h-8 bg-sidebar-accent rounded-full flex items-center justify-center text-sidebar-accent-foreground text-xs font-semibold shrink-0">
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user?.name || "Retailer"}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email || "Signed in"}</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" className="w-full justify-start text-xs" onClick={handleLogout}>
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
                  placeholder="Search medicines, brands..."
                  className="bg-muted/50 border-0 text-sm h-9 flex-1 min-w-0"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  aria-label="Search catalog"
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
                    <a href="/retailer/profile">Profile Settings</a>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={handleLogout}>
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
  )
}
