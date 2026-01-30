'use client'

import { useAuth } from './auth-context'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function Page() {
  const { isAuthenticated, role, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isLoading) return

    if (!isAuthenticated) {
      router.push('/auth/login')
      return
    }

    // Redirect based on role
    if (role === 'admin') {
      router.push('/admin/dashboard')
    } else if (role === 'retailer') {
      router.push('/retailer/dashboard')
    }
  }, [isAuthenticated, role, isLoading, router])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border border-primary border-t-transparent mx-auto mb-4" />
        <p className="text-muted-foreground">Loading...</p>
      </div>
    </div>
  )
}
