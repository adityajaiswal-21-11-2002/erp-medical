"use client"

import * as React from "react"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

export interface TruncatedTextProps {
  children: string
  /** Tailwind max-width class (e.g. "max-w-[220px]") or pixel value "220px" */
  maxWidth?: string
  /** Single line (truncate) or multi-line (line-clamp-2) */
  lines?: 1 | 2
  className?: string
  /** Show tooltip on hover with full text */
  tooltip?: boolean
}

/**
 * Renders text with ellipsis. Optional tooltip shows full text on hover.
 * Use inside a max-w container or set maxWidth prop.
 */
export function TruncatedText({
  children,
  maxWidth = "max-w-[220px]",
  lines = 1,
  className,
  tooltip = true,
}: TruncatedTextProps) {
  const text = String(children ?? "")
  const needsTooltip = tooltip && text.length > 0
  const clampClass = lines === 1 ? "truncate" : "line-clamp-2"

  const isPixel = maxWidth && /^\d+px$/.test(maxWidth)
  const content = (
    <span
      className={cn(
        "block cursor-help",
        clampClass,
        !isPixel && maxWidth,
        className
      )}
      style={isPixel ? { maxWidth } : undefined}
      title={!needsTooltip ? text : undefined}
    >
      {text || "—"}
    </span>
  )

  if (needsTooltip) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          {content}
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs break-words">
          {text}
        </TooltipContent>
      </Tooltip>
    )
  }

  return content
}
