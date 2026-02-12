import { env } from "../../config/env"
import {
  type InternalOrderForShipping,
  type CreateOrderResult,
  type AssignAwbResult,
  type TrackResult,
  type ShipmentStatus,
  mapProviderStatusToInternal,
} from "./types"
import { logShippingAction } from "./ShippingLog"
import mongoose from "mongoose"

const BASE = (env.shiprocketBaseUrl || "https://apiv2.shiprocket.in").replace(/\/$/, "")

let cachedToken: string | null = null
let tokenExpiry = 0
const TOKEN_BUFFER_MS = 60 * 1000

export async function auth(): Promise<void> {
  if (cachedToken && Date.now() < tokenExpiry - TOKEN_BUFFER_MS) {
    return
  }
  const url = `${BASE}/v1/external/auth/login`
  const body = { email: env.shiprocketEmail, password: env.shiprocketPassword }
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
    const data = (await res.json()) as { token?: string }
    await logShippingAction({
      provider: "SHIPROCKET",
      action: "AUTH",
      request: body,
      response: { token: data.token ? "[REDACTED]" : undefined, ...data },
      statusCode: res.status,
    })
    if (!res.ok || !data.token) {
      throw new Error(data as unknown as string || `Shiprocket auth failed: ${res.status}`)
    }
    cachedToken = data.token
    tokenExpiry = Date.now() + 240 * 60 * 60 * 1000 // 240 hours
  } catch (e) {
    await logShippingAction({
      provider: "SHIPROCKET",
      action: "AUTH",
      request: body,
      error: e instanceof Error ? e.message : String(e),
    })
    throw e
  }
}

async function request<T>(
  path: string,
  method: string,
  body?: Record<string, unknown>,
): Promise<{ data: T; status: number }> {
  await auth()
  const url = path.startsWith("http") ? path : `${BASE}${path}`
  const res = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${cachedToken!}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  const data = (await res.json()) as T
  if (res.status === 401) {
    cachedToken = null
    tokenExpiry = 0
  }
  return { data, status: res.status }
}

export async function createOrderFromInternal(
  order: InternalOrderForShipping,
): Promise<CreateOrderResult> {
  const orderPayload = {
    order_id: order.orderNumber,
    order_date: new Date().toISOString().split("T")[0],
    billing_customer_name: order.customerName,
    billing_last_name: "",
    billing_address: order.customerAddress,
    billing_address_2: "",
    billing_city: "City",
    billing_pincode: "110001",
    billing_state: "State",
    billing_country: "India",
    billing_email: "order@example.com",
    billing_phone: order.customerMobile,
    shipping_is_billing: true,
    order_items: order.items.map((item, idx) => ({
      name: typeof item.product === "object" && item.product?.name ? item.product.name : "Item",
      sku: `item-${idx + 1}`,
      units: item.quantity,
      selling_price: (item.amount || order.netAmount / order.items.length) / item.quantity,
    })),
    payment_method: "Prepaid",
    sub_total: order.netAmount,
    length: 10,
    breadth: 10,
    height: 5,
    weight: 1,
  }
  try {
    const { data, status } = await request<{
      order_id?: number
      status?: number
      status_code?: number
      onboarding_completed_at?: string
      awb_assignments?: unknown
      shipment_id?: number
    }>("/v1/external/orders/create/adhoc", "POST", orderPayload as unknown as Record<string, unknown>)

    await logShippingAction({
      orderId: order._id ? new mongoose.Types.ObjectId(order._id) : undefined,
      provider: "SHIPROCKET",
      action: "CREATE_ORDER",
      request: orderPayload as unknown as Record<string, unknown>,
      response: data as unknown as Record<string, unknown>,
      statusCode: status,
    })

    const orderId = (data as { order_id?: number }).order_id
    const shipmentId = (data as { shipment_id?: number }).shipment_id
    if (!orderId && status !== 200) {
      throw new Error(JSON.stringify(data))
    }
    return {
      providerOrderId: String(orderId ?? (data as { order_id?: number }).order_id ?? ""),
      shipmentId: shipmentId != null ? String(shipmentId) : undefined,
      status: "CREATED",
      raw: data as unknown as Record<string, unknown>,
    }
  } catch (e) {
    await logShippingAction({
      orderId: order._id ? new mongoose.Types.ObjectId(order._id) : undefined,
      provider: "SHIPROCKET",
      action: "CREATE_ORDER",
      request: orderPayload as unknown as Record<string, unknown>,
      error: e instanceof Error ? e.message : String(e),
    })
    throw e
  }
}

export async function assignShipment(providerOrderId: string): Promise<AssignAwbResult> {
  const body = { ids: [providerOrderId] }
  const { data, status } = await request<{
    courier_assignments?: Array<{ awb?: string; courier_name?: string }>
    status?: number
  }>("/v1/external/courier/assign/awb", "POST", body as Record<string, unknown>)
  await logShippingAction({
    provider: "SHIPROCKET",
    action: "ASSIGN",
    request: body,
    response: data as unknown as Record<string, unknown>,
    statusCode: status,
  })
  const assignments = (data as { courier_assignments?: Array<{ awb?: string; courier_name?: string }> })
    .courier_assignments
  const first = assignments?.[0]
  if (!first?.awb) {
    throw new Error("AWB assign failed: " + JSON.stringify(data))
  }
  return {
    awb: first.awb,
    courierName: first.courier_name || "Courier",
    status: "AWB_ASSIGNED",
    raw: data as unknown as Record<string, unknown>,
  }
}

export async function generateAwb(shipmentId: string): Promise<AssignAwbResult> {
  return assignShipment(shipmentId)
}

export async function track(awbOrShipmentId: string): Promise<TrackResult> {
  const path = `/v1/external/courier/track/awb/${encodeURIComponent(awbOrShipmentId)}`
  const { data, status } = await request<{
    tracking_data?: { ship_status?: string; ship_track?: Array<{ status?: string }> }
  }>(path, "GET", undefined)
  await logShippingAction({
    provider: "SHIPROCKET",
    action: "TRACK",
    request: { awb: awbOrShipmentId },
    response: data as unknown as Record<string, unknown>,
    statusCode: status,
  })
  const trackingData = (data as { tracking_data?: { ship_status?: string } }).tracking_data
  const shipStatus = trackingData?.ship_status || ""
  const status = mapProviderStatusToInternal(shipStatus)
  return {
    status,
    tracking: (data as Record<string, unknown>) || {},
    raw: data as unknown as Record<string, unknown>,
  }
}

export async function cancel(
  awbOrShipmentId: string,
): Promise<{ success: boolean; raw?: Record<string, unknown> }> {
  const body = { ids: [awbOrShipmentId] }
  try {
    const { data, status } = await request<{ status?: number }>(
      "/v1/external/orders/cancel",
      "POST",
      body as Record<string, unknown>,
    )
    await logShippingAction({
      provider: "SHIPROCKET",
      action: "CANCEL",
      request: body,
      response: data as unknown as Record<string, unknown>,
      statusCode: status,
    })
    return { success: status === 200, raw: data as unknown as Record<string, unknown> }
  } catch (e) {
    await logShippingAction({
      provider: "SHIPROCKET",
      action: "CANCEL",
      request: body,
      error: e instanceof Error ? e.message : String(e),
    })
    return { success: false }
  }
}
