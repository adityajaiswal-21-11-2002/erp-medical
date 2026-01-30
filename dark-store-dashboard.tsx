"use client"

import { useState } from "react"
import {
  BarChart3,
  DollarSign,
  Package,
  ShoppingCart,
  TrendingUp,
  Users,
  AlertCircle,
  Filter,
  Download,
  Bell,
  Settings,
  FileText,
  Pill,
  Truck,
  Gift,
  Headphones,
  LogOut,
  Moon,
  Sun,
  Menu,
  Search,
  ChevronDown,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

import { RevenueChart } from "./components/revenue-chart"
import { DemandChart } from "./components/demand-chart"
import { TopProducts } from "./components/top-products"
import { AlertsPanel } from "./components/alerts-panel"
import { RetailersKYC } from "./components/retailers-kyc"
import { ProductCatalog } from "./components/product-catalog"
import { OrdersManagement } from "./components/orders-management"
import { PaymentsReconciliation } from "./components/payments-reconciliation"
import { ERPSyncConsole } from "./components/erp-sync-console"
import { LoyaltyRewards } from "./components/loyalty-rewards"
import { SupportTickets } from "./components/support-tickets"
import { SystemSettings } from "./components/system-settings"
import { useTheme } from "@/app/theme-provider"

const primaryMenuItems = [
  { title: "Dashboard", icon: BarChart3, id: "dashboard", isActive: true },
  { title: "Retailers", icon: Users, id: "retailers", isActive: false },
  { title: "Catalog", icon: Pill, id: "catalog", isActive: false },
  { title: "ERP Sync", icon: Truck, id: "erp", isActive: false },
]

const secondaryMenuItems = [
  { title: "Orders", icon: ShoppingCart, id: "orders", isActive: false },
  { title: "Payments", icon: DollarSign, id: "payments", isActive: false },
  { title: "Loyalty", icon: Gift, id: "loyalty", isActive: false },
  { title: "Support", icon: Headphones, id: "support", isActive: false },
]

const tertiaryMenuItems = [
  { title: "Notifications", icon: Bell, id: "notifications", isActive: false },
  { title: "Reports", icon: FileText, id: "reports", isActive: false },
  { title: "Audit Logs", icon: AlertCircle, id: "audit", isActive: false },
  { title: "Settings", icon: Settings, id: "settings", isActive: false },
]

const menuItems = [...primaryMenuItems, ...secondaryMenuItems, ...tertiaryMenuItems];

export default function DarkStoreDashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState("7d")
  const [activeModule, setActiveModule] = useState("dashboard")
  const { theme, setTheme, isDark } = useTheme()

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <Sidebar className="border-r">
          {/* Sidebar Header */}
          <SidebarHeader className="border-b px-6 py-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
                <Pill className="w-4 h-4 text-white" />
              </div>
              <div>
                <h2 className="font-semibold text-sm">PharmaHub</h2>
                <p className="text-xs text-muted-foreground">Distribution Admin</p>
              </div>
            </div>
          </SidebarHeader>

          {/* Sidebar Content */}
          <SidebarContent className="space-y-2">
            {/* Primary Navigation */}
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs">Main</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {primaryMenuItems.map((item) => (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton 
                        onClick={() => setActiveModule(item.id)}
                        isActive={activeModule === item.id}
                        asChild
                      >
                        <button className="flex items-center space-x-2 w-full">
                          <item.icon className="w-4 h-4" />
                          <span>{item.title}</span>
                        </button>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            {/* Operations Navigation */}
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs">Operations</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {secondaryMenuItems.map((item) => (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton 
                        onClick={() => setActiveModule(item.id)}
                        isActive={activeModule === item.id}
                        asChild
                      >
                        <button className="flex items-center space-x-2 w-full">
                          <item.icon className="w-4 h-4" />
                          <span>{item.title}</span>
                        </button>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            {/* Administration Navigation */}
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs">Admin</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {tertiaryMenuItems.map((item) => (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton 
                        onClick={() => setActiveModule(item.id)}
                        isActive={activeModule === item.id}
                        asChild
                      >
                        <button className="flex items-center space-x-2 w-full">
                          <item.icon className="w-4 h-4" />
                          <span>{item.title}</span>
                        </button>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          {/* Sidebar Footer */}
          <div className="border-t p-4 mt-auto space-y-2">
            <div className="flex items-center space-x-2 px-2">
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                RJ
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">Raj Kumar</p>
                <p className="text-xs text-muted-foreground truncate">admin@pharma.io</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" className="w-full justify-start text-xs">
              <LogOut className="w-3 h-3 mr-2" />
              Logout
            </Button>
          </div>
        </Sidebar>

        <SidebarInset className="flex-1">
          {/* Top Header/Navbar */}
          <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6">
            <div className="flex items-center space-x-4 flex-1">
              <SidebarTrigger className="-ml-1" />
              <div className="hidden md:flex items-center space-x-2 flex-1 max-w-md">
                <Search className="w-4 h-4 text-muted-foreground" />
                <Input 
                  placeholder="Search retailers, products, orders..." 
                  className="bg-muted border-0 text-sm h-9"
                />
              </div>
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
                    <Menu className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>Profile Settings</DropdownMenuItem>
                  <DropdownMenuItem>Account</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Help & Support</DropdownMenuItem>
                  <DropdownMenuItem className="text-red-600">Logout</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          {/* Page Header with Breadcrumbs */}
          <div className="border-b bg-muted/30 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">
                  {activeModule === "dashboard" && "Dashboard"}
                  {activeModule === "retailers" && "Retailers KYC Management"}
                  {activeModule === "catalog" && "Product Catalog"}
                  {activeModule === "orders" && "Orders"}
                  {activeModule === "payments" && "Payments & Reconciliation"}
                  {activeModule === "erp" && "ERP Sync"}
                  {activeModule === "loyalty" && "Loyalty Programs"}
                  {activeModule === "support" && "Support Tickets"}
                  {activeModule === "notifications" && "Notifications"}
                  {activeModule === "reports" && "Reports"}
                  {activeModule === "audit" && "Audit Logs"}
                  {activeModule === "settings" && "Settings"}
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  {activeModule === "dashboard" && "Welcome back! Here's your pharma distribution overview."}
                  {activeModule === "retailers" && "Manage retailer profiles, verification documents, and compliance."}
                  {activeModule === "catalog" && "Track inventory levels, pricing, and product status across the network."}
                  {activeModule === "orders" && "Track and manage all retail orders across the distribution network."}
                  {activeModule === "payments" && "View payment status, settlements, and financial reconciliation."}
                  {activeModule === "erp" && "Monitor ERP synchronization jobs, error logs, and manual sync triggers."}
                  {activeModule === "loyalty" && "Configure loyalty programs, tier management, rewards catalog, and redemption approvals."}
                  {activeModule === "support" && "Manage support tickets, assign to teams, and track SLA compliance."}
                  {activeModule === "notifications" && "Manage system notifications and announcements."}
                  {activeModule === "reports" && "Generate and view analytics reports."}
                  {activeModule === "audit" && "View system activity and audit logs."}
                  {activeModule === "settings" && "Configure ERP, payment, notification, and security settings."}
                </p>
              </div>
              {activeModule === "dashboard" && (
                <div className="flex items-center space-x-2">
                  <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1d">Today</SelectItem>
                      <SelectItem value="7d">7 Days</SelectItem>
                      <SelectItem value="30d">30 Days</SelectItem>
                      <SelectItem value="90d">90 Days</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="sm">
                    <Filter className="w-4 h-4 mr-2" />
                    Filter
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Main Content */}
          <main className="flex-1 p-6 space-y-6 bg-background">
            {/* Conditional Module Rendering */}
            {activeModule === "dashboard" && (
              <div>
                {/* KPI Cards - Pharma Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Card className="border">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
                      <DollarSign className="h-4 w-4 text-emerald-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">₹45,23,450</div>
                      <p className="text-xs text-muted-foreground">
                        <span className="text-green-600">+8.2%</span> from last month
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="border">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Active Retailers</CardTitle>
                      <Users className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">384</div>
                      <p className="text-xs text-muted-foreground">
                        <span className="text-green-600">+12</span> joined this month
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="border">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
                      <ShoppingCart className="h-4 w-4 text-amber-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">247</div>
                      <p className="text-xs text-muted-foreground">
                        Avg fulfillment: 2.4 hrs
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="border">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Compliance Issues</CardTitle>
                      <AlertCircle className="h-4 w-4 text-red-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-red-600">8</div>
                      <p className="text-xs text-muted-foreground">Require immediate attention</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Revenue & Profit Trends</CardTitle>
                      <CardDescription>Monthly performance overview</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <RevenueChart />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Demand vs Supply</CardTitle>
                      <CardDescription>Category-wise analysis</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <DemandChart />
                    </CardContent>
                  </Card>
                </div>

                {/* Bottom Row */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2">
                    <TopProducts />
                  </div>
                  <div>
                    <AlertsPanel />
                  </div>
                </div>

                {/* Pharma-Specific Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="border">
                    <CardHeader>
                      <CardTitle className="text-base font-semibold">Inventory Status</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">SKUs in Stock</span>
                        <Badge className="bg-emerald-100 text-emerald-800">2,847</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Low Stock Alerts</span>
                        <Badge className="bg-amber-100 text-amber-800">34</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Expiry Soon (30d)</span>
                        <Badge className="bg-orange-100 text-orange-800">12</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Stockout Items</span>
                        <Badge className="bg-red-100 text-red-800">5</Badge>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border">
                    <CardHeader>
                      <CardTitle className="text-base font-semibold">KYC Compliance</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Verified Retailers</span>
                        <span className="font-bold text-emerald-600">284</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Pending Verification</span>
                        <span className="font-bold text-amber-600">18</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Documents Expired</span>
                        <span className="font-bold text-red-600">8</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">License Renewal Soon</span>
                        <span className="font-bold text-orange-600">6</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border">
                    <CardHeader>
                      <CardTitle className="text-base font-semibold">Payment Status</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Payments Processed</span>
                        <span className="font-bold">₹38,45,600</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Pending Settlements</span>
                        <span className="font-bold text-amber-600">₹2,34,500</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Failed Transactions</span>
                        <Badge className="bg-red-100 text-red-800">3</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Avg Settlement Time</span>
                        <Badge variant="secondary">2.5 days</Badge>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
            {activeModule === "retailers" && <RetailersKYC />}
            {activeModule === "catalog" && <ProductCatalog />}
            {activeModule === "orders" && <OrdersManagement />}
            {activeModule === "payments" && <PaymentsReconciliation />}

            {/* ERP Sync Console Module */}
            {activeModule === "erp" && <ERPSyncConsole />}

            {/* Loyalty & Rewards Module */}
            {activeModule === "loyalty" && <LoyaltyRewards />}

            {/* Support Tickets Module */}
            {activeModule === "support" && <SupportTickets />}

            {activeModule === "notifications" && (
              <div className="text-center py-12">
                <Bell className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Notifications Manager</h3>
                <p className="text-muted-foreground">Module implementation in progress</p>
              </div>
            )}

            {activeModule === "reports" && (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Analytics & Reports</h3>
                <p className="text-muted-foreground">Module implementation in progress</p>
              </div>
            )}

            {activeModule === "audit" && (
              <div className="text-center py-12">
                <AlertCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Audit Logs</h3>
                <p className="text-muted-foreground">Module implementation in progress</p>
              </div>
            )}

            {/* System Settings Module */}
            {activeModule === "settings" && <SystemSettings />}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
