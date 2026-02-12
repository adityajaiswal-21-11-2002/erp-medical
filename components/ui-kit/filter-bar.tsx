"use client"

import * as React from "react"
import { Filter, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { useIsMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"

export interface FilterBarProps {
  searchPlaceholder?: string
  searchValue?: string
  onSearchChange?: (value: string) => void
  onSearchSubmit?: (e: React.FormEvent) => void
  children?: React.ReactNode
  className?: string
  /** Desktop: show filters inline. Mobile: "Filters" button opens sheet. */
  filterContent?: React.ReactNode
  resultCount?: number
}

export function FilterBar({
  searchPlaceholder = "Search...",
  searchValue = "",
  onSearchChange,
  onSearchSubmit,
  children,
  className,
  filterContent,
  resultCount,
}: FilterBarProps) {
  const isMobile = useIsMobile()
  const [sheetOpen, setSheetOpen] = React.useState(false)

  const searchInput = (
    <div className="relative flex-1 min-w-0 max-w-md">
      <Search
        className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none"
        aria-hidden
      />
      <Input
        type="search"
        placeholder={searchPlaceholder}
        value={searchValue}
        onChange={(e) => onSearchChange?.(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") onSearchSubmit?.(e as unknown as React.FormEvent)
        }}
        className="pl-9 h-9 bg-muted/50 border-border text-sm"
        aria-label={searchPlaceholder}
      />
    </div>
  )

  return (
    <div
      className={cn(
        "flex flex-col gap-4 md:flex-row md:items-center md:justify-between",
        className
      )}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault()
          onSearchSubmit?.(e)
        }}
        className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4 flex-1 min-w-0"
      >
        {searchInput}
        {filterContent && isMobile ? (
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-2 border-border"
                aria-label="Open filters"
              >
                <Filter className="size-4" />
                Filters
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="max-h-[85vh] overflow-auto">
              <SheetHeader>
                <SheetTitle>Filters</SheetTitle>
              </SheetHeader>
              <div className="py-4 space-y-4">{filterContent}</div>
            </SheetContent>
          </Sheet>
        ) : (
          filterContent && (
            <div className="flex flex-wrap items-center gap-2">
              {filterContent}
            </div>
          )
        )}
        {children}
      </form>
      {resultCount !== undefined && (
        <span className="text-sm text-muted-foreground whitespace-nowrap">
          {resultCount} result{resultCount !== 1 ? "s" : ""}
        </span>
      )}
    </div>
  )
}
