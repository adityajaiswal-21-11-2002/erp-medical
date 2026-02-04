'use client'

import React from "react"

import { useAuth } from "@/app/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface AuthGateProps {
  children: React.ReactNode
  requiredRole?: "ADMIN" | "USER"
  requiredAccountType?: "ADMIN" | "RETAILER" | "DISTRIBUTOR" | "CUSTOMER"
  fallback?: React.ReactNode
}

export function AuthGate({ children, requiredRole, requiredAccountType, fallback }: AuthGateProps) {
  const { isAuthenticated, role, accountType, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isLoading) return

    if (!isAuthenticated) {
      router.push("/auth/login")
      return
    }

    if (requiredRole && role !== requiredRole) {
      return
    }
    if (requiredAccountType && accountType !== requiredAccountType) {
      return
    }
  }, [isAuthenticated, role, accountType, isLoading, requiredRole, requiredAccountType, router])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <h2 className="text-lg font-semibold mb-2">Not Authenticated</h2>
            <p className="text-muted-foreground mb-6">
              You must be logged in to access this page.
            </p>
            <Button
              onClick={() => router.push("/auth/login")}
              variant="outline"
              className="w-full"
            >
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (requiredRole && role !== requiredRole) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <h2 className="text-lg font-semibold mb-2">Access Denied</h2>
            <p className="text-muted-foreground mb-6">
              You do not have permission to access this page.
            </p>
            <Button
              onClick={() => router.push("/auth/login")}
              variant="outline"
              className="w-full"
            >
              Back to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (requiredAccountType && accountType !== requiredAccountType) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <h2 className="text-lg font-semibold mb-2">Access Denied</h2>
            <p className="text-muted-foreground mb-6">
              You do not have permission to access this page.
            </p>
            <Button
              onClick={() => router.push("/auth/login")}
              variant="outline"
              className="w-full"
            >
              Back to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return <>{children}</>
}
