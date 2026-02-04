'use client'

import React, { createContext, useContext, useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { api, setAccessToken, setUnauthorizedHandler } from "@/lib/api"

export type UserRole = "ADMIN" | "USER"
export type AccountType = "ADMIN" | "RETAILER" | "DISTRIBUTOR" | "CUSTOMER"

export interface UserProfile {
  id: string
  name: string
  email: string
  role: UserRole
  status?: "ACTIVE" | "BLOCKED"
  accountType?: AccountType
  kycStatus?: "NOT_STARTED" | "PENDING" | "APPROVED" | "REJECTED"
}

export interface AuthContextType {
  isAuthenticated: boolean
  user: UserProfile | null
  role: UserRole | null
  accountType: AccountType | null
  token: string | null
  login: (payload: { token: string; user: UserProfile }) => void
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)
const STORAGE_KEY = "pharma_auth"

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [user, setUser] = useState<UserProfile | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const isAuthenticated = !!token && !!user

  const logout = () => {
    setUser(null)
    setToken(null)
    setAccessToken(null)
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY)
      localStorage.removeItem("pharma_token")
    }
    // Fire-and-forget; skip 401 handler for logout endpoint in api interceptor
    api.post("/api/auth/logout").catch(() => undefined)
  }

  useEffect(() => {
    setUnauthorizedHandler(() => {
      logout()
      router.push("/auth/login")
    })
  }, [router])

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) {
      setIsLoading(false)
      return
    }
    let tokenFound = false
    try {
      const parsed = JSON.parse(stored)
      if (parsed?.token) {
        tokenFound = true
        setToken(parsed.token)
        setAccessToken(parsed.token)
      }
      if (parsed?.user) {
        setUser(parsed.user)
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY)
    }
    if (!tokenFound) {
      setIsLoading(false)
      return
    }
    // Show dashboard immediately with stored user (fixes relogin after logout).
    // Do not call /api/auth/me on mount: it can return 401 and the global
    // 401 handler would logout and redirect, breaking the login → dashboard flow.
    setIsLoading(false)
  }, [])

  const login = (payload: { token: string; user: UserProfile }) => {
    setToken(payload.token)
    setUser(payload.user)
    setAccessToken(payload.token)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
  }

  const value = useMemo(
    () => ({
      isAuthenticated,
      user,
      role: user?.role || null,
      accountType: user?.accountType || null,
      token,
      login,
      logout,
      isLoading,
    }),
    [isAuthenticated, user, token, isLoading],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
