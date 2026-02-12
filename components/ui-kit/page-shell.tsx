"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface PageShellProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Max width: 'xl' (forms), 'content' (max-w-7xl), 'full' */
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
        "w-full px-4 md:px-6 py-6 mx-auto",
        maxWidth === "xl" && "max-w-xl",
        maxWidth === "content" && "max-w-7xl",
        maxWidth === "full" && "",
        className
      )}
      {...props}
    />
  )
}
