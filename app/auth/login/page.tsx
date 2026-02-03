'use client'

import React, { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { AuthCard } from "@/components/auth-card"
import { PasswordInput } from "@/components/password-input"
import { OTPInput } from "@/components/otp-input"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/app/auth-context"
import { api } from "@/lib/api"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

type LoginValues = z.infer<typeof loginSchema>

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login } = useAuth()
  const [otpPhone, setOtpPhone] = useState("")
  const [otpValue, setOtpValue] = useState("")

  const defaultRole =
    (searchParams.get("role") as "admin" | "retailer" | "distributor" | "customer") || "retailer"

  const adminForm = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  })

  const retailerForm = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  })

  const distributorForm = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  })

  const customerForm = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  })

  const handleLogin = async (
    values: LoginValues,
    requiredRole: "ADMIN" | "USER",
    requiredAccountType?: "ADMIN" | "RETAILER",
  ) => {
    try {
      const res = await api.post("/api/auth/login", values)
      const { accessToken, user } = res.data?.data || {}
      if (!accessToken || !user) {
        toast.error("Login failed")
        return
      }
      if (user.role !== requiredRole) {
        toast.error("Role mismatch for this portal")
        return
      }
      if (requiredAccountType && user.accountType !== requiredAccountType) {
        toast.error("Account type mismatch for this portal")
        return
      }
      login({ token: accessToken, user })
      toast.success("Welcome back")
      // Full page navigation so the app rehydrates with new auth (avoids stale state on login → logout → login)
      const path =
        requiredAccountType === "ADMIN"
          ? "/admin/dashboard"
          : requiredAccountType === "DISTRIBUTOR"
            ? "/distributor/dashboard"
            : requiredAccountType === "CUSTOMER"
              ? "/customer"
              : "/retailer/dashboard"
      window.location.href = path
    } catch (error: any) {
      const isNetworkError =
        error?.code === "ERR_NETWORK" ||
        error?.message?.includes("Connection refused") ||
        error?.message?.includes("Network Error")
      if (isNetworkError) {
        toast.error(
          "Cannot reach the server. Make sure the backend is running (e.g. run `pnpm dev` in the backend folder).",
        )
        return
      }
      toast.error(error?.response?.data?.error || "Login failed")
    }
  }

  return (
    <AuthCard
      title="Sign In"
      description="Welcome to PharmaHub Distribution Portal"
    >
      <Tabs defaultValue={defaultRole} className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-1 mb-6 h-auto p-1.5 sm:p-1">
          <TabsTrigger
            value="retailer"
            className="min-w-0 px-2 py-2 sm:py-1.5 text-xs sm:text-sm whitespace-normal text-center leading-tight"
          >
            Retailer
          </TabsTrigger>
          <TabsTrigger
            value="distributor"
            className="min-w-0 px-2 py-2 sm:py-1.5 text-xs sm:text-sm whitespace-normal text-center leading-tight"
          >
            Distributor
          </TabsTrigger>
          <TabsTrigger
            value="customer"
            className="min-w-0 px-2 py-2 sm:py-1.5 text-xs sm:text-sm whitespace-normal text-center leading-tight"
          >
            Customer
          </TabsTrigger>
          <TabsTrigger
            value="admin"
            className="min-w-0 px-2 py-2 sm:py-1.5 text-xs sm:text-sm whitespace-normal text-center leading-tight"
          >
            Admin
          </TabsTrigger>
        </TabsList>

        {/* Retailer Login Tab */}
        <TabsContent value="retailer" className="space-y-6">
          <div className="space-y-4 rounded-lg border p-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Phone Number</label>
              <Input
                type="tel"
                placeholder="Enter phone number"
                value={otpPhone}
                onChange={(e) => setOtpPhone(e.target.value)}
              />
            </div>
            <OTPInput value={otpValue} onChange={setOtpValue} error="OTP login coming soon." />
            <Button type="button" className="w-full" disabled>
              OTP Login (Coming soon)
            </Button>
          </div>

          <form
            onSubmit={retailerForm.handleSubmit((values) =>
              handleLogin(values, "USER", "RETAILER"),
            )}
            className="space-y-4"
          >
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Email</label>
              <Input
                type="email"
                placeholder="retailer@company.com"
                {...retailerForm.register("email")}
              />
              {retailerForm.formState.errors.email && (
                <p className="text-xs text-red-500">
                  {retailerForm.formState.errors.email.message}
                </p>
              )}
            </div>

            <PasswordInput
              label="Password"
              placeholder="Enter your password"
              {...retailerForm.register("password")}
              error={retailerForm.formState.errors.password?.message}
            />

            <Button type="submit" className="w-full" disabled={retailerForm.formState.isSubmitting}>
              {retailerForm.formState.isSubmitting ? "Signing in..." : "Sign in"}
            </Button>
          </form>
        </TabsContent>

        {/* Distributor Login Tab */}
        <TabsContent value="distributor" className="space-y-4">
          <form
            onSubmit={distributorForm.handleSubmit((values) =>
              handleLogin(values, "USER", "DISTRIBUTOR"),
            )}
            className="space-y-4"
          >
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Email</label>
              <Input
                type="email"
                placeholder="distributor@company.com"
                {...distributorForm.register("email")}
              />
              {distributorForm.formState.errors.email && (
                <p className="text-xs text-red-500">
                  {distributorForm.formState.errors.email.message}
                </p>
              )}
            </div>
            <PasswordInput
              label="Password"
              placeholder="Enter your password"
              {...distributorForm.register("password")}
              error={distributorForm.formState.errors.password?.message}
            />
            <Button
              type="submit"
              className="w-full"
              disabled={distributorForm.formState.isSubmitting}
            >
              {distributorForm.formState.isSubmitting ? "Signing in..." : "Sign in"}
            </Button>
          </form>
        </TabsContent>

        {/* Customer Login Tab */}
        <TabsContent value="customer" className="space-y-4">
          <form
            onSubmit={customerForm.handleSubmit((values) =>
              handleLogin(values, "USER", "CUSTOMER"),
            )}
            className="space-y-4"
          >
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Email</label>
              <Input
                type="email"
                placeholder="customer@company.com"
                {...customerForm.register("email")}
              />
              {customerForm.formState.errors.email && (
                <p className="text-xs text-red-500">
                  {customerForm.formState.errors.email.message}
                </p>
              )}
            </div>
            <PasswordInput
              label="Password"
              placeholder="Enter your password"
              {...customerForm.register("password")}
              error={customerForm.formState.errors.password?.message}
            />
            <Button
              type="submit"
              className="w-full"
              disabled={customerForm.formState.isSubmitting}
            >
              {customerForm.formState.isSubmitting ? "Signing in..." : "Sign in"}
            </Button>
          </form>
        </TabsContent>

        {/* Admin Login Tab */}
        <TabsContent value="admin" className="space-y-4">
          <form
            onSubmit={adminForm.handleSubmit((values) => handleLogin(values, "ADMIN", "ADMIN"))}
            className="space-y-4"
          >
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Email</label>
              <Input
                type="email"
                placeholder="admin@company.com"
                {...adminForm.register("email")}
              />
              {adminForm.formState.errors.email && (
                <p className="text-xs text-red-500">
                  {adminForm.formState.errors.email.message}
                </p>
              )}
            </div>

            <PasswordInput
              label="Password"
              placeholder="Enter your password"
              {...adminForm.register("password")}
              error={adminForm.formState.errors.password?.message}
            />

            <Button
              type="submit"
              className="w-full"
              disabled={adminForm.formState.isSubmitting}
            >
              {adminForm.formState.isSubmitting ? "Signing in..." : "Sign in"}
            </Button>
          </form>
        </TabsContent>
      </Tabs>
    </AuthCard>
  )
}
