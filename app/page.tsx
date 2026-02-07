'use client'

import React from "react"
import Link from "next/link"
import Image from "next/image"
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
  Zap,
  BarChart3,
  FileCheck,
  Users,
  Quote,
  Star,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { LandingHero } from "@/components/landing/hero"

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
        <LandingHero />

        {/* Features strip - Why PharmaHub */}
        <section className="border-y border-border/40 bg-gradient-to-b from-background to-muted/20 px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary/80 sm:text-sm">
                Why PharmaHub
              </p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl md:text-4xl">
                Built for speed, scale, and compliance
              </h2>
            </div>
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:mt-16 lg:grid-cols-4">
              {[
                {
                  icon: Zap,
                  title: "Real-time sync",
                  desc: "Live inventory, pricing, and order status across your entire network.",
                  accent: "from-amber-500/20 to-amber-600/10",
                  iconBg: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
                },
                {
                  icon: BarChart3,
                  title: "Smart analytics",
                  desc: "Revenue, margins, and scheme performance at your fingertips.",
                  accent: "from-emerald-500/20 to-emerald-600/10",
                  iconBg: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
                },
                {
                  icon: FileCheck,
                  title: "GST-ready docs",
                  desc: "Invoices, credit notes, and e-way bills generated automatically.",
                  accent: "from-blue-500/20 to-blue-600/10",
                  iconBg: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
                },
                {
                  icon: Users,
                  title: "Role-based access",
                  desc: "Retail, distribution, and admin—each with the right permissions.",
                  accent: "from-violet-500/20 to-violet-600/10",
                  iconBg: "bg-violet-500/15 text-violet-600 dark:text-violet-400",
                },
              ].map((item) => {
                const Icon = item.icon
                return (
                  <div
                    key={item.title}
                    className={cn(
                      "group relative overflow-hidden rounded-2xl border border-border/60 bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/5",
                      "hover:border-primary/20"
                    )}
                  >
                    <div className={cn("absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity group-hover:opacity-100", item.accent)} />
                    <div className={cn("relative flex h-11 w-11 items-center justify-center rounded-xl", item.iconBg)}>
                      <Icon className="h-5 w-5" strokeWidth={2} />
                    </div>
                    <h3 className="relative mt-4 font-semibold text-foreground">{item.title}</h3>
                    <p className="relative mt-2 text-sm leading-relaxed text-muted-foreground">{item.desc}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* Role cards */}
        <section className="relative px-4 py-16 sm:px-6 sm:py-24 lg:px-8 lg:py-28">
          <div className="mx-auto max-w-6xl">
            <div className="text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary/80 sm:text-sm">
                Choose your role
              </p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl md:text-4xl">
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
                      "group relative flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-card p-6 text-left shadow-sm transition-all duration-300",
                      "hover:border-primary/30 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-2",
                      "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background",
                      "min-h-[220px] sm:min-h-[240px]"
                    )}
                  >
                    <div
                      className={cn(
                        "absolute inset-0 rounded-2xl bg-gradient-to-br opacity-0 transition-opacity duration-300 group-hover:opacity-100",
                        card.gradient
                      )}
                    />
                    <div
                      className={cn(
                        "relative flex h-14 w-14 shrink-0 items-center justify-center rounded-xl transition-all duration-300 group-hover:scale-110",
                        card.iconBg
                      )}
                    >
                      <Icon className="h-7 w-7" strokeWidth={2} />
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

        {/* How it works + key capabilities */}
        <section className="border-y border-border/40 bg-muted/20 px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <div className="mx-auto flex max-w-6xl flex-col gap-10 lg:flex-row lg:items-start">
            <div className="max-w-xl">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary/80 sm:text-sm">
                How PharmaHub fits in
              </p>
              <h2 className="mt-3 text-2xl font-bold tracking-tight text-foreground sm:text-3xl md:text-4xl">
                A simple three‑step flow from store counter to central ERP.
              </h2>
              <ol className="mt-6 space-y-4 text-sm text-muted-foreground sm:text-base">
                <li className="flex gap-3">
                  <span className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                    1
                  </span>
                  <div>
                    <p className="font-semibold text-foreground">Retailers raise clean, structured orders.</p>
                    <p className="mt-1">
                      Guided cart, scheme visibility and mandatory fields ensure every order reaches the
                      distributor with the right data the first time.
                    </p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                    2
                  </span>
                  <div>
                    <p className="font-semibold text-foreground">Distributors fulfill and reconcile faster.</p>
                    <p className="mt-1">
                      Inventory, invoicing and credit notes stay aligned with your existing ERP, reducing
                      manual entries and spreadsheets.
                    </p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                    3
                  </span>
                  <div>
                    <p className="font-semibold text-foreground">Central teams get one source of truth.</p>
                    <p className="mt-1">
                      Finance, compliance and leadership track revenue, service levels and schemes from the
                      same live dataset.
                    </p>
                  </div>
                </li>
              </ol>
            </div>

            <div className="flex-1 space-y-4">
              {/* Care & Awards images */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="relative overflow-hidden rounded-2xl border border-border/60 shadow-sm">
                  <Image
                    src="/images/home-hero-care.jpeg"
                    alt="Patient care and healthcare delivery"
                    width={400}
                    height={260}
                    className="h-48 w-full object-cover sm:h-52"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <p className="absolute bottom-4 left-4 right-4 text-sm font-semibold text-white">
                    Built for Indian pharma
                  </p>
                </div>
                <div className="relative overflow-hidden rounded-2xl border border-border/60 shadow-sm">
                  <Image
                    src="/images/home-hero-awards.jpeg"
                    alt="Industry recognition and excellence"
                    width={400}
                    height={260}
                    className="h-48 w-full object-cover sm:h-52"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <p className="absolute bottom-4 left-4 right-4 text-sm font-semibold text-white">
                    Trusted by leading networks
                  </p>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-border/60 bg-background/80 p-5 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary/80">
                    Built for Indian pharma
                  </p>
                  <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-500" />
                      <span>Supports schemes, returns and credit notes out of the box.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-500" />
                      <span>GST‑ready invoices and documentation.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-500" />
                      <span>Role‑based access for retail, distribution and admin teams.</span>
                    </li>
                  </ul>
                </div>
                <div className="rounded-2xl border border-border/60 bg-background/80 p-5 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary/80">
                    Operational safeguards
                  </p>
                  <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 text-sky-500" />
                      <span>Configurable order limits and validations at each step.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 text-sky-500" />
                      <span>Audit trails for key changes and approvals.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 text-sky-500" />
                      <span>Health‑check dashboards for KYC, compliance and SLAs.</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="rounded-2xl border border-dashed border-primary/40 bg-primary/5 px-5 py-4 text-sm text-muted-foreground sm:text-base">
                <span className="font-medium text-foreground">Already running an ERP?</span>{" "}
                PharmaHub is designed to sit on top of your existing stack—mirroring master data and
                pushing back clean transactions instead of replacing what already works.
              </div>
            </div>
          </div>
        </section>

        {/* Operations video stripe */}
        <section className="relative overflow-hidden border-t border-border/40 bg-black px-4 py-16 sm:px-6 sm:py-24 lg:px-0">
          {/* Video as subtle background */}
          <div className="absolute inset-0 overflow-hidden">
            <video
              className="h-full w-full object-cover opacity-70"
              autoPlay
              muted
              loop
              playsInline
              src="/videos/v2.mp4"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-black/40" />

          <div className="relative mx-auto flex max-w-6xl flex-col gap-10 px-0 md:flex-row md:items-center md:px-8">
            <div className="max-w-xl text-primary-foreground">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary/80 sm:text-sm">
                Live operations in motion
              </p>
              <h2 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">
                Watch a full order journey from cart to settlement.
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-primary-foreground/80 sm:text-base">
                See how retailers, distributors and finance teams all interact with the same
                platform—without leaving their workflows or losing data between systems.
              </p>
              <div className="mt-6 grid gap-4 text-sm text-primary-foreground/85 sm:grid-cols-2 sm:text-base">
                <div className="space-y-1">
                  <p className="font-semibold text-primary-foreground">Retail counters</p>
                  <p>Fast cart creation, offer visibility and accurate invoicing for every bill.</p>
                </div>
                <div className="space-y-1">
                  <p className="font-semibold text-primary-foreground">Back-office teams</p>
                  <p>Dispatch, credit notes and settlements mapped cleanly to your ERP.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="border-y border-border/40 bg-muted/30 px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary/80 sm:text-sm">
                What our partners say
              </p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl md:text-4xl">
                Trusted by pharma networks across India
              </h2>
            </div>
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:mt-16 lg:grid-cols-3">
              {[
                { quote: "PharmaHub cut our order processing time by half. Our retailers love the guided cart and scheme visibility.", author: "Distribution Lead", role: "Regional distributor" },
                { quote: "One source of truth for finance, compliance, and operations. No more spreadsheet chaos.", author: "Finance Director", role: "Central team" },
                { quote: "Clean orders, accurate invoicing, and GST-ready docs out of the box. A game-changer for our retail network.", author: "Retail Ops Manager", role: "Pharma chain" },
              ].map((testimonial, i) => (
                <div
                  key={i}
                  className="relative overflow-hidden rounded-2xl border border-border/60 bg-card p-6 shadow-sm transition-all duration-300 hover:shadow-lg"
                >
                  <Quote className="absolute right-4 top-4 h-8 w-8 text-primary/10" />
                  <div className="flex gap-1 text-amber-500">
                    {[...Array(5)].map((_, j) => (
                      <Star key={j} className="h-4 w-4 fill-current" strokeWidth={0} />
                    ))}
                  </div>
                  <p className="relative mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
                    &ldquo;{testimonial.quote}&rdquo;
                  </p>
                  <div className="mt-4 flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                      <span className="text-sm font-semibold text-primary">{testimonial.author.charAt(0)}</span>
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{testimonial.author}</p>
                      <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Integrations / Trusted strip */}
        <section className="border-y border-border/40 bg-background px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground sm:text-sm">
              Integrates with your existing stack
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-8 sm:gap-12 lg:gap-16">
              {["ERP Systems", "Accounting Software", "Inventory APIs", "GST Portal", "Payment Gateways"].map((label) => (
                <div
                  key={label}
                  className="flex items-center gap-2 rounded-xl border border-border/60 bg-muted/30 px-4 py-3 text-sm font-medium text-muted-foreground transition-colors hover:border-primary/30 hover:text-foreground"
                >
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  {label}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Metrics + leadership stripe */}
        <section className="border-t border-border/40 bg-gradient-to-b from-muted/40 to-muted/20 px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
          <div className="mx-auto flex max-w-6xl flex-col gap-10 lg:flex-row lg:items-center">
            <div className="grid flex-1 gap-6 sm:grid-cols-3">
              {[
                { label: "Order accuracy", value: "99.5%", desc: "Reduce manual errors with consistent, guided flows for every role.", accent: "border-l-emerald-500" },
                { label: "Time to dispatch", value: "-40%", desc: "Speed up picking, packing and invoicing with a single source of truth.", accent: "border-l-blue-500" },
                { label: "Happy stakeholders", value: "4.9", desc: "Simple UX that works for retailers, distributors, and central teams.", accent: "border-l-amber-500" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className={cn(
                    "relative overflow-hidden rounded-2xl border border-border/60 border-l-4 bg-background/80 p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg",
                    stat.accent
                  )}
                >
                  <p className="text-xs font-medium uppercase tracking-[0.16em] text-primary/80">{stat.label}</p>
                  <p className="mt-3 text-3xl font-bold text-foreground sm:text-4xl">{stat.value}</p>
                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground sm:text-sm">{stat.desc}</p>
                </div>
              ))}
            </div>

            <div className="flex-1">
              <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-black/80 shadow-lg shadow-primary/5">
                <div className="relative aspect-[21/9] w-full">
                  <Image
                    src="/images/home-hero-boardroom.jpeg"
                    alt="Leadership team reviewing PharmaHub dashboards"
                    fill
                    sizes="(min-width: 1024px) 640px, 100vw"
                    className="object-cover"
                    priority
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent" />
                  <div className="pointer-events-none absolute inset-y-4 left-4 flex max-w-md flex-col justify-center gap-2 text-xs text-primary-foreground sm:inset-y-6 sm:left-6 sm:text-sm">
                    <span className="inline-flex w-fit items-center gap-2 rounded-full bg-black/60 px-3 py-1 text-[0.7rem] font-medium uppercase tracking-[0.16em]">
                      Board-ready visibility
                    </span>
                    <p className="text-sm font-semibold sm:text-base">
                      Give leadership a live view of orders, revenue and service levels across the
                      network.
                    </p>
                    <p className="text-xs text-muted-foreground sm:text-sm">
                      Visual dashboards and exports keep finance, operations and compliance aligned
                      on the same data.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="border-t border-border/40 bg-gradient-to-b from-muted/20 to-background px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br from-primary/5 via-muted/50 to-primary/10 px-6 py-12 text-center shadow-xl sm:px-10 sm:py-16">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_50%,hsl(var(--primary)/0.08),transparent)]" />
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
                  className="mt-6 gap-2 shadow-lg transition-all hover:scale-[1.02] sm:mt-8"
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
        <footer className="border-t border-border/40 bg-muted/30 px-4 py-12 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="flex flex-col items-center justify-between gap-8 sm:flex-row">
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
