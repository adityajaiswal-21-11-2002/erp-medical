'use client'

import React from "react"
import Link from "next/link"
import { useAuth } from "@/app/auth-context"
import { Button } from "@/components/ui/button"
import {
  Package,
  Store,
  Truck,
  ShoppingBag,
  Shield,
  LayoutDashboard,
  LogOut,
  ArrowRight,
  CheckCircle2,
} from "lucide-react"
import { cn } from "@/lib/utils"

function HomeHeader() {
  const { isAuthenticated, user, accountType, logout, isLoading } = useAuth()

  const dashboardHref =
    accountType === "ADMIN"
      ? "/admin/dashboard"
      : accountType === "DISTRIBUTOR"
        ? "/distributor/dashboard"
        : accountType === "CUSTOMER"
          ? "/customer"
          : "/retailer/dashboard"

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 sm:h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-lg"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <Package className="h-5 w-5" />
          </div>
          <span className="text-lg font-bold tracking-tight text-foreground sm:text-xl">
            PharmaHub
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-2 sm:flex">
          {!isLoading && (
            <>
              {isAuthenticated ? (
                <>
                  <Button variant="ghost" size="sm" asChild className="gap-2">
                    <Link href={dashboardHref}>Dashboard</Link>
                  </Button>
                  <span className="hidden max-w-[160px] truncate text-sm text-muted-foreground lg:block">
                    {user?.name || user?.email}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      logout()
                      window.location.href = "/"
                    }}
                    className="gap-2 shrink-0"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </Button>
                </>
              ) : (
                <Button size="sm" asChild className="gap-2">
                  <Link href="/auth/login">
                    Login
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              )}
            </>
          )}
        </nav>

        {/* Mobile menu button */}
        <div className="flex items-center gap-2 sm:hidden">
          {!isLoading && !isAuthenticated && (
            <Button size="sm" asChild className="gap-1.5">
              <Link href="/auth/login">Login</Link>
            </Button>
          )}
          {!isLoading && isAuthenticated && (
            <>
              <Button variant="ghost" size="icon" asChild className="h-9 w-9">
                <Link href={dashboardHref} aria-label="Dashboard">
                  <LayoutDashboard className="h-5 w-5" />
                </Link>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  logout()
                  window.location.href = "/"
                }}
                className="gap-1.5"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

