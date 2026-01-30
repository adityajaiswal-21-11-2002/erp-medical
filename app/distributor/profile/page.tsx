import React from "react"
import { Save } from "lucide-react"

import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

export default function DistributorProfilePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Profile"
        description="Manage distributor profile, contacts, and compliance details."
        actions={
          <Button className="gap-2">
            <Save className="w-4 h-4" />
            Save changes
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="border lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Distributor Details</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Distributor Name</label>
              <Input defaultValue="Delta Pharma Distribution Pvt Ltd" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">GSTIN</label>
              <Input defaultValue="07AAAAD1234Q1Z5" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Primary Contact</label>
              <Input defaultValue="Neha Kapoor" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Contact Email</label>
              <Input defaultValue="ops@deltapharma.in" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Phone</label>
              <Input defaultValue="+91 98765 43210" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Service Region</label>
              <Input defaultValue="North & West India" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-medium text-muted-foreground">Warehouse Address</label>
              <Textarea defaultValue="Okhla Industrial Area, Phase II, New Delhi - 110020" />
            </div>
          </CardContent>
        </Card>

        <Card className="border">
          <CardHeader>
            <CardTitle className="text-base">Compliance Snapshot</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border bg-muted/30 p-3">
              <p className="text-xs text-muted-foreground">Drug License</p>
              <p className="text-sm font-medium">DL-2026-IND-3991</p>
              <p className="text-xs text-muted-foreground">Expires: Mar 2028</p>
            </div>
            <div className="rounded-lg border bg-muted/30 p-3">
              <p className="text-xs text-muted-foreground">GDP Audit</p>
              <p className="text-sm font-medium">Completed</p>
              <p className="text-xs text-muted-foreground">Next review: Aug 2026</p>
            </div>
            <div className="rounded-lg border bg-muted/30 p-3">
              <p className="text-xs text-muted-foreground">Cold Chain Capacity</p>
              <p className="text-sm font-medium">98% uptime</p>
              <p className="text-xs text-muted-foreground">Last inspection: Jan 2026</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
