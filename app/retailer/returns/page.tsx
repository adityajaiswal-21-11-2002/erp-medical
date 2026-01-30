"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { api } from "@/lib/api"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

type ReturnRow = {
  _id: string
  orderId: string
  reason: string
  status: string
  createdAt?: string
}

export default function RetailerReturnsPage() {
  const [returns, setReturns] = useState<ReturnRow[]>([])
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ orderId: "", reason: "" })
  const [disabled, setDisabled] = useState(false)

  const load = async () => {
    try {
      const res = await api.get("/api/returns")
      setReturns(res.data?.data || [])
      setDisabled(false)
    } catch (error: any) {
      if (error?.response?.status === 403) {
        setDisabled(true)
        return
      }
      toast.error(error?.response?.data?.error || "Failed to load returns")
    }
  }

  const createReturn = async () => {
    try {
      await api.post("/api/returns", form)
      toast.success("Return requested")
      setOpen(false)
      setForm({ orderId: "", reason: "" })
      load()
    } catch (error: any) {
      toast.error(error?.response?.data?.error || "Failed to create return")
    }
  }

  useEffect(() => {
    load().catch(() => undefined)
  }, [])

  if (disabled) {
    return (
      <div className="space-y-6">
        <PageHeader title="Returns" description="Returns are currently disabled by admin." />
        <div className="text-sm text-muted-foreground">Please contact admin to enable returns.</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Returns"
        description="Request returns and track approvals."
        actions={<Button onClick={() => setOpen(true)}>Request Return</Button>}
      />
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order</TableHead>
            <TableHead>Reason</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Requested</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {returns.map((row) => (
            <TableRow key={row._id}>
              <TableCell>{row.orderId}</TableCell>
              <TableCell>{row.reason}</TableCell>
              <TableCell>{row.status}</TableCell>
              <TableCell>
                {row.createdAt ? new Date(row.createdAt).toLocaleDateString() : "-"}
              </TableCell>
            </TableRow>
          ))}
          {returns.length === 0 && (
            <TableRow>
              <TableCell colSpan={4} className="text-center text-muted-foreground">
                No return requests
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Return</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              placeholder="Order ID"
              value={form.orderId}
              onChange={(e) => setForm({ ...form, orderId: e.target.value })}
            />
            <Input
              placeholder="Reason"
              value={form.reason}
              onChange={(e) => setForm({ ...form, reason: e.target.value })}
            />
          </div>
          <DialogFooter>
            <Button onClick={createReturn}>Submit</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
