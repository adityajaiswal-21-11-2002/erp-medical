export type ShippingProviderName = "SHIPROCKET" | "RAPIDSHYP"

export type ShipmentStatus =
  | "CREATED"
  | "AWB_ASSIGNED"
  | "READY_TO_PICK"
  | "PICKED"
  | "IN_TRANSIT"
  | "DELIVERED"
  | "RTO"
  | "CANCELLED"
  | "FAILED"

export interface InternalOrderForShipping {
  _id: string
  orderNumber: string
  customerName: string
  customerMobile: string
  customerAddress: string
  items: Array<{
    product: { name?: string; netMrp?: number } | string
    quantity: number
    amount?: number
  }>
  netAmount: number
}

export interface CreateOrderResult {
  providerOrderId: string
  shipmentId?: string
  awb?: string
  courierName?: string
  status: ShipmentStatus
  raw?: Record<string, unknown>
}

export interface AssignAwbResult {
  shipmentId?: string
  awb: string
  courierName: string
  status: ShipmentStatus
  raw?: Record<string, unknown>
}

export interface TrackResult {
  status: ShipmentStatus
  tracking: Record<string, unknown>
  raw?: Record<string, unknown>
}

export interface ShippingProvider {
  auth(): Promise<void>
  createOrderFromInternal(order: InternalOrderForShipping): Promise<CreateOrderResult>
  assignShipment(providerOrderId: string): Promise<AssignAwbResult>
  generateAwb(shipmentId: string): Promise<AssignAwbResult>
  track(awbOrShipmentId: string): Promise<TrackResult>
  cancel(awbOrShipmentId: string): Promise<{ success: boolean; raw?: Record<string, unknown> }>
}

export function mapProviderStatusToInternal(providerStatus: string): ShipmentStatus {
  const s = String(providerStatus || "").toUpperCase().replace(/\s+/g, "_")
  const map: Record<string, ShipmentStatus> = {
    CREATED: "CREATED",
    AWB_ASSIGNED: "AWB_ASSIGNED",
    READY_TO_PICK: "READY_TO_PICK",
    PICKED: "PICKED",
    IN_TRANSIT: "IN_TRANSIT",
    DELIVERED: "DELIVERED",
    RTO: "RTO",
    CANCELLED: "CANCELLED",
    FAILED: "FAILED",
    SHIPPED: "IN_TRANSIT",
    DISPATCHED: "IN_TRANSIT",
    OUT_FOR_DELIVERY: "IN_TRANSIT",
  }
  return map[s] || "CREATED"
}
