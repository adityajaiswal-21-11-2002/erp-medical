import React from "react"
import { AdminLayout as Shell } from "@/components/admin-layout"
import { AuthGate } from "@/components/auth-gate"

export const metadata = {
  title: "Admin Dashboard | PharmaHub Distribution",
  description: "Manage distribution, compliance, and operations",
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGate requiredAccountType="ADMIN">
      <Shell>{children}</Shell>
    </AuthGate>
  )
}
