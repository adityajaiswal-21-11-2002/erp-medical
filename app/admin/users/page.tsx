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
import { ModalConfirm } from "@/components/modal-confirm"

const createSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  mobile: z.string().min(6),
  role: z.enum(["ADMIN", "USER"]),
  accountType: z.enum(["ADMIN", "RETAILER", "DISTRIBUTOR", "CUSTOMER"]),
})

const updateSchema = z.object({
  name: z.string().min(1),
  mobile: z.string().min(6),
  status: z.enum(["ACTIVE", "BLOCKED"]),
  role: z.enum(["ADMIN", "USER"]),
  accountType: z.enum(["ADMIN", "RETAILER", "DISTRIBUTOR", "CUSTOMER"]),
})

const resetSchema = z.object({
  password: z.string().min(6),
})

type UserRow = {
  _id: string
  name: string
  email: string
  mobile: string
  role: "ADMIN" | "USER"
  accountType?: "ADMIN" | "RETAILER" | "DISTRIBUTOR" | "CUSTOMER"
  status: "ACTIVE" | "BLOCKED"
  createdAt: string
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRow[]>([])
  const [loading, setLoading] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [resetOpen, setResetOpen] = useState(false)
  const [blockOpen, setBlockOpen] = useState(false)
  const [selected, setSelected] = useState<UserRow | null>(null)

  const createForm = useForm<z.infer<typeof createSchema>>({
    resolver: zodResolver(createSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      mobile: "",
      role: "USER",
      accountType: "RETAILER",
    },
  })

  const updateForm = useForm<z.infer<typeof updateSchema>>({
    resolver: zodResolver(updateSchema),
  })

  const resetForm = useForm<z.infer<typeof resetSchema>>({
    resolver: zodResolver(resetSchema),
    defaultValues: { password: "" },
  })

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const res = await api.get("/api/users?limit=200")
      setUsers(res.data?.data?.items || [])
    } catch (error: any) {
      toast.error(error?.response?.data?.error || "Failed to load users")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers().catch(() => undefined)
  }, [])

  const openEdit = (user: UserRow) => {
    setSelected(user)
    updateForm.reset({
      name: user.name,
      mobile: user.mobile,
      role: user.role,
      status: user.status,
      accountType: user.accountType || "RETAILER",
    })
    setEditOpen(true)
  }

  const openReset = (user: UserRow) => {
    setSelected(user)
    resetForm.reset({ password: "" })
    setResetOpen(true)
  }

  const columns = useMemo(
    () => [
      { key: "name", label: "Name", sortable: true },
      { key: "email", label: "Email" },
      { key: "mobile", label: "Mobile" },
      {
        key: "role",
        label: "Role",
        filterable: true,
        filterOptions: ["ADMIN", "USER"],
      },
      {
        key: "accountType",
        label: "Account",
        filterable: true,
        filterOptions: ["ADMIN", "RETAILER", "DISTRIBUTOR", "CUSTOMER"],
      },
      {
        key: "status",
        label: "Status",
        filterable: true,
        filterOptions: ["ACTIVE", "BLOCKED"],
        render: (value: UserRow["status"]) => <StatusBadge status={value} />,
      },
      {
        key: "createdAt",
        label: "Created",
        sortable: true,
        render: (value: string) => new Date(value).toLocaleDateString(),
      },
    ],
    [],
  )

  return (
    <div className="space-y-6">
      <PageHeader
        title="Users"
        description="Manage admin and retailer accounts."
        actions={
          <Button onClick={() => setCreateOpen(true)} disabled={loading}>
            New User
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={users}
        searchableFields={["name", "email", "mobile"]}
        actions={[
          { label: "Edit", onClick: openEdit },
          { label: "Reset Password", onClick: openReset },
          {
            label: "Block",
            onClick: (row) => {
              setSelected(row)
              setBlockOpen(true)
            },
            variant: "destructive",
          },
        ]}
      />

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create User</DialogTitle>
          </DialogHeader>
          <form
            className="space-y-4"
            onSubmit={createForm.handleSubmit(async (values) => {
              try {
                await api.post("/api/users", values)
                toast.success("User created")
                setCreateOpen(false)
                createForm.reset()
                fetchUsers()
              } catch (error: any) {
                toast.error(error?.response?.data?.error || "Failed to create user")
              }
            })}
          >
            <Input placeholder="Full name" {...createForm.register("name")} />
            {createForm.formState.errors.name && (
              <p className="text-xs text-red-500">
                {createForm.formState.errors.name.message}
              </p>
            )}
            <Input placeholder="Email" type="email" {...createForm.register("email")} />
            {createForm.formState.errors.email && (
              <p className="text-xs text-red-500">
                {createForm.formState.errors.email.message}
              </p>
            )}
            <Input
              placeholder="Password"
              type="password"
              {...createForm.register("password")}
            />
            {createForm.formState.errors.password && (
              <p className="text-xs text-red-500">
                {createForm.formState.errors.password.message}
              </p>
            )}
            <Input placeholder="Mobile" {...createForm.register("mobile")} />
            {createForm.formState.errors.mobile && (
              <p className="text-xs text-red-500">
                {createForm.formState.errors.mobile.message}
              </p>
            )}
            <Select
              value={createForm.watch("role")}
              onValueChange={(value) => createForm.setValue("role", value as "ADMIN" | "USER")}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ADMIN">ADMIN</SelectItem>
                <SelectItem value="USER">USER</SelectItem>
              </SelectContent>
            </Select>
            <DialogFooter>
              <Button type="submit" disabled={createForm.formState.isSubmitting}>
                {createForm.formState.isSubmitting ? "Creating..." : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>
          <form
            className="space-y-4"
            onSubmit={updateForm.handleSubmit(async (values) => {
              if (!selected) return
              try {
                await api.patch(`/api/users/${selected._id}`, values)
                toast.success("User updated")
                setEditOpen(false)
                fetchUsers()
              } catch (error: any) {
                toast.error(error?.response?.data?.error || "Failed to update user")
              }
            })}
          >
            <Input placeholder="Full name" {...updateForm.register("name")} />
            <Input placeholder="Mobile" {...updateForm.register("mobile")} />
            <Select
              value={createForm.watch("accountType")}
              onValueChange={(value) =>
                createForm.setValue(
                  "accountType",
                  value as "ADMIN" | "RETAILER" | "DISTRIBUTOR" | "CUSTOMER",
                )
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Account type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ADMIN">ADMIN</SelectItem>
                <SelectItem value="RETAILER">RETAILER</SelectItem>
                <SelectItem value="DISTRIBUTOR">DISTRIBUTOR</SelectItem>
                <SelectItem value="CUSTOMER">CUSTOMER</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={updateForm.watch("role")}
              onValueChange={(value) => updateForm.setValue("role", value as "ADMIN" | "USER")}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ADMIN">ADMIN</SelectItem>
                <SelectItem value="USER">USER</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={updateForm.watch("accountType")}
              onValueChange={(value) =>
                updateForm.setValue(
                  "accountType",
                  value as "ADMIN" | "RETAILER" | "DISTRIBUTOR" | "CUSTOMER",
                )
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Account type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ADMIN">ADMIN</SelectItem>
                <SelectItem value="RETAILER">RETAILER</SelectItem>
                <SelectItem value="DISTRIBUTOR">DISTRIBUTOR</SelectItem>
                <SelectItem value="CUSTOMER">CUSTOMER</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={updateForm.watch("status")}
              onValueChange={(value) =>
                updateForm.setValue("status", value as "ACTIVE" | "BLOCKED")
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ACTIVE">ACTIVE</SelectItem>
                <SelectItem value="BLOCKED">BLOCKED</SelectItem>
              </SelectContent>
            </Select>
            <DialogFooter>
              <Button type="submit" disabled={updateForm.formState.isSubmitting}>
                {updateForm.formState.isSubmitting ? "Saving..." : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={resetOpen} onOpenChange={setResetOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
          </DialogHeader>
          <form
            className="space-y-4"
            onSubmit={resetForm.handleSubmit(async (values) => {
              if (!selected) return
              try {
                await api.patch(`/api/users/${selected._id}/password`, values)
                toast.success("Password reset")
                setResetOpen(false)
              } catch (error: any) {
                toast.error(error?.response?.data?.error || "Failed to reset password")
              }
            })}
          >
            <Input
              placeholder="New password"
              type="password"
              {...resetForm.register("password")}
            />
            <DialogFooter>
              <Button type="submit" disabled={resetForm.formState.isSubmitting}>
                {resetForm.formState.isSubmitting ? "Updating..." : "Update Password"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ModalConfirm
        open={blockOpen}
        onOpenChange={setBlockOpen}
        title="Block user?"
        description="This user will be blocked from logging in."
        confirmLabel="Block"
        variant="destructive"
        onConfirm={async () => {
          if (!selected) return
          try {
            await api.delete(`/api/users/${selected._id}`)
            toast.success("User blocked")
            setBlockOpen(false)
            fetchUsers()
          } catch (error: any) {
            toast.error(error?.response?.data?.error || "Failed to block user")
          }
        }}
      />
    </div>
  )
}
