"use client"

import { useEffect, useMemo, useState } from "react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { api } from "@/lib/api"
import { DataTable } from "@/components/data-table"
import { PageHeader } from "@/components/page-header"
import { StatusBadge } from "@/components/status-badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { ModalConfirm } from "@/components/modal-confirm"

const baseSchema = z.object({
  name: z.string().min(1),
  genericName: z.string().min(1),
  packaging: z.string().min(1),
  dosageForm: z.string().min(1),
  category: z.string().min(1),
  pts: z.number(),
  ptr: z.number(),
  netMrp: z.number(),
  mrp: z.number(),
  gstPercent: z.union([z.literal(0), z.literal(5), z.literal(12)]),
  hsnCode: z.string().min(1),
  shelfLife: z.string().min(1),
  currentStock: z.number(),
  minimumStockAlert: z.number().optional(),
  stockUnit: z.enum(["Strip", "Box", "Bottle"]).optional(),
  stockStatus: z.enum(["IN_STOCK", "LOW", "OUT"]).optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
  strength: z.string().optional(),
  manufacturerName: z.string().optional(),
  batch: z.string().optional(),
})

const updateSchema = baseSchema.partial().refine((val) => Object.keys(val).length > 0, {
  message: "Provide at least one field",
})

const photoSchema = z.object({
  photoBase64: z.string().min(1),
})

