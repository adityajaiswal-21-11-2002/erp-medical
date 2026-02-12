"use client"

import * as React from "react"
import { AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { cn } from "@/lib/utils"

export interface ErrorStateProps {
  title?: string
  message?: string
  onRetry?: () => void
  className?: string
}

export function ErrorState({
  title = "Something went wrong",
  message = "We couldn't load this content. Please try again.",
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <Empty
      className={cn(
        "border border-dashed border-border rounded-lg bg-muted/30",
        className
      )}
    >
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <AlertCircle
            className="size-6 text-destructive"
            aria-hidden
          />
        </EmptyMedia>
        <EmptyTitle className="text-base font-medium text-foreground">
          {title}
        </EmptyTitle>
        <EmptyDescription className="text-sm text-muted-foreground">
          {message}
        </EmptyDescription>
      </EmptyHeader>
      {onRetry && (
        <EmptyContent>
          <Button
            variant="outline"
            size="sm"
            onClick={onRetry}
            aria-label="Retry loading"
            className="focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            Try again
          </Button>
        </EmptyContent>
      )}
    </Empty>
  )
}
