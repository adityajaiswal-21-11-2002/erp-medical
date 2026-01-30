'use client'

import React from "react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Pill } from 'lucide-react'

interface AuthCardProps {
  title: string
  description?: string
  children: React.ReactNode
}

export function AuthCard({ title, description, children }: AuthCardProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center">
            <Pill className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold">PharmaHub</h1>
        </div>

        {/* Auth Card */}
        <Card className="border">
          <CardHeader>
            <CardTitle className="text-2xl">{title}</CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
          </CardHeader>
          <CardContent>{children}</CardContent>
        </Card>
      </div>
    </div>
  )
}
