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
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        {refCode && !dismissed && (
          <div className="bg-muted/60 border-b">
            <div className="mx-auto max-w-6xl px-4 py-2 flex items-center justify-between text-xs text-muted-foreground">
              <span>Referred by {refCode}</span>
              <Button variant="ghost" size="sm" onClick={handleDismiss} className="h-6 w-6 p-0">
                <X className="w-3 h-3" />
              </Button>
            </div>
          </div>
        )}
        <div className="mx-auto max-w-6xl px-4 py-4 flex items-center gap-4">
          <Link href="/customer" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
              PH
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-semibold">PharmaHub</p>
              <p className="text-xs text-muted-foreground">Customer Storefront</p>
            </div>
          </Link>
          <form onSubmit={handleSearch} className="flex-1 hidden md:flex items-center gap-2">
            <Search className="w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search medicines, brands, categories..."
              className="bg-muted border-0 h-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
          <div className="flex items-center gap-2">
            <Link href="/customer/cart">
              <Button variant="ghost" size="sm" className="relative">
                <ShoppingCart className="w-4 h-4" />
                {cartCount > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-[10px]">
                    {cartCount > 99 ? "99+" : cartCount}
                  </Badge>
                )}
              </Button>
            </Link>
            <Link href="/customer/account">
              <Button variant="ghost" size="sm">
                <User className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t bg-background">
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
