"use client"

import React, { useState } from "react"
import { CheckCircle2, XCircle } from "lucide-react"

import { PageHeader } from "@/components/page-header"
import { StatusBadge } from "@/components/status-badge"
import { ModalConfirm } from "@/components/modal-confirm"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

type ReturnStatus = "pending" | "approved" | "rejected"

interface ReturnRow {
  id: string
  retailer: string
  reason: string
  value: string
  status: ReturnStatus
  created: string
}

const mockReturns: ReturnRow[] = [
  { id: "RET-1021", retailer: "Apollo Pharmacy - Delhi", reason: "Damaged packaging", value: "₹18,400", status: "pending", created: "2026-01-28" },
  { id: "RET-1019", retailer: "MedPlus - Mumbai", reason: "Short shipment", value: "₹9,200", status: "approved", created: "2026-01-27" },
  { id: "RET-1016", retailer: "Care & Cure - Chennai", reason: "Expired batch", value: "₹5,600", status: "rejected", created: "2026-01-25" },
]

export default function DistributorReturnsPage() {
  const [returns, setReturns] = useState(mockReturns)
  const [selectedReturn, setSelectedReturn] = useState<ReturnRow | null>(null)
  const [action, setAction] = useState<"approve" | "reject" | null>(null)

  const handleConfirm = () => {
    if (!selectedReturn || !action) return
    setReturns((prev) =>
      prev.map((row) =>
        row.id === selectedReturn.id
          ? { ...row, status: action === "approve" ? "approved" : "rejected" }
          : row
      )
    )
    setAction(null)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Returns"
        description="Review return requests and issue approvals."
      />

      <Card className="border">
        <CardContent className="p-6">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="text-xs font-semibold">Request ID</TableHead>
                <TableHead className="text-xs font-semibold">Retailer</TableHead>
                <TableHead className="text-xs font-semibold">Reason</TableHead>
                <TableHead className="text-xs font-semibold">Value</TableHead>
                <TableHead className="text-xs font-semibold">Status</TableHead>
                <TableHead className="text-xs font-semibold">Created</TableHead>
                <TableHead className="text-xs font-semibold text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {returns.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-medium">{row.id}</TableCell>
                  <TableCell>{row.retailer}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{row.reason}</TableCell>
                  <TableCell>{row.value}</TableCell>
                  <TableCell>
                    <StatusBadge status={row.status as any} />
                  </TableCell>
                  <TableCell>{row.created}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-2"
                        onClick={() => {
                          setSelectedReturn(row)
                          setAction("approve")
                        }}
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="gap-2"
                        onClick={() => {
                          setSelectedReturn(row)
                          setAction("reject")
                        }}
                      >
                        <XCircle className="w-3 h-3" />
                        Reject
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <ModalConfirm
        open={action !== null}
        onOpenChange={(open) => !open && setAction(null)}
        title={action === "reject" ? "Reject return?" : "Approve return?"}
        description={`Update return request ${selectedReturn?.id || ""}.`}
        confirmLabel={action === "reject" ? "Reject" : "Approve"}
        variant={action === "reject" ? "destructive" : "default"}
        onConfirm={handleConfirm}
      />
    </div>
  )
}
