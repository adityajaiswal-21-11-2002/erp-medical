"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { api } from "@/lib/api"
import { PageHeader } from "@/components/page-header"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

type ComplianceLog = {
  _id: string
  action: string
  subjectType?: string
  createdAt?: string
}

export default function CompliancePage() {
  const [logs, setLogs] = useState<ComplianceLog[]>([])

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/api/compliance")
        setLogs(res.data?.data || [])
      } catch (error: any) {
        toast.error(error?.response?.data?.error || "Failed to load compliance logs")
      }
    }
    load().catch(() => undefined)
  }, [])

  return (
    <div className="space-y-6">
      <PageHeader title="Compliance Logs" description="DPDP consent and admin actions." />
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Action</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Timestamp</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log._id}>
                  <TableCell>{log.action}</TableCell>
                  <TableCell>{log.subjectType || "-"}</TableCell>
                  <TableCell>
                    {log.createdAt ? new Date(log.createdAt).toLocaleString() : "-"}
                  </TableCell>
                </TableRow>
              ))}
              {logs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground">
                    No compliance logs
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
