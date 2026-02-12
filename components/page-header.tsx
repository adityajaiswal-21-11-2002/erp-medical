import React from "react"

import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface PageHeaderProps {
  title: string
  description?: string
  actions?: React.ReactNode
  children?: React.ReactNode
  className?: string
}

export function PageHeader({ title, description, actions, children, className }: PageHeaderProps) {
  return (
    <Card className={cn("border border-border bg-card text-card-foreground", className)}>
      <div className="flex flex-col gap-4 p-4 md:p-6 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1 min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground truncate">
            {title}
          </h1>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
          {children}
        </div>
        {actions && (
          <div className="flex flex-shrink-0 flex-wrap items-center gap-2">{actions}</div>
        )}
      </div>
    </Card>
  )
}
