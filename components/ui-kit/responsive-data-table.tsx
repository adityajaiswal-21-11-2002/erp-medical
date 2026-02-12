"use client"

import * as React from "react"
import {
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  MoreHorizontal,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { TruncatedText } from "@/components/ui/truncated-text"
import { useDebouncedValue } from "@/hooks/use-debounced-value"
import { useIsMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"
import { FilterBar } from "./filter-bar"

export interface ResponsiveDataTableColumn<T = unknown> {
  key: string
  label: string
  sortable?: boolean
  filterable?: boolean
  filterOptions?: string[]
  render?: (value: unknown, row: T) => React.ReactNode
  /** For mobile card: primary field shown as title */
  primary?: boolean
  width?: string
  /** Truncate long text and show tooltip (default true for string columns) */
  truncate?: boolean
}

export interface ResponsiveDataTableProps<T = unknown> {
  columns: ResponsiveDataTableColumn<T>[]
  data: T[]
  searchPlaceholder?: string
  searchValue?: string
  onSearchChange?: (value: string) => void
  searchableFields?: (keyof T)[]
  actions?: {
    label: string
    onClick: (row: T) => void
    variant?: "default" | "destructive"
  }[]
  pagination?: boolean
  pageSize?: number
  onRowClick?: (row: T) => void
  keyExtractor: (row: T) => string
  emptyMessage?: string
  filterContent?: React.ReactNode
  /** Primary action in toolbar (e.g. Create, Refresh) */
  toolbarAction?: React.ReactNode
  /** Debounce delay for search in ms (uncontrolled mode only). Default 300. */
  searchDebounceMs?: number
}

export function ResponsiveDataTable<T extends Record<string, unknown>>({
  columns,
  data,
  searchPlaceholder = "Search...",
  searchValue = "",
  onSearchChange,
  searchableFields = [],
  actions = [],
  pagination = true,
  pageSize = 10,
  onRowClick,
  keyExtractor,
  emptyMessage = "No data found",
  filterContent,
  toolbarAction,
  searchDebounceMs = 300,
}: ResponsiveDataTableProps<T>) {
  const isMobile = useIsMobile()
  const [internalSearch, setInternalSearch] = React.useState("")
  const isControlled = onSearchChange !== undefined
  const debouncedInternalSearch = useDebouncedValue(internalSearch, searchDebounceMs)
  const resolvedSearch = isControlled ? (searchValue ?? "") : debouncedInternalSearch
  const searchInputValue = isControlled ? (searchValue ?? "") : internalSearch
  const handleSearchChange = isControlled ? onSearchChange! : setInternalSearch
  const [sortKey, setSortKey] = React.useState<string | null>(null)
  const [sortDir, setSortDir] = React.useState<"asc" | "desc">("asc")
  const [page, setPage] = React.useState(1)
  const [filters, setFilters] = React.useState<Record<string, string>>({})

  const filtered = React.useMemo(() => {
    return data.filter((row) => {
      if (resolvedSearch) {
        const searchStr = searchableFields
          .map((k) => String(row[k] ?? "").toLowerCase())
          .join(" ")
        if (!searchStr.includes(resolvedSearch.toLowerCase())) return false
      }
      for (const [k, v] of Object.entries(filters)) {
        if (v && row[k] !== v) return false
      }
      return true
    })
  }, [data, resolvedSearch, filters, searchableFields])

  const sorted = React.useMemo(() => {
    if (!sortKey) return filtered
    return [...filtered].sort((a, b) => {
      const aVal = a[sortKey]
      const bVal = b[sortKey]
      if (aVal === bVal) return 0
      const cmp = aVal < bVal ? -1 : 1
      return sortDir === "asc" ? cmp : -cmp
    })
  }, [filtered, sortKey, sortDir])

  const totalPages = Math.ceil(sorted.length / pageSize) || 1
  const paginated = pagination
    ? sorted.slice((page - 1) * pageSize, page * pageSize)
    : sorted

  const handleSort = (key: string) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"))
    else {
      setSortKey(key)
      setSortDir("asc")
    }
    setPage(1)
  }

  const getSortIcon = (key: string) => {
    if (sortKey !== key) return <ChevronsUpDown className="size-4" />
    return sortDir === "asc" ? (
      <ChevronUp className="size-4" />
    ) : (
      <ChevronDown className="size-4" />
    )
  }

  if (isMobile) {
    const primaryKey =
      columns.find((c) => c.primary)?.key ?? columns[0]?.key ?? ""

    return (
      <div className="space-y-4">
        <FilterBar
          searchPlaceholder={searchPlaceholder}
          searchValue={searchInputValue}
          onSearchChange={handleSearchChange}
          filterContent={filterContent}
          resultCount={sorted.length}
          primaryAction={toolbarAction}
        />
        <div className="space-y-3">
          {paginated.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-muted/30 py-10 text-center text-sm text-muted-foreground">
              {emptyMessage}
            </div>
          ) : (
            paginated.map((row) => {
              const key = keyExtractor(row)
              return (
                <Card
                  key={key}
                  className={cn(
                    "border-border transition-all duration-200 hover:shadow-md",
                    onRowClick && "cursor-pointer hover:bg-muted/50"
                  )}
                  onClick={() => onRowClick?.(row)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1 space-y-1">
                        {primaryKey && (
                          <p className="font-medium text-foreground truncate">
                            {columns.find((c) => c.key === primaryKey)?.render
                              ? (columns.find((c) => c.key === primaryKey)!.render as (v: unknown, r: T) => React.ReactNode)(
                                  row[primaryKey],
                                  row
                                )
                              : String(row[primaryKey] ?? "")}
                          </p>
                        )}
                        {columns
                          .filter((c) => c.key !== primaryKey && !c.primary)
                          .slice(0, 3)
                          .map((col) => (
                            <p
                              key={col.key}
                              className="text-xs text-muted-foreground flex items-center gap-1"
                            >
                              <span className="font-medium">{col.label}:</span>
                              {col.render
                                ? col.render(row[col.key], row)
                                : String(row[col.key] ?? "-")}
                            </p>
                          ))}
                      </div>
                      {actions.length > 0 && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 shrink-0"
                              onClick={(e) => e.stopPropagation()}
                              aria-label="Open actions"
                            >
                              <MoreHorizontal className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {actions.map((action, i) => (
                              <DropdownMenuItem
                                key={i}
                                onClick={(e) => {
                                  e.stopPropagation()
                                  action.onClick(row)
                                }}
                                className={
                                  action.variant === "destructive"
                                    ? "text-destructive"
                                    : undefined
                                }
                              >
                                {action.label}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })
          )}
        </div>
        {pagination && totalPages > 1 && (
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              Page {page} of {totalPages}
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                aria-label="Previous page"
                className="cursor-pointer transition-all duration-200 disabled:cursor-not-allowed"
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                aria-label="Next page"
                className="cursor-pointer transition-all duration-200 disabled:cursor-not-allowed"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <FilterBar
        searchPlaceholder={searchPlaceholder}
        searchValue={searchInputValue}
        onSearchChange={handleSearchChange}
        filterContent={filterContent}
        resultCount={sorted.length}
        primaryAction={toolbarAction}
      />
      <div className="rounded-2xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent bg-muted/50">
              {columns.map((col) => (
                <TableHead
                  key={col.key}
                  className={cn(
                    "font-semibold text-xs",
                    col.width
                  )}
                >
                  {col.sortable ? (
                    <button
                      type="button"
                      onClick={() => handleSort(col.key)}
                      className="flex items-center gap-1.5 hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded transition-all duration-200 cursor-pointer"
                      aria-label={`Sort by ${col.label} ${sortKey === col.key ? (sortDir === "asc" ? "ascending" : "descending") : ""}`}
                    >
                      {col.label}
                      {getSortIcon(col.key)}
                    </button>
                  ) : (
                    col.label
                  )}
                </TableHead>
              ))}
              {actions.length > 0 && (
                <TableHead className="w-12 font-semibold text-xs text-right">
                  <span className="sr-only">Actions</span>
                </TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length + (actions.length ? 1 : 0)}
                  className="text-center text-muted-foreground py-10 text-sm"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              paginated.map((row) => {
                const key = keyExtractor(row)
                return (
                  <TableRow
                    key={key}
                    className={cn(
                      "border-border",
                      onRowClick && "cursor-pointer"
                    )}
                    onClick={() => onRowClick?.(row)}
                  >
                    {columns.map((col) => {
                      const raw = row[col.key]
                      const isString = typeof raw === "string" || raw == null
                      const useTruncate = col.truncate !== false && isString
                      return (
                        <TableCell key={col.key} className="px-4 py-3 text-sm">
                          {col.render
                            ? col.render(row[col.key], row)
                            : useTruncate ? (
                                <TruncatedText maxWidth="max-w-[220px]">
                                  {String(raw ?? "")}
                                </TruncatedText>
                              ) : (
                                String(row[col.key] ?? "")
                              )}
                        </TableCell>
                      )
                    })}
                    {actions.length > 0 && (
                      <TableCell className="px-4 py-3 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={(e) => e.stopPropagation()}
                              aria-label="Open actions"
                            >
                              <MoreHorizontal className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {actions.map((action, i) => (
                              <DropdownMenuItem
                                key={i}
                                onClick={(e) => {
                                  e.stopPropagation()
                                  action.onClick(row)
                                }}
                                className={
                                  action.variant === "destructive"
                                    ? "text-destructive"
                                    : undefined
                                }
                              >
                                {action.label}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    )}
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>
      {pagination && totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Page {page} of {totalPages} ({sorted.length} total)
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              aria-label="Previous page"
              className="cursor-pointer transition-all duration-200 disabled:cursor-not-allowed"
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              aria-label="Next page"
              className="cursor-pointer transition-all duration-200 disabled:cursor-not-allowed"
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
