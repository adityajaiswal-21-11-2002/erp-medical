"use client"

import React from "react"

import {
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  MoreHorizontal,
  Search,
} from "lucide-react"
import { useState, useMemo } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface Column {
  key: string
  label: string
  sortable?: boolean
  filterable?: boolean
  filterOptions?: string[]
  render?: (value: any, row: any) => React.ReactNode
  width?: string
}

interface DataTableProps {
  columns: Column[]
  data: any[]
  searchPlaceholder?: string
  searchableFields?: string[]
  actions?: {
    label: string
    onClick: (row: any) => void
    variant?: "default" | "destructive"
  }[]
  pagination?: boolean
  pageSize?: number
  onRowClick?: (row: any) => void
}

export function DataTable({
  columns,
  data,
  searchPlaceholder = "Search...",
  searchableFields = [],
  actions = [],
  pagination = true,
  pageSize = 10,
  onRowClick,
}: DataTableProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [currentPage, setCurrentPage] = useState(1)
  const [filters, setFilters] = useState<Record<string, string>>({})

  // Filter data based on search and filters
  const filteredData = useMemo(() => {
    return data.filter((row) => {
      // Search filter
      if (searchTerm) {
        const searchableValues = searchableFields
          .map((field) => String(row[field] || "").toLowerCase())
          .join(" ")
        if (!searchableValues.includes(searchTerm.toLowerCase())) {
          return false
        }
      }

      // Column filters
      for (const [key, value] of Object.entries(filters)) {
        if (value && row[key] !== value) {
          return false
        }
      }

      return true
    })
  }, [data, searchTerm, filters, searchableFields])

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortColumn) return filteredData

    const sorted = [...filteredData].sort((a, b) => {
      const aVal = a[sortColumn]
      const bVal = b[sortColumn]

      if (aVal === bVal) return 0
      if (aVal < bVal) return sortDirection === "asc" ? -1 : 1
      return sortDirection === "asc" ? 1 : -1
    })

    return sorted
  }, [filteredData, sortColumn, sortDirection])

  // Pagination
  const totalPages = Math.ceil(sortedData.length / pageSize)
  const paginatedData = pagination
    ? sortedData.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
      )
    : sortedData

  const handleSort = (key: string) => {
    if (sortColumn === key) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortColumn(key)
      setSortDirection("asc")
    }
  }

  const getSortIcon = (key: string) => {
    if (sortColumn !== key) return <ChevronsUpDown className="w-4 h-4" />
    return sortDirection === "asc" ? (
      <ChevronUp className="w-4 h-4" />
    ) : (
      <ChevronDown className="w-4 h-4" />
    )
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex-1 flex flex-col gap-3 md:flex-row md:items-center md:space-x-2">
          <Search className="w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setCurrentPage(1)
            }}
            className="bg-muted border-0 h-9"
          />
          <div className="flex flex-wrap items-center gap-2">
            {columns
              .filter((col) => col.filterable && col.filterOptions?.length)
              .map((col) => (
                <Select
                  key={col.key}
                  value={filters[col.key] || "all"}
                  onValueChange={(value) => {
                    setFilters((prev) => ({
                      ...prev,
                      [col.key]: value === "all" ? "" : value,
                    }))
                    setCurrentPage(1)
                  }}
                >
                  <SelectTrigger className="h-9 w-[160px] bg-muted border-0 text-xs">
                    <SelectValue placeholder={`Filter ${col.label}`} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All {col.label}</SelectItem>
                    {col.filterOptions?.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {sortedData.length} results
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-x-auto">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              {columns.map((col) => (
                <TableHead
                  key={col.key}
                  className={`font-semibold text-xs ${col.width || ""}`}
                >
                  {col.sortable ? (
                    <button
                      onClick={() => handleSort(col.key)}
                      className="flex items-center gap-2 hover:text-foreground"
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
                <TableHead className="w-12 text-xs font-semibold">
                  Actions
                </TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length + (actions.length > 0 ? 1 : 0)}
                  className="text-center text-muted-foreground py-8"
                >
                  No data found
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((row, idx) => (
                <TableRow
                  key={idx}
                  className={`border-b hover:bg-muted/50 ${
                    onRowClick ? "cursor-pointer" : ""
                  }`}
                  onClick={() => onRowClick?.(row)}
                >
                  {columns.map((col) => (
                    <TableCell key={col.key} className="py-3 text-sm">
                      {col.render
                        ? col.render(row[col.key], row)
                        : row[col.key]}
                    </TableCell>
                  ))}
                  {actions.length > 0 && (
                    <TableCell className="py-3">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreHorizontal className="w-4 h-4" />
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
                                  ? "text-red-600"
                                  : ""
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
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pagination && totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages} ({sortedData.length} total)
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
