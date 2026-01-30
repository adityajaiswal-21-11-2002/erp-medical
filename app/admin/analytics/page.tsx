"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { api } from "@/lib/api"
import { PageHeader } from "@/components/page-header"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

type Summary = {
  totals: Record<string, number>
  topSearches: Array<{ _id: string; count: number }>
}

export default function AnalyticsPage() {
  const [summary, setSummary] = useState<Summary>({ totals: {}, topSearches: [] })

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await api.get("/api/analytics/summary")
        setSummary(res.data?.data || { totals: {}, topSearches: [] })
      } catch (error: any) {
        toast.error(error?.response?.data?.error || "Failed to load analytics")
      }
    }
    fetchSummary().catch(() => undefined)
  }, [])

  return (
    <div className="space-y-6">
      <PageHeader title="User Analytics" description="Behavior insights across portals." />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Object.entries(summary.totals).map(([key, value]) => (
          <Card key={key}>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">{key}</p>
              <p className="text-2xl font-bold">{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardContent className="pt-6">
          <h3 className="text-lg font-semibold mb-4">Top Searches</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Query</TableHead>
                <TableHead>Count</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {summary.topSearches.map((row) => (
                <TableRow key={row._id || "unknown"}>
                  <TableCell>{row._id || "Unknown"}</TableCell>
                  <TableCell>{row.count}</TableCell>
                </TableRow>
              ))}
              {summary.topSearches.length === 0 && (
                <TableRow>
                  <TableCell colSpan={2} className="text-center text-muted-foreground">
                    No searches yet
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
