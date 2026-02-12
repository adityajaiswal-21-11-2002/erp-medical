"use client"

import * as React from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export interface StatCardProps {
  title: string
  value: string | number
  description?: string
  icon?: React.ReactNode
  className?: string
}

export function StatCard({
  title,
  value,
  description,
  icon,
  className,
}: StatCardProps) {
  return (
    <Card className={cn("bg-card border-border", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 md:p-6">
        <span className="text-sm font-medium text-muted-foreground">
          {title}
        </span>
        {icon && (
          <span className="text-muted-foreground [&>svg]:size-4" aria-hidden>
            {icon}
          </span>
        )}
      </CardHeader>
      <CardContent className="p-4 pt-0 md:p-6 md:pt-0">
        <div className="text-2xl font-semibold text-foreground">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  )
}

export interface StatCardsProps {
  children: React.ReactNode
  className?: string
}

export function StatCards({ children, className }: StatCardsProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 md:gap-6",
        className
      )}
    >
      {children}
    </div>
  )
}
