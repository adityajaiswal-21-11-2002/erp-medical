import React from "react"

import { Card } from "@/components/ui/card"

interface PageHeaderProps {
  title: string
  description?: string
  actions?: React.ReactNode
  children?: React.ReactNode
}

export function PageHeader({ title, description, actions, children }: PageHeaderProps) {
  return (
    <Card className="border bg-card">
      <div className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold text-foreground">{title}</h1>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
          {children}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
    </Card>
  )
}