const roleCards = [
  {
    href: "/auth/login?role=retailer",
    icon: Store,
    title: "Retailers",
    description: "Order stock, manage KYC, track loyalty and payments.",
    label: "Retailer login",
    iconBg: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
    gradient: "from-emerald-500/10 to-transparent",
  },
  {
    href: "/auth/login?role=distributor",
    icon: Truck,
    title: "Distributors",
    description: "Fulfill orders, manage inventory, invoices and settlements.",
    label: "Distributor login",
    iconBg: "bg-blue-500/15 text-blue-700 dark:text-blue-400",
    gradient: "from-blue-500/10 to-transparent",
  },
  {
    href: "/auth/login?role=customer",
    icon: ShoppingBag,
    title: "Customers",
    description: "Browse catalog, place orders, and track deliveries.",
    label: "Customer login",
    iconBg: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
    gradient: "from-amber-500/10 to-transparent",
  },
  {
    href: "/auth/login?role=admin",
    icon: Shield,
    title: "Admin",
    description: "Users, products, ERP sync, tickets and compliance.",
    label: "Admin login",
    iconBg: "bg-slate-500/15 text-slate-700 dark:text-slate-400",
    gradient: "from-slate-500/10 to-transparent",
  },
]

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Subtle background pattern */}
      <div
        className="fixed inset-0 -z-10 opacity-[0.02] dark:opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
          backgroundSize: "40px 40px",
        }}
      />
      <div className="fixed inset-0 -z-10 bg-gradient-to-b from-muted/20 via-transparent to-muted/30" />

      <HomeHeader />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-border/40 px-4 pb-16 pt-10 sm:px-6 sm:pb-24 sm:pt-14 md:pb-32 md:pt-20 lg:px-8">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_50%_at_50%_-30%,hsl(var(--primary)/0.12),transparent_70%)]" />
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border/50 to-transparent" />
          <div className="mx-auto max-w-4xl text-center">
            <p className="text-sm font-medium uppercase tracking-widest text-primary/80 sm:text-base">
              Distribution platform
            </p>
            <h1 className="mt-4 text-[2.25rem] font-bold leading-[1.15] tracking-tight text-foreground sm:text-4xl md:text-5xl lg:text-6xl">
              Pharmaceutical distribution,{" "}
              <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                simplified
              </span>
            </h1>
            <p className="mt-5 text-base leading-relaxed text-muted-foreground sm:text-lg md:mt-6 md:text-xl md:leading-relaxed">
              One platform for retailers, distributors, and customers. Order
              medicines, manage inventory, and grow your business with PharmaHub.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4 md:mt-10">
              <Button
                size="lg"
                asChild
                className="w-full gap-2 text-base shadow-lg sm:w-auto sm:min-w-[180px]"
              >
                <Link href="/auth/login">
                  Get started
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="w-full sm:w-auto sm:min-w-[180px]"
              >
                <Link href="/auth/login">Login to your account</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Role cards */}
        <section className="px-4 py-14 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
          <div className="mx-auto max-w-6xl">
            <div className="text-center">
              <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl md:text-4xl">
                Built for every part of the supply chain
              </h2>
              <p className="mx-auto mt-3 max-w-2xl text-base text-muted-foreground sm:text-lg">
                Choose your role and access the right tools—retailers,
                distributors, customers, and admins all in one place.
              </p>
            </div>
            <div className="mt-10 grid gap-5 sm:mt-14 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4 lg:gap-6">
              {roleCards.map((card) => {
                const Icon = card.icon
                return (
                  <Link
                    key={card.href}
                    href={card.href}
                    className={cn(
                      "group relative flex flex-col rounded-2xl border border-border/60 bg-card p-6 text-left shadow-sm transition-all duration-300",
                      "hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5",
                      "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background",
                      "min-h-[200px] sm:min-h-[220px]"
                    )}
                  >
                    <div
                      className={cn(
                        "absolute inset-0 rounded-2xl bg-gradient-to-br opacity-0 transition-opacity group-hover:opacity-100",
                        card.gradient
                      )}
                    />
                    <div
                      className={cn(
                        "relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-transform group-hover:scale-105",
                        card.iconBg
                      )}
                    >
                      <Icon className="h-6 w-6" strokeWidth={2} />
                    </div>
                    <h3 className="relative mt-4 text-lg font-semibold text-foreground sm:text-xl">
                      {card.title}
                    </h3>
                    <p className="relative mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                      {card.description}
                    </p>
                    <span className="relative mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary">
                      {card.label}
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </Link>
                )
              })}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="border-t border-border/40 px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br from-muted/50 to-muted/30 px-6 py-12 text-center sm:px-10 sm:py-14">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_50%,hsl(var(--primary)/0.06),transparent)]" />
              <div className="relative">
                <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/80 px-4 py-2 text-sm text-muted-foreground shadow-sm">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  Secure login · Role-based access
                </div>
                <h2 className="mt-6 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                  Ready to get started?
                </h2>
                <p className="mt-3 text-muted-foreground sm:text-lg">
                  Sign in with your credentials. You’ll be taken to the right
                  dashboard for your role.
                </p>
                <Button
                  size="lg"
                  className="mt-6 gap-2 shadow-md sm:mt-8"
                  asChild
                >
                  <Link href="/auth/login">
                    Login
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-border/40 bg-muted/20 px-4 py-8 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
              <Link
                href="/"
                className="flex items-center gap-2 text-foreground hover:opacity-90"
              >
                <Package className="h-5 w-5 text-muted-foreground" />
                <span className="font-semibold">PharmaHub Distribution</span>
              </Link>
              <p className="text-center text-sm text-muted-foreground sm:text-left">
                © {new Date().getFullYear()} PharmaHub. All rights reserved.
              </p>
              <div className="flex gap-6">
                <Link
                  href="/auth/login"
                  className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  Login
                </Link>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  )
}
