"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { api } from "@/lib/api"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

type Banner = {
  _id: string
  title: string
  placement: string
  active: boolean
}

export default function BannersPage() {
  const [banners, setBanners] = useState<Banner[]>([])
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ title: "", placement: "CUSTOMER", imageUrl: "" })

  const load = async () => {
    try {
      const res = await api.get("/api/banners")
      setBanners(res.data?.data || [])
    } catch (error: any) {
      toast.error(error?.response?.data?.error || "Failed to load banners")
    }
  }

  const createBanner = async () => {
    try {
      await api.post("/api/banners", form)
      toast.success("Banner created")
      setOpen(false)
      setForm({ title: "", placement: "CUSTOMER", imageUrl: "" })
      load()
    } catch (error: any) {
      toast.error(error?.response?.data?.error || "Failed to create banner")
    }
  }

  useEffect(() => {
    load().catch(() => undefined)
  }, [])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Banners & Notifications"
        description="Manage CDN banners and in-app notifications."
        actions={<Button onClick={() => setOpen(true)}>New Banner</Button>}
      />
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Placement</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {banners.map((banner) => (
            <TableRow key={banner._id}>
              <TableCell>{banner.title}</TableCell>
              <TableCell>{banner.placement}</TableCell>
              <TableCell>{banner.active ? "Active" : "Inactive"}</TableCell>
            </TableRow>
          ))}
          {banners.length === 0 && (
            <TableRow>
              <TableCell colSpan={3} className="text-center text-muted-foreground">
                No banners yet
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Banner</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              placeholder="Title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
            <Input
              placeholder="Image URL"
              value={form.imageUrl}
              onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
            />
            <Select
              value={form.placement}
              onValueChange={(value) => setForm({ ...form, placement: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Placement" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ADMIN">ADMIN</SelectItem>
                <SelectItem value="RETAILER">RETAILER</SelectItem>
                <SelectItem value="CUSTOMER">CUSTOMER</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button onClick={createBanner}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
