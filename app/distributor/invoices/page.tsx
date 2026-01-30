import React, { useEffect, useState } from "react"
import { Download } from "lucide-react"
import { api } from "@/lib/api"
import { toast } from "sonner"

import { PageHeader } from "@/components/page-header"
import { StatusBadge } from "@/components/status-badge"
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

type Invoice = {
  invoiceNumber: string
  amount: number
  status: string
}

export default function DistributorInvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([])

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/api/erp/invoices")
        setInvoices(res.data?.data || [])
      } catch (error: any) {
        toast.error(error?.response?.data?.error || "Failed to load invoices")
      }
    }
    load().catch(() => undefined)
  }, [])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Invoices"
        description="Track collections, invoice status, and payment due dates."
        actions={
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Download summary
          </Button>
        }
      />

      <Card className="border">
        <CardContent className="p-6">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="text-xs font-semibold">Invoice</TableHead>
                <TableHead className="text-xs font-semibold">Retailer</TableHead>
                <TableHead className="text-xs font-semibold">Amount</TableHead>
                <TableHead className="text-xs font-semibold">Status</TableHead>
                <TableHead className="text-xs font-semibold">Due Date</TableHead>
                <TableHead className="text-xs font-semibold text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((invoice) => (
                <TableRow key={invoice.invoiceNumber}>
                  <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                  <TableCell>-</TableCell>
                  <TableCell>₹{invoice.amount}</TableCell>
                  <TableCell>
                    <StatusBadge status={invoice.status as any} />
                  </TableCell>
                  <TableCell>-</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
