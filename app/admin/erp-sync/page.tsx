"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { api } from "@/lib/api"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

type SyncLog = {
  _id: string
  jobType: string
  status: string
  message?: string
  retryCount?: number
  createdAt?: string
}

export default function ErpSyncPage() {
  const [logs, setLogs] = useState<SyncLog[]>([])

  const fetchLogs = async () => {
    try {
      const res = await api.get("/api/sync/logs")
      setLogs(res.data?.data || [])
    } catch (error: any) {
      toast.error(error?.response?.data?.error || "Failed to load sync logs")
    }
  }

  const triggerSync = async (type: "products" | "inventory") => {
    try {
      await api.post(`/api/erp/sync/${type}`)
      toast.success("Sync triggered")
      fetchLogs()
    } catch (error: any) {
      toast.error(error?.response?.data?.error || "Failed to trigger sync")
    }
  }

  const retryLog = async (id: string) => {
    try {
      await api.post(`/api/sync/retry/${id}`)
      toast.success("Retry queued")
      fetchLogs()
    } catch (error: any) {
      toast.error(error?.response?.data?.error || "Failed to retry")
    }
  }

  useEffect(() => {
    fetchLogs().catch(() => undefined)
  }, [])

  return (
    <div className="space-y-6">
      <PageHeader title="ERP Sync Console" description="Trigger syncs and monitor ERP logs." />
      <div className="flex flex-wrap gap-3">
        <Button onClick={() => triggerSync("products")} variant="outline">
          Sync Products
        </Button>
        <Button onClick={() => triggerSync("inventory")} variant="outline">
          Sync Inventory
        </Button>
        <Button onClick={fetchLogs} variant="outline">
          Refresh Logs
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Job</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Message</TableHead>
                <TableHead>Retries</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log._id}>
                  <TableCell>{log.jobType}</TableCell>
                  <TableCell>{log.status}</TableCell>
                  <TableCell className="max-w-xs truncate">{log.message || "-"}</TableCell>
                  <TableCell>{log.retryCount || 0}</TableCell>
                  <TableCell>
                    {log.createdAt ? new Date(log.createdAt).toLocaleString() : "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" onClick={() => retryLog(log._id)}>
                      Retry
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {logs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    No sync logs yet
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
