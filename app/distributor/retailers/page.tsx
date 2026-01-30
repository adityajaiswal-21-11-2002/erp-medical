import React from "react"
import { Building2, Phone } from "lucide-react"

import { PageHeader } from "@/components/page-header"
import { StatusBadge } from "@/components/status-badge"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const retailers = [
  { id: "RET-0082", name: "Apollo Pharmacy - Delhi", city: "Delhi", status: "approved", orders: 128 },
  { id: "RET-0075", name: "MedPlus - Mumbai", city: "Mumbai", status: "approved", orders: 96 },
  { id: "RET-0064", name: "Care & Cure - Chennai", city: "Chennai", status: "pending", orders: 44 },
  { id: "RET-0059", name: "HealthCare Retail - Hyderabad", city: "Hyderabad", status: "approved", orders: 73 },
]

export default function DistributorRetailersPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Retailers"
        description="Monitor partner performance and activation status."
        actions={<Button variant="outline">Add retailer</Button>}
      />

      <Card className="border">
        <CardContent className="p-6">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="text-xs font-semibold">Retailer</TableHead>
                <TableHead className="text-xs font-semibold">Location</TableHead>
                <TableHead className="text-xs font-semibold">Status</TableHead>
                <TableHead className="text-xs font-semibold">Orders (30d)</TableHead>
                <TableHead className="text-xs font-semibold text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {retailers.map((retailer) => (
                <TableRow key={retailer.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center">
                        <Building2 className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{retailer.name}</p>
                        <p className="text-xs text-muted-foreground">ID: {retailer.id}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{retailer.city}</TableCell>
                  <TableCell>
                    <StatusBadge status={retailer.status as any} />
                  </TableCell>
                  <TableCell>{retailer.orders}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" className="gap-2">
                      <Phone className="w-4 h-4" />
                      Contact
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
