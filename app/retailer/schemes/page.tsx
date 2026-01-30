"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { api } from "@/lib/api"
import { PageHeader } from "@/components/page-header"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

type Coupon = {
  _id: string
  code: string
  description?: string
  discountPercent?: number
}

export default function RetailerSchemesPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [disabled, setDisabled] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/api/coupons")
        setCoupons(res.data?.data || [])
        setDisabled(false)
      } catch (error: any) {
        if (error?.response?.status === 403) {
          setDisabled(true)
          return
        }
        toast.error(error?.response?.data?.error || "Failed to load coupons")
      }
    }
    load().catch(() => undefined)
  }, [])

  if (disabled) {
    return (
      <div className="space-y-6">
        <PageHeader title="Schemes & Coupons" description="Coupons are disabled by admin." />
        <div className="text-sm text-muted-foreground">Please contact admin to enable coupons.</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Schemes & Coupons" description="Available coupons for your orders." />
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Code</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Discount %</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {coupons.map((coupon) => (
            <TableRow key={coupon._id}>
              <TableCell>{coupon.code}</TableCell>
              <TableCell>{coupon.description || "-"}</TableCell>
              <TableCell>{coupon.discountPercent || 0}%</TableCell>
            </TableRow>
          ))}
          {coupons.length === 0 && (
            <TableRow>
              <TableCell colSpan={3} className="text-center text-muted-foreground">
                No coupons available
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
