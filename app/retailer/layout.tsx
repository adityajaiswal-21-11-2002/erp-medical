import React from "react"
import { RetailerLayout as Shell } from "@/components/retailer-layout"
import { AuthGate } from "@/components/auth-gate"

export const metadata = {
  title: "Retailer Portal | PharmaHub Distribution",
  description: "Manage orders, inventory, and loyalty points",
}

export default function RetailerLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGate requiredAccountType="RETAILER">
      <Shell>{children}</Shell>
    </AuthGate>
  )
}
