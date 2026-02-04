import React from "react"

export const metadata = {
  title: "Sign In | PharmaHub",
  description: "Secure access to PharmaHub Distribution",
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="h-screen overflow-y-auto overflow-x-hidden bg-background [overflow-anchor:none]"
      style={{ overflowAnchor: "none" }}
    >
      <div className="flex min-h-full min-w-0 items-center justify-center p-6 py-8">
        {children}
      </div>
    </div>
  )
}
