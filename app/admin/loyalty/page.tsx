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

type Reward = {
  _id: string
  name: string
  type: "SCRATCH_CARD" | "MAGIC_STORE"
  pointsCost: number
  active: boolean
}

export default function LoyaltyAdminPage() {
  const [rewards, setRewards] = useState<Reward[]>([])
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({
    name: "",
    type: "SCRATCH_CARD",
    pointsCost: 0,
  })

  const load = async () => {
    try {
      const res = await api.get("/api/rewards")
      setRewards(res.data?.data || [])
    } catch (error: any) {
      toast.error(error?.response?.data?.error || "Failed to load rewards")
    }
  }

  const createReward = async () => {
    try {
      await api.post("/api/rewards", form)
      toast.success("Reward created")
      setOpen(false)
      setForm({ name: "", type: "SCRATCH_CARD", pointsCost: 0 })
      load()
    } catch (error: any) {
      toast.error(error?.response?.data?.error || "Failed to create reward")
    }
  }

  useEffect(() => {
    load().catch(() => undefined)
  }, [])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Schemes & Loyalty"
        description="Manage loyalty rewards and gamification catalog."
        actions={<Button onClick={() => setOpen(true)}>New Reward</Button>}
      />
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Points Cost</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rewards.map((reward) => (
            <TableRow key={reward._id}>
              <TableCell>{reward.name}</TableCell>
              <TableCell>{reward.type}</TableCell>
              <TableCell>{reward.pointsCost}</TableCell>
              <TableCell>{reward.active ? "Active" : "Inactive"}</TableCell>
            </TableRow>
          ))}
          {rewards.length === 0 && (
            <TableRow>
              <TableCell colSpan={4} className="text-center text-muted-foreground">
                No rewards yet
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Reward</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              placeholder="Reward name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <Select value={form.type} onValueChange={(value) => setForm({ ...form, type: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SCRATCH_CARD">SCRATCH_CARD</SelectItem>
                <SelectItem value="MAGIC_STORE">MAGIC_STORE</SelectItem>
              </SelectContent>
            </Select>
            <Input
              type="number"
              placeholder="Points cost"
              value={form.pointsCost}
              onChange={(e) => setForm({ ...form, pointsCost: Number(e.target.value) })}
            />
          </div>
          <DialogFooter>
            <Button onClick={createReward}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
