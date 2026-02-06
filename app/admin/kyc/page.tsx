"use client"

import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import { api } from "@/lib/api"
import { DataTable } from "@/components/data-table"
import { PageHeader } from "@/components/page-header"
import { StatusBadge } from "@/components/status-badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"

type KycStatus = "PENDING" | "APPROVED" | "REJECTED" | "RESUBMIT"

type KycSubmissionRow = {
  _id: string
  retailerId: string
  status: KycStatus
  businessName: string
  gstin?: string
  drugLicenseNumber?: string
  address?: string
  documents?: { type: string; label?: string; filePath?: string }[]
  rejectionReason?: string
  reviewedBy?: string
  createdAt?: string
  updatedAt?: string
}

function shortId(value: string | undefined | null) {
  if (!value) return "—"
  const s = String(value)
  if (s.length <= 10) return s
  return `${s.slice(0, 6)}…${s.slice(-4)}`
}

export default function AdminKycPage() {
  const [submissions, setSubmissions] = useState<KycSubmissionRow[]>([])
  const [loading, setLoading] = useState(false)

  const [reasonOpen, setReasonOpen] = useState(false)
  const [reasonAction, setReasonAction] = useState<"REJECTED" | "RESUBMIT">("REJECTED")
  const [reasonText, setReasonText] = useState("")
  const [selected, setSelected] = useState<KycSubmissionRow | null>(null)

  const fetchSubmissions = async () => {
    setLoading(true)
    try {
      const res = await api.get("/api/kyc/submissions")
      setSubmissions(res.data?.data || [])
    } catch (error: any) {
      toast.error(error?.response?.data?.error || "Failed to load KYC submissions")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSubmissions().catch(() => undefined)
  }, [])

  const patchSubmission = async (row: KycSubmissionRow, status: KycStatus, rejectionReason?: string) => {
    try {
      await api.patch(`/api/kyc/submissions/${row._id}`, { status, rejectionReason })
      toast.success(`KYC ${status === "APPROVED" ? "approved" : status.toLowerCase()}`)
      await fetchSubmissions()
    } catch (error: any) {
      toast.error(error?.response?.data?.error || "Failed to update KYC")
    }
  }

  const columns = useMemo(
    () => [
      { key: "businessName", label: "Business", sortable: true },
      {
        key: "status",
        label: "Status",
        filterable: true,
        filterOptions: ["PENDING", "APPROVED", "REJECTED", "RESUBMIT"],
        render: (value: KycStatus) => <StatusBadge status={value as any} />,
      },
      { key: "gstin", label: "GSTIN", render: (v: string | undefined) => v || "—" },
      { key: "drugLicenseNumber", label: "Drug License", render: (v: string | undefined) => v || "—" },
      {
        key: "documents",
        label: "Docs",
        render: (_: any, row: KycSubmissionRow) => String(row.documents?.length ?? 0),
      },
      {
        key: "retailerId",
        label: "Retailer",
        render: (value: string) => shortId(value),
      },
      {
        key: "reviewedBy",
        label: "Reviewed By",
        render: (value: string | undefined) => shortId(value),
      },
      {
        key: "createdAt",
        label: "Submitted",
        sortable: true,
        render: (value: string | undefined) => (value ? new Date(value).toLocaleString() : "—"),
      },
      {
        key: "rejectionReason",
        label: "Reason",
        render: (value: string | undefined) => value || "—",
      },
    ],
    [],
  )

  return (
    <div className="space-y-6">
      <PageHeader
        title="KYC"
        description='Review retailer KYC submissions. To approve, choose status "APPROVED".'
        actions={
          <Button onClick={() => fetchSubmissions()} disabled={loading}>
            Refresh
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={submissions}
        searchableFields={["businessName", "gstin", "drugLicenseNumber", "retailerId"]}
        actions={[
          {
            label: "Approve",
            onClick: (row) => patchSubmission(row, "APPROVED"),
          },
          {
            label: "Reject",
            variant: "destructive",
            onClick: (row) => {
              setSelected(row)
              setReasonAction("REJECTED")
              setReasonText("")
              setReasonOpen(true)
            },
          },
          {
            label: "Resubmit",
            onClick: (row) => {
              setSelected(row)
              setReasonAction("RESUBMIT")
              setReasonText("")
              setReasonOpen(true)
            },
          },
        ]}
      />

      <Dialog
        open={reasonOpen}
        onOpenChange={(open) => {
          setReasonOpen(open)
          if (!open) {
            setSelected(null)
            setReasonText("")
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{reasonAction === "REJECTED" ? "Reject KYC" : "Request resubmission"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Business: <span className="font-medium text-foreground">{selected?.businessName || "—"}</span>
            </p>
            <Input
              placeholder="Reason (optional)"
              value={reasonText}
              onChange={(e) => setReasonText(e.target.value)}
            />
          </div>

          <DialogFooter>
            <Button
              variant={reasonAction === "REJECTED" ? "destructive" : "default"}
              onClick={async () => {
                if (!selected) return
                await patchSubmission(selected, reasonAction, reasonText || undefined)
                setReasonOpen(false)
              }}
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

