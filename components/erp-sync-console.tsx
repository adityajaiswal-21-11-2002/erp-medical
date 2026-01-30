"use client"

import { useState } from "react"
import { Clock, CheckCircle2, AlertCircle, HourglassIcon, RefreshCw, LogInIcon as LogsIcon, ChevronDown, ChevronUp, Copy, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

interface SyncJob {
  id: string
  jobType: string
  startedAt: string
  completedAt?: string
  status: "completed" | "in_progress" | "failed" | "pending"
  recordsProcessed: number
  recordsTotal: number
  errorCount: number
  errorMessage?: string
  stackTrace?: string
}

interface ErrorLog {
  id: string
  timestamp: string
  jobId: string
  errorType: string
  message: string
  stackTrace: string
  retryable: boolean
}

const mockSyncJobs: SyncJob[] = [
  {
    id: "sync_001",
    jobType: "Inventory Sync",
    startedAt: "2025-01-24 14:30:00",
    completedAt: "2025-01-24 14:35:22",
    status: "completed",
    recordsProcessed: 2847,
    recordsTotal: 2847,
    errorCount: 0,
  },
  {
    id: "sync_002",
    jobType: "Order Sync",
    startedAt: "2025-01-24 14:35:45",
    completedAt: "2025-01-24 14:37:12",
    status: "completed",
    recordsProcessed: 445,
    recordsTotal: 445,
    errorCount: 0,
  },
  {
    id: "sync_003",
    jobType: "Retailer Master Sync",
    startedAt: "2025-01-24 12:15:00",
    completedAt: "2025-01-24 12:18:45",
    status: "completed",
    recordsProcessed: 384,
    recordsTotal: 384,
    errorCount: 0,
  },
  {
    id: "sync_004",
    jobType: "Pricing Update Sync",
    startedAt: "2025-01-24 13:45:00",
    completedAt: "2025-01-24 13:52:30",
    status: "failed",
    recordsProcessed: 1856,
    recordsTotal: 2100,
    errorCount: 5,
    errorMessage: "Gateway timeout on batch 3",
    stackTrace: `Error: Connection timeout
  at ERPGateway.executeSync (erp-gateway.js:145:23)
  at SyncManager.runJob (sync-manager.js:78:12)
  at processQueue (worker-pool.js:42:8)
  at Timeout._onTimeout (worker-pool.js:38:5)
  at listOnTimeout (internal/timers.js:549:45)`,
  },
  {
    id: "sync_005",
    jobType: "Payment Status Sync",
    startedAt: "2025-01-24 14:40:00",
    completedAt: undefined,
    status: "in_progress",
    recordsProcessed: 892,
    recordsTotal: 1200,
    errorCount: 2,
  },
  {
    id: "sync_006",
    jobType: "Return Order Sync",
    startedAt: "2025-01-24 15:00:00",
    completedAt: undefined,
    status: "pending",
    recordsProcessed: 0,
    recordsTotal: 350,
    errorCount: 0,
  },
]

const mockErrorLogs: ErrorLog[] = [
  {
    id: "err_001",
    timestamp: "2025-01-24 13:47:15",
    jobId: "sync_004",
    errorType: "ConnectionTimeout",
    message: "Connection timeout while syncing product SKU 45821 from batch 3",
    stackTrace: `Error: Connection timeout
  at Socket.<anonymous> (net.js:567:23)
  at emitErrorNT (internal/streams/readable.js:612:8)
  at processTicksAndRejection (internal/timers.js:549:45)`,
    retryable: true,
  },
  {
    id: "err_002",
    timestamp: "2025-01-24 13:49:22",
    jobId: "sync_004",
    errorType: "ValidationError",
    message: "Invalid SKU format for record ID 78234 - Expected numeric value",
    stackTrace: `Error: ValidationError
  at validateSKU (validators.js:234:12)
  at processBatch (sync-processor.js:112:8)`,
    retryable: true,
  },
  {
    id: "err_003",
    timestamp: "2025-01-24 14:42:01",
    jobId: "sync_005",
    errorType: "GatewayError",
    message: "Payment gateway returned 503 Service Unavailable for retailer 284",
    stackTrace: `Error: Service Unavailable
  at PaymentGateway.verify (payment-gateway.js:89:23)
  at verifyPayment (payment-processor.js:45:12)`,
    retryable: true,
  },
]

export function ERPSyncConsole() {
  const [expandedJob, setExpandedJob] = useState<string | null>(null)
  const [expandedError, setExpandedError] = useState<string | null>(null)
  const [selectedJob, setSelectedJob] = useState<SyncJob | null>(null)
  const [showErrorDrawer, setShowErrorDrawer] = useState(false)

  const lastSync = mockSyncJobs[0]
  const successfulRecords = mockSyncJobs.reduce((sum, job) => sum + job.recordsProcessed, 0)
  const failedRecords = mockSyncJobs.reduce((sum, job) => sum + job.errorCount, 0)
  const pendingJobs = mockSyncJobs.filter((job) => job.status === "pending" || job.status === "in_progress").length

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-emerald-100 text-emerald-800">Completed</Badge>
      case "in_progress":
        return <Badge className="bg-blue-100 text-blue-800">In Progress</Badge>
      case "failed":
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>
      case "pending":
        return <Badge className="bg-amber-100 text-amber-800">Pending</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getProgressPercentage = (job: SyncJob) => {
    return Math.round((job.recordsProcessed / job.recordsTotal) * 100)
  }

  const handleRetryJob = (jobId: string) => {
    console.log("[v0] Retrying job:", jobId)
  }

  const handleManualSync = (syncType: string) => {
    console.log("[v0] Triggering manual sync:", syncType)
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Sync Time</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2025-01-24</div>
            <p className="text-xs text-muted-foreground">14:37:12 (Inventory Sync)</p>
          </CardContent>
        </Card>

        <Card className="border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Successful Records</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{successfulRecords.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">All syncs today</p>
          </CardContent>
        </Card>

        <Card className="border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed Records</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{failedRecords}</div>
            <p className="text-xs text-muted-foreground">Requires attention</p>
          </CardContent>
        </Card>

        <Card className="border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Jobs</CardTitle>
            <HourglassIcon className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{pendingJobs}</div>
            <p className="text-xs text-muted-foreground">In queue or running</p>
          </CardContent>
        </Card>
      </div>

      {/* Manual Sync Triggers */}
      <Card className="border">
        <CardHeader>
          <CardTitle className="text-base">Manual Sync Triggers</CardTitle>
          <CardDescription>Trigger ERP synchronization manually for specific data types</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleManualSync("inventory")}
              className="w-full"
            >
              <RefreshCw className="w-3 h-3 mr-1" />
              Sync Inventory
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleManualSync("orders")}
              className="w-full"
            >
              <RefreshCw className="w-3 h-3 mr-1" />
              Sync Orders
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleManualSync("retailers")}
              className="w-full"
            >
              <RefreshCw className="w-3 h-3 mr-1" />
              Sync Retailers
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleManualSync("pricing")}
              className="w-full"
            >
              <RefreshCw className="w-3 h-3 mr-1" />
              Sync Pricing
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Sync Jobs Table */}
      <Card className="border">
        <CardHeader>
          <CardTitle className="text-base">Sync Jobs</CardTitle>
          <CardDescription>Monitor and manage ERP synchronization jobs</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-24">Job Type</TableHead>
                  <TableHead className="w-32">Started At</TableHead>
                  <TableHead className="w-24">Status</TableHead>
                  <TableHead className="w-32">Progress</TableHead>
                  <TableHead className="w-16 text-right">Errors</TableHead>
                  <TableHead className="w-24 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockSyncJobs.map((job) => (
                  <TableRow key={job.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium text-sm">{job.jobType}</TableCell>
                    <TableCell className="text-sm">{job.startedAt}</TableCell>
                    <TableCell>{getStatusBadge(job.status)}</TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2 text-xs">
                          <span>{getProgressPercentage(job)}%</span>
                          <span className="text-muted-foreground">
                            ({job.recordsProcessed}/{job.recordsTotal})
                          </span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all ${
                              job.status === "completed"
                                ? "bg-emerald-500"
                                : job.status === "failed"
                                  ? "bg-red-500"
                                  : "bg-blue-500"
                            }`}
                            style={{ width: `${getProgressPercentage(job)}%` }}
                          />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {job.errorCount > 0 && (
                        <Badge variant="destructive" className="text-xs">
                          {job.errorCount}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-2">
                        {job.status === "failed" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRetryJob(job.id)}
                          >
                            <RefreshCw className="w-3 h-3" />
                          </Button>
                        )}
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedJob(job)}
                            >
                              <LogsIcon className="w-3 h-3" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>Job Details - {job.jobType}</DialogTitle>
                              <DialogDescription>Job ID: {job.id}</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <p className="text-xs font-semibold text-muted-foreground">Started At</p>
                                  <p className="text-sm">{job.startedAt}</p>
                                </div>
                                <div>
                                  <p className="text-xs font-semibold text-muted-foreground">Completed At</p>
                                  <p className="text-sm">{job.completedAt || "N/A"}</p>
                                </div>
                                <div>
                                  <p className="text-xs font-semibold text-muted-foreground">Status</p>
                                  <div>{getStatusBadge(job.status)}</div>
                                </div>
                                <div>
                                  <p className="text-xs font-semibold text-muted-foreground">Records</p>
                                  <p className="text-sm">
                                    {job.recordsProcessed} / {job.recordsTotal}
                                  </p>
                                </div>
                              </div>

                              {job.stackTrace && (
                                <div className="space-y-2">
                                  <p className="text-xs font-semibold text-muted-foreground">Stack Trace</p>
                                  <div className="bg-muted p-3 rounded text-xs font-mono overflow-x-auto">
                                    <pre>{job.stackTrace}</pre>
                                  </div>
                                </div>
                              )}
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Error Logs */}
      <Card className="border">
        <CardHeader>
          <CardTitle className="text-base">Error Logs</CardTitle>
          <CardDescription>Recent synchronization errors requiring attention</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {mockErrorLogs.map((error) => (
              <Collapsible
                key={error.id}
                open={expandedError === error.id}
                onOpenChange={() =>
                  setExpandedError(expandedError === error.id ? null : error.id)
                }
              >
                <CollapsibleTrigger asChild>
                  <button className="w-full flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50">
                    <div className="flex items-center space-x-3 flex-1 text-left">
                      <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="font-medium text-sm">{error.errorType}</p>
                        <p className="text-xs text-muted-foreground truncate">{error.message}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-2">
                      <Badge variant="secondary" className="text-xs">
                        {error.timestamp}
                      </Badge>
                      {expandedError === error.id ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </div>
                  </button>
                </CollapsibleTrigger>
                <CollapsibleContent className="pt-0">
                  <div className="p-4 space-y-3 bg-muted/30 rounded">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground">Job ID</p>
                        <p className="text-sm font-mono">{error.jobId}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground">Retryable</p>
                        <p className="text-sm">
                          {error.retryable ? (
                            <Badge className="bg-emerald-100 text-emerald-800 text-xs">Yes</Badge>
                          ) : (
                            <Badge className="bg-red-100 text-red-800 text-xs">No</Badge>
                          )}
                        </p>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground mb-2">Stack Trace</p>
                      <div className="bg-background p-3 rounded text-xs font-mono overflow-x-auto border">
                        <pre>{error.stackTrace}</pre>
                      </div>
                    </div>
                    <div className="flex space-x-2 pt-2">
                      <Button size="sm" variant="outline" onClick={() => console.log("[v0] Copy error log")}>
                        <Copy className="w-3 h-3 mr-1" />
                        Copy
                      </Button>
                      {error.retryable && (
                        <Button size="sm" onClick={() => console.log("[v0] Retry error:", error.id)}>
                          <RefreshCw className="w-3 h-3 mr-1" />
                          Retry
                        </Button>
                      )}
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
