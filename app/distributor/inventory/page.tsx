"use client"

import React, { useEffect, useState } from "react"
import { Eye } from "lucide-react"

import { PageHeader } from "@/components/page-header"
import { DataTable } from "@/components/data-table"
import { DrawerPanel } from "@/components/drawer-panel"
import { StatusBadge } from "@/components/status-badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { api } from "@/lib/api"
import { toast } from "sonner"

interface InventoryRow {
  sku: string
  available: number
  reserved: number
  name?: string
  category?: string
  brand?: string
  expiry?: string
  status?: "processing" | "completed" | "failed"
}

export default function DistributorInventoryPage() {
  const [inventoryData, setInventoryData] = useState<InventoryRow[]>([])
  const [selectedSku, setSelectedSku] = useState<InventoryRow | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)

  const fetchInventory = async () => {
    try {
      const res = await api.get("/api/distributor/inventory")
      setInventoryData(res.data?.data || [])
    } catch (error: any) {
      toast.error(error?.response?.data?.error || "Failed to load inventory")
    }
  }

  useEffect(() => {
    fetchInventory().catch(() => undefined)
  }, [])

  const dataWithFilters = inventoryData.map((item) => ({
    ...item,
    status: item.status || "completed",
  }))

  return (
    <div className="space-y-6">
      <PageHeader
        title="Inventory"
        description="Monitor stock, reservations, and expiry exposure."
      />

      <Card className="border">
        <CardContent className="p-6">
          <DataTable
            columns={[
              { key: "sku", label: "SKU", sortable: true },
              { key: "name", label: "Name", sortable: true },
              {
                key: "category",
                label: "Category",
                sortable: true,
                filterable: true,
                filterOptions: ["Analgesic", "Antibiotic", "Supplements", "Allergy"],
              },
              {
                key: "brand",
                label: "Brand",
                sortable: true,
                filterable: true,
                filterOptions: ["MediCore", "HealWell", "NutriPlus", "AllerFree"],
              },
              {
                key: "available",
                label: "Available Qty",
                sortable: true,
              },
              {
                key: "reserved",
                label: "Reserved Qty",
                sortable: true,
              },
              { key: "expiry", label: "Expiry", sortable: true },
              {
                key: "status",
                label: "Status",
                sortable: true,
                filterable: true,
                filterOptions: ["processing", "completed", "failed"],
                render: (value: string) => <StatusBadge status={value as any} />,
              },
            ]}
            data={dataWithFilters}
            searchableFields={["sku", "name", "category", "brand"]}
            searchPlaceholder="Search SKU, product, category..."
            actions={[
              {
                label: "View SKU",
                onClick: (row: InventoryRow) => {
                  setSelectedSku(row)
                  setDrawerOpen(true)
                },
              },
            ]}
            pagination
          />
        </CardContent>
      </Card>

      <DrawerPanel
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        title={`SKU Details ${selectedSku?.sku ? `• ${selectedSku.sku}` : ""}`}
        description="Quick view of stock position and expiry timeline."
        actions={
          <Button className="gap-2">
            <Eye className="w-4 h-4" />
            Open SKU record
          </Button>
        }
      >
        {selectedSku && (
          <div className="space-y-4">
            <div className="grid gap-2">
              <p className="text-sm font-medium">{selectedSku.name}</p>
              <p className="text-xs text-muted-foreground">Category: {selectedSku.category}</p>
              <p className="text-xs text-muted-foreground">Brand: {selectedSku.brand}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border bg-card p-3">
                <p className="text-xs text-muted-foreground">Available Qty</p>
                <p className="text-lg font-semibold">{selectedSku.available}</p>
              </div>
              <div className="rounded-lg border bg-card p-3">
                <p className="text-xs text-muted-foreground">Reserved Qty</p>
                <p className="text-lg font-semibold">{selectedSku.reserved}</p>
              </div>
              <div className="rounded-lg border bg-card p-3">
                <p className="text-xs text-muted-foreground">Expiry</p>
                <p className="text-sm font-medium">{selectedSku.expiry}</p>
              </div>
              <div className="rounded-lg border bg-card p-3">
                <p className="text-xs text-muted-foreground">Status</p>
                <StatusBadge status={selectedSku.status as any} />
              </div>
            </div>
          </div>
        )}
      </DrawerPanel>
    </div>
  )
}
