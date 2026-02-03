'use client'

import { Badge } from '@/components/ui/badge'
import { CheckCircle2, AlertCircle, Clock, XCircle, PackageCheck, PackageOpen, Truck, Receipt, Ban } from 'lucide-react'

export type StatusType =
  | 'pending'
  | 'placed'
  | 'confirmed'
  | 'approved'
  | 'rejected'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'delivered'
  | 'pending-payment'
  | 'received'
  | 'allocated'
  | 'packed'
  | 'shipped'
  | 'paid'
  | 'unpaid'
  | 'overdue'
  | 'returned'
  | 'cancelled'
  | 'invoiced'
  | 'PLACED'
  | 'CANCELLED'
  | 'DELIVERED'
  | 'ACTIVE'
  | 'INACTIVE'
  | 'BLOCKED'
  | 'IN_STOCK'
  | 'LOW'
  | 'OUT'
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'CONSOLIDATED'
  | 'ALLOCATED'
  | 'SHIPPED'
  | 'OPEN'
  | 'IN_PROGRESS'
  | 'RESOLVED'
  | 'PENDING'
  | 'SUCCESS'
  | 'FAILED'
  | 'PAID'

const statusConfig: Record<StatusType, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: any }> = {
  pending: { label: 'Pending', variant: 'secondary', icon: Clock },
  placed: { label: 'Placed', variant: 'secondary', icon: Clock },
  confirmed: { label: 'Confirmed', variant: 'default', icon: CheckCircle2 },
  approved: { label: 'Approved', variant: 'default', icon: CheckCircle2 },
  rejected: { label: 'Rejected', variant: 'destructive', icon: XCircle },
  processing: { label: 'Processing', variant: 'secondary', icon: Clock },
  completed: { label: 'Completed', variant: 'default', icon: CheckCircle2 },
  failed: { label: 'Failed', variant: 'destructive', icon: XCircle },
  delivered: { label: 'Delivered', variant: 'default', icon: CheckCircle2 },
  'pending-payment': { label: 'Pending Payment', variant: 'secondary', icon: AlertCircle },
  received: { label: 'Received', variant: 'secondary', icon: PackageOpen },
  allocated: { label: 'Allocated', variant: 'outline', icon: PackageCheck },
  packed: { label: 'Packed', variant: 'outline', icon: PackageCheck },
  shipped: { label: 'Shipped', variant: 'default', icon: Truck },
  paid: { label: 'Paid', variant: 'default', icon: Receipt },
  unpaid: { label: 'Unpaid', variant: 'secondary', icon: AlertCircle },
  overdue: { label: 'Overdue', variant: 'destructive', icon: AlertCircle },
  returned: { label: 'Returned', variant: 'secondary', icon: Ban },
  cancelled: { label: 'Cancelled', variant: 'destructive', icon: XCircle },
  invoiced: { label: 'Invoiced', variant: 'outline', icon: Receipt },
  PLACED: { label: 'Placed', variant: 'secondary', icon: Clock },
  CANCELLED: { label: 'Cancelled', variant: 'destructive', icon: XCircle },
  DELIVERED: { label: 'Delivered', variant: 'default', icon: CheckCircle2 },
  ACTIVE: { label: 'Active', variant: 'default', icon: CheckCircle2 },
  INACTIVE: { label: 'Inactive', variant: 'secondary', icon: AlertCircle },
  BLOCKED: { label: 'Blocked', variant: 'destructive', icon: XCircle },
  IN_STOCK: { label: 'In Stock', variant: 'default', icon: CheckCircle2 },
  LOW: { label: 'Low', variant: 'secondary', icon: AlertCircle },
  OUT: { label: 'Out', variant: 'destructive', icon: XCircle },
  PENDING_APPROVAL: { label: 'Pending Approval', variant: 'secondary', icon: Clock },
  APPROVED: { label: 'Approved', variant: 'default', icon: CheckCircle2 },
  CONSOLIDATED: { label: 'Consolidated', variant: 'outline', icon: PackageCheck },
  ALLOCATED: { label: 'Allocated', variant: 'outline', icon: PackageCheck },
  SHIPPED: { label: 'Shipped', variant: 'default', icon: Truck },
  OPEN: { label: 'Open', variant: 'secondary', icon: Clock },
  IN_PROGRESS: { label: 'In Progress', variant: 'secondary', icon: AlertCircle },
  RESOLVED: { label: 'Resolved', variant: 'default', icon: CheckCircle2 },
  PENDING: { label: 'Pending', variant: 'secondary', icon: Clock },
  SUCCESS: { label: 'Success', variant: 'default', icon: CheckCircle2 },
  FAILED: { label: 'Failed', variant: 'destructive', icon: XCircle },
  PAID: { label: 'Paid', variant: 'default', icon: Receipt },
}

interface StatusBadgeProps {
  status: StatusType
  showIcon?: boolean
}

export function StatusBadge({ status, showIcon = true }: StatusBadgeProps) {
  const config = statusConfig[status] ?? {
    label: String(status),
    variant: 'outline' as const,
    icon: Receipt,
  }
  const Icon = config.icon

  return (
    <Badge variant={config.variant} className="flex items-center gap-1">
      {showIcon && <Icon className="w-3 h-3" />}
      {config.label}
    </Badge>
  )
}
