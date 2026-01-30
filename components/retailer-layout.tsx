'use client'

import React, { useMemo, useState } from "react"
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

const menuItems = [
  { title: 'Dashboard', icon: Home, href: '/retailer/dashboard', id: 'dashboard' },
  { title: 'Complete KYC', icon: FileText, href: '/retailer/kyc', id: 'kyc', badge: 'Pending' },
  { title: 'Catalog', icon: Package, href: '/retailer/catalog', id: 'catalog' },
  { title: 'Cart', icon: ShoppingCart, href: '/retailer/cart', id: 'cart' },
  { title: 'Orders', icon: Zap, href: '/retailer/orders', id: 'orders' },
  { title: 'Returns', icon: RotateCcw, href: '/retailer/returns', id: 'returns' },
  { title: 'Schemes & Coupons', icon: Gift, href: '/retailer/schemes', id: 'schemes' },
  { title: 'Loyalty', icon: Users, href: '/retailer/loyalty', id: 'loyalty' },
  { title: 'Payments', icon: CreditCard, href: '/retailer/payments', id: 'payments' },
  { title: 'Affiliate', icon: Users, href: '/retailer/affiliate', id: 'affiliate' },
  { title: 'Support', icon: Headphones, href: '/retailer/support', id: 'support' },
  { title: 'Profile', icon: User, href: '/retailer/profile', id: 'profile' },
]

export function RetailerLayout({ children }: { children: React.ReactNode }) {
  const { logout, user } = useAuth()
  const { isDark, setTheme } = useTheme()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')

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
        <Sidebar className="border-r">
          <SidebarHeader className="border-b px-6 py-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
                <Package className="w-4 h-4 text-white" />
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
                      <SidebarMenuButton asChild>
                        <a href={item.href} className="flex items-center space-x-2 relative">
                          <item.icon className="w-4 h-4" />
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

          <div className="border-t p-4 mt-auto space-y-2">
            <div className="flex items-center space-x-2 px-2">
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center text-white text-xs font-semibold">
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

        <SidebarInset className="flex-1 pt-8">
          <header className="sticky top-8 z-40 flex h-16 items-center justify-between border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6">
            <div className="flex items-center space-x-4 flex-1">
              <SidebarTrigger className="-ml-1" />
              <form onSubmit={handleSearch} className="hidden md:flex items-center space-x-2 flex-1 max-w-md">
                <Search className="w-4 h-4 text-muted-foreground" />
                <Input 
                  placeholder="Search medicines, brands..." 
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
                onClick={() => setTheme(isDark ? 'light' : 'dark')}
                title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
              >
                {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </Button>

              <Button variant="ghost" size="sm" className="relative">
                <Bell className="w-4 h-4" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <User className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <a href="/retailer/profile">Profile Settings</a>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-red-600" onClick={handleLogout}>
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          <main className="flex-1 p-6 space-y-6">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
