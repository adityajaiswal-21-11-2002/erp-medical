"use client"

import * as React from "react"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
  children?: React.ReactNode
}

const defaultIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="size-6 text-muted-foreground"
  >
    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
    <path d="M3 3v5h5" />
  </svg>
)

export function EmptyState({
  icon = defaultIcon,
  title,
  description,
  action,
  className,
  children,
}: EmptyStateProps) {
  return (
    <Empty
      className={cn(
        "border border-dashed border-border rounded-lg bg-muted/30",
        className
      )}
    >
      <EmptyHeader>
        <EmptyMedia variant="icon">{icon}</EmptyMedia>
        <EmptyTitle className="text-base font-medium text-foreground">
          {title}
        </EmptyTitle>
        {description && (
          <EmptyDescription className="text-sm text-muted-foreground">
            {description}
          </EmptyDescription>
        )}
      </EmptyHeader>
      {(action || children) && (
        <EmptyContent>
          {action && (
            <Button
              variant="default"
              size="sm"
              onClick={action.onClick}
              className="focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              {action.label}
            </Button>
          )}
          {children}
        </EmptyContent>
      )}
    </Empty>
  )
}
