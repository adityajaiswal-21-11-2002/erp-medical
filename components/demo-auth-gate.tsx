"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

type DemoRole = "distributor" | "customer"

interface AuthGateProps {
  children: React.ReactNode
  requiredRole: DemoRole
}

export function AuthGate({ children, requiredRole }: AuthGateProps) {
  const router = useRouter()
  const [isReady, setIsReady] = useState(false)
  const [role, setRole] = useState<string | null>(null)

  useEffect(() => {
    setRole(localStorage.getItem("demo_auth"))
    setIsReady(true)
  }, [])

  if (!isReady) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (role !== requiredRole) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background p-6">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center space-y-4">
            <div>
              <h2 className="text-lg font-semibold">Not Authenticated</h2>
              <p className="text-sm text-muted-foreground">
                You must be signed in with the {requiredRole} role to continue.
              </p>
            </div>
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

  return <>{children}</>
}
