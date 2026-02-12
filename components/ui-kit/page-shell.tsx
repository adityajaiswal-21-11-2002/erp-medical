"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface PageShellProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Max width: 'xl' (forms), 'content' (max-w-6xl), 'full' */
  maxWidth?: "xl" | "content" | "full"
}

export function PageShell({
  className,
  maxWidth = "content",
  ...props
}: PageShellProps) {
  return (
    <div
      className={cn(
        "p-4 md:p-6 w-full",
        maxWidth === "xl" && "max-w-xl mx-auto",
        maxWidth === "content" && "max-w-6xl mx-auto",
        maxWidth === "full" && "",
        className
      )}
      {...props}
    />
  )
}
