"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { api } from "@/lib/api"
import { PageHeader } from "@/components/page-header"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent } from "@/components/ui/card"

type Settlement = {
  retailer: string
  outstanding: number
  ageingDays: number
}

export default function DistributorSettlementsPage() {
  const [settlements, setSettlements] = useState<Settlement[]>([])

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/api/distributor/settlements")
        setSettlements(res.data?.data || [])
      } catch (error: any) {
        toast.error(error?.response?.data?.error || "Failed to load settlements")
      }
    }
    load().catch(() => undefined)
  }, [])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settlements & Ageing"
        description="Track outstanding balances and ageing buckets."
      />
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Retailer</TableHead>
                <TableHead>Outstanding</TableHead>
                <TableHead>Ageing (days)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {settlements.map((row, idx) => (
                <TableRow key={`${row.retailer}-${idx}`}>
                  <TableCell>{row.retailer}</TableCell>
                  <TableCell>₹{row.outstanding}</TableCell>
                  <TableCell>{row.ageingDays}</TableCell>
                </TableRow>
              ))}
              {settlements.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground">
                    No settlements data
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