type ProductRow = {
  _id: string
  name: string
  genericName: string
  category: string
  packaging: string
  mrp: number
  currentStock: number
  stockStatus: "IN_STOCK" | "LOW" | "OUT"
  status: "ACTIVE" | "INACTIVE"
  createdAt: string
  legalMetrology?: { compliant?: boolean }
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<ProductRow[]>([])
  const [loading, setLoading] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [photoOpen, setPhotoOpen] = useState(false)
  const [inactiveOpen, setInactiveOpen] = useState(false)
  const [selected, setSelected] = useState<ProductRow | null>(null)

  const createForm = useForm<z.infer<typeof baseSchema>>({
    resolver: zodResolver(baseSchema),
    defaultValues: {
      name: "",
      genericName: "",
      packaging: "",
      dosageForm: "",
      category: "",
      pts: 0,
      ptr: 0,
      netMrp: 0,
      mrp: 0,
      gstPercent: 5,
      hsnCode: "",
      shelfLife: "",
      currentStock: 0,
      status: "ACTIVE",
      stockStatus: "IN_STOCK",
      stockUnit: "Strip",
    },
  })

  const updateForm = useForm<z.infer<typeof updateSchema>>({
    resolver: zodResolver(updateSchema),
  })

  const photoForm = useForm<z.infer<typeof photoSchema>>({
    resolver: zodResolver(photoSchema),
    defaultValues: { photoBase64: "" },
  })

  const minLoadingMs = 400
  const fetchProducts = async () => {
    setLoading(true)
    const started = Date.now()
    try {
      const res = await api.get("/api/products?limit=200")
      const items = res.data?.data?.items || []
      setProducts(items)
      const elapsed = Date.now() - started
      const remaining = Math.max(0, minLoadingMs - elapsed)
      if (remaining > 0) {
        await new Promise((r) => setTimeout(r, remaining))
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.error || "Failed to load products")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts().catch(() => undefined)
  }, [])

  const openEdit = async (product: ProductRow) => {
    setSelected(product)
    try {
      const res = await api.get(`/api/products/${product._id}`)
      const data = res.data?.data
      if (data) {
        updateForm.reset({
          name: data.name,
          genericName: data.genericName,
          packaging: data.packaging,
          dosageForm: data.dosageForm,
          category: data.category,
          pts: data.pts,
          ptr: data.ptr,
          netMrp: data.netMrp,
          mrp: data.mrp,
          gstPercent: data.gstPercent,
          hsnCode: data.hsnCode,
          shelfLife: data.shelfLife,
          currentStock: data.currentStock,
          minimumStockAlert: data.minimumStockAlert,
          stockUnit: data.stockUnit,
          stockStatus: data.stockStatus,
          status: data.status,
          strength: data.strength,
          manufacturerName: data.manufacturerName,
          batch: data.batch,
        })
      }
      setEditOpen(true)
    } catch (error: any) {
      toast.error(error?.response?.data?.error || "Failed to load product")
    }
  }

  const columns = useMemo(
    () => [
      { key: "name", label: "Name", sortable: true },
      { key: "genericName", label: "Generic" },
      { key: "category", label: "Category" },
      { key: "packaging", label: "Pack" },
      { key: "mrp", label: "MRP", render: (value: number) => `₹${value}` },
      { key: "currentStock", label: "Stock" },
      {
        key: "legalMetrology",
        label: "Legal",
        render: (value: ProductRow["legalMetrology"]) =>
          value?.compliant ? <StatusBadge status="ACTIVE" /> : <StatusBadge status="INACTIVE" />,
      },
      {
        key: "stockStatus",
        label: "Stock Status",
        filterable: true,
        filterOptions: ["IN_STOCK", "LOW", "OUT"],
        render: (value: ProductRow["stockStatus"]) => <StatusBadge status={value} />,
      },
      {
        key: "status",
        label: "Status",
        filterable: true,
        filterOptions: ["ACTIVE", "INACTIVE"],
        render: (value: ProductRow["status"]) => <StatusBadge status={value} />,
      },
    ],
    [],
  )

  return (
    <div className="space-y-6">
      <PageHeader
        title="Products"
        description="Manage product catalog and inventory."
        actions={
          <Button onClick={() => setCreateOpen(true)} disabled={loading}>
            New Product
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={products}
        searchableFields={["name", "genericName", "category", "packaging"]}
        actions={[
          { label: "Edit", onClick: openEdit },
          {
            label: "Update Photo",
            onClick: (row) => {
              setSelected(row)
              photoForm.reset({ photoBase64: "" })
              setPhotoOpen(true)
            },
          },
          {
            label: "Inactivate",
            onClick: (row) => {
              setSelected(row)
              setInactiveOpen(true)
            },
            variant: "destructive",
          },
        ]}
      />

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Product</DialogTitle>
          </DialogHeader>
          <form
            className="grid grid-cols-1 gap-4 md:grid-cols-2"
            onSubmit={createForm.handleSubmit(async (values) => {
              try {
                await api.post("/api/products", values)
                toast.success("Product created")
                setCreateOpen(false)
                createForm.reset()
                fetchProducts()
              } catch (error: any) {
                toast.error(error?.response?.data?.error || "Failed to create product")
              }
            })}
          >
            <Input placeholder="Name" {...createForm.register("name")} />
            <Input placeholder="Generic name" {...createForm.register("genericName")} />
            <Input placeholder="Packaging" {...createForm.register("packaging")} />
            <Input placeholder="Dosage form" {...createForm.register("dosageForm")} />
            <Input placeholder="Category" {...createForm.register("category")} />
            <Input
              placeholder="HSN Code"
              {...createForm.register("hsnCode")}
            />
            <Input placeholder="Shelf life (MM/YYYY)" {...createForm.register("shelfLife")} />
            <Input placeholder="Strength" {...createForm.register("strength")} />
            <Input
              placeholder="Manufacturer"
              {...createForm.register("manufacturerName")}
            />
            <Input
              type="number"
              placeholder="PTS"
              {...createForm.register("pts", { valueAsNumber: true })}
            />
            <Input
              type="number"
              placeholder="PTR"
              {...createForm.register("ptr", { valueAsNumber: true })}
            />
            <Input
              type="number"
              placeholder="Net MRP"
              {...createForm.register("netMrp", { valueAsNumber: true })}
            />
            <Input
              type="number"
              placeholder="MRP"
              {...createForm.register("mrp", { valueAsNumber: true })}
            />
            <Input
              type="number"
              placeholder="Current stock"
              {...createForm.register("currentStock", { valueAsNumber: true })}
            />
            <Select
              value={String(createForm.watch("gstPercent"))}
              onValueChange={(value) => createForm.setValue("gstPercent", Number(value) as 0 | 5 | 12)}
            >
              <SelectTrigger>
                <SelectValue placeholder="GST%" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">0%</SelectItem>
                <SelectItem value="5">5%</SelectItem>
                <SelectItem value="12">12%</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={createForm.watch("stockStatus")}
              onValueChange={(value) =>
                createForm.setValue("stockStatus", value as "IN_STOCK" | "LOW" | "OUT")
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Stock status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="IN_STOCK">IN_STOCK</SelectItem>
                <SelectItem value="LOW">LOW</SelectItem>
                <SelectItem value="OUT">OUT</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={createForm.watch("status")}
              onValueChange={(value) =>
                createForm.setValue("status", value as "ACTIVE" | "INACTIVE")
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ACTIVE">ACTIVE</SelectItem>
                <SelectItem value="INACTIVE">INACTIVE</SelectItem>
              </SelectContent>
            </Select>
            <DialogFooter className="md:col-span-2">
              <Button type="submit" disabled={createForm.formState.isSubmitting}>
                {createForm.formState.isSubmitting ? "Creating..." : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
          </DialogHeader>
          <form
            className="grid grid-cols-1 gap-4 md:grid-cols-2"
            onSubmit={updateForm.handleSubmit(async (values) => {
              if (!selected) return
              try {
                await api.patch(`/api/products/${selected._id}`, values)
                toast.success("Product updated")
                setEditOpen(false)
                fetchProducts()
              } catch (error: any) {
                toast.error(error?.response?.data?.error || "Failed to update product")
              }
            })}
          >
            <Input placeholder="Name" {...updateForm.register("name")} />
            <Input placeholder="Generic name" {...updateForm.register("genericName")} />
            <Input placeholder="Packaging" {...updateForm.register("packaging")} />
            <Input placeholder="Dosage form" {...updateForm.register("dosageForm")} />
            <Input placeholder="Category" {...updateForm.register("category")} />
            <Input placeholder="HSN Code" {...updateForm.register("hsnCode")} />
            <Input placeholder="Shelf life (MM/YYYY)" {...updateForm.register("shelfLife")} />
            <Input
              type="number"
              placeholder="MRP"
              {...updateForm.register("mrp", { valueAsNumber: true })}
            />
            <Input
              type="number"
              placeholder="Current stock"
              {...updateForm.register("currentStock", { valueAsNumber: true })}
            />
            <Select
              value={String(updateForm.watch("gstPercent"))}
              onValueChange={(value) => updateForm.setValue("gstPercent", Number(value) as 0 | 5 | 12)}
            >
              <SelectTrigger>
                <SelectValue placeholder="GST%" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">0%</SelectItem>
                <SelectItem value="5">5%</SelectItem>
                <SelectItem value="12">12%</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={updateForm.watch("stockStatus")}
              onValueChange={(value) =>
                updateForm.setValue("stockStatus", value as "IN_STOCK" | "LOW" | "OUT")
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Stock status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="IN_STOCK">IN_STOCK</SelectItem>
                <SelectItem value="LOW">LOW</SelectItem>
                <SelectItem value="OUT">OUT</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={updateForm.watch("status")}
              onValueChange={(value) =>
                updateForm.setValue("status", value as "ACTIVE" | "INACTIVE")
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ACTIVE">ACTIVE</SelectItem>
                <SelectItem value="INACTIVE">INACTIVE</SelectItem>
              </SelectContent>
            </Select>
            <DialogFooter className="md:col-span-2">
              <Button type="submit" disabled={updateForm.formState.isSubmitting}>
                {updateForm.formState.isSubmitting ? "Saving..." : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={photoOpen} onOpenChange={setPhotoOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Photo</DialogTitle>
          </DialogHeader>
          <form
            className="space-y-4"
            onSubmit={photoForm.handleSubmit(async (values) => {
              if (!selected) return
              try {
                await api.post(`/api/products/${selected._id}/photo`, values)
                toast.success("Photo updated")
                setPhotoOpen(false)
                fetchProducts()
              } catch (error: any) {
                toast.error(error?.response?.data?.error || "Failed to update photo")
              }
            })}
          >
            <Textarea
              placeholder="Paste base64 image data"
              rows={5}
              {...photoForm.register("photoBase64")}
            />
            <DialogFooter>
              <Button type="submit" disabled={photoForm.formState.isSubmitting}>
                {photoForm.formState.isSubmitting ? "Saving..." : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ModalConfirm
        open={inactiveOpen}
        onOpenChange={setInactiveOpen}
        title="Inactivate product?"
        description="This will set the product status to INACTIVE."
        confirmLabel="Inactivate"
        variant="destructive"
        onConfirm={async () => {
          if (!selected) return
          try {
            await api.delete(`/api/products/${selected._id}`)
            toast.success("Product inactivated")
            setInactiveOpen(false)
            fetchProducts()
          } catch (error: any) {
            toast.error(error?.response?.data?.error || "Failed to update product")
          }
        }}
      />
    </div>
  )
}
