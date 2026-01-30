import React from "react"

export const metadata = {
  title: "Sign In | PharmaHub",
  description: "Secure access to PharmaHub Distribution",
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      {children}
    </div>
  )
}
