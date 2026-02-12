"use client"

import React, { Suspense, useEffect, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { ShoppingCart, User, Search, X } from "lucide-react"

import { useCart } from "@/app/cart-context"
import { AuthGate } from "@/components/auth-gate"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Toaster } from "@/components/ui/sonner"
import { api } from "@/lib/api"

function CustomerLayoutInner({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { items } = useCart()
  const [searchQuery, setSearchQuery] = useState("")
  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0)
  const [refCode, setRefCode] = useState<string | null>(null)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    const incomingRef = searchParams.get("ref")
    const storedRef = localStorage.getItem("ref_code")
    const dismissedStored = localStorage.getItem("ref_dismissed") === "true"

    if (incomingRef) {
      localStorage.setItem("ref_code", incomingRef)
      localStorage.removeItem("ref_dismissed")
      setRefCode(incomingRef)
      setDismissed(false)
      api.post("/api/referrals/track", { refCode: incomingRef }).catch(() => undefined)
      return
    }

    setRefCode(storedRef)
    setDismissed(dismissedStored)
  }, [searchParams])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/customer/catalog?search=${encodeURIComponent(searchQuery)}`)
    }
  }

  const handleDismiss = () => {
    localStorage.setItem("ref_dismissed", "true")
    setDismissed(true)
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        {refCode && !dismissed && (
          <div className="bg-muted/60 border-b border-border">
            <div className="mx-auto max-w-6xl px-4 py-2 flex items-center justify-between text-xs text-muted-foreground">
              <span>Referred by {refCode}</span>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleDismiss} aria-label="Dismiss referral">
                <X className="size-3" />
              </Button>
            </div>
          </div>
        )}
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center gap-3 sm:gap-4">
          <Link href="/customer" className="flex items-center gap-2 min-w-0 shrink-0">
            <div className="w-9 h-9 rounded-lg bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold shrink-0">
              PH
            </div>
            <div className="hidden sm:block min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">PharmaHub</p>
              <p className="text-xs text-muted-foreground">Customer Storefront</p>
            </div>
          </Link>
          <form onSubmit={handleSearch} className="flex-1 hidden md:flex items-center min-w-0 max-w-md">
            <Search className="size-4 text-muted-foreground shrink-0" aria-hidden />
            <Input
              placeholder="Search medicines, brands, categories..."
              className="bg-muted/50 border-0 h-9 flex-1 min-w-0"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search catalog"
            />
          </form>
          <div className="flex items-center gap-1 shrink-0">
            <Link href="/customer/cart">
              <Button variant="ghost" size="icon" className="h-9 w-9 relative" aria-label={`Cart, ${cartCount} items`}>
                <ShoppingCart className="size-4" />
                {cartCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 min-w-5 px-1 flex items-center justify-center text-[10px]">
                    {cartCount > 99 ? "99+" : cartCount}
                  </Badge>
                )}
              </Button>
            </Link>
            <Link href="/customer/account">
              <Button variant="ghost" size="icon" className="h-9 w-9" aria-label="Account">
                <User className="size-4" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 min-h-0">{children}</main>

      {/* Sticky cart CTA on mobile when cart has items */}
      {cartCount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-30 p-3 bg-background/95 border-t border-border backdrop-blur md:hidden">
          <Link href="/customer/cart" className="block">
            <Button className="w-full" size="lg">
              <ShoppingCart className="size-4 mr-2" aria-hidden />
              View cart ({cartCount} {cartCount === 1 ? "item" : "items"})
            </Button>
          </Link>
        </div>
      )}
      {/* Spacer so content isn't hidden behind sticky cart */}
      {cartCount > 0 && <div className="h-16 md:hidden" aria-hidden />}

      <footer className="border-t border-border bg-background mt-auto">
        <div className="mx-auto max-w-6xl px-4 py-6 text-xs text-muted-foreground flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          <span>© 2026 PharmaHub. All rights reserved.</span>
          <span>Support: help@pharmahub.com</span>
        </div>
      </footer>
      <Toaster />
    </div>
  )
}

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGate requiredAccountType="CUSTOMER">
      <Suspense fallback={<div className="min-h-screen bg-background" />}>
        <CustomerLayoutInner>{children}</CustomerLayoutInner>
      </Suspense>
    </AuthGate>
  )
}
