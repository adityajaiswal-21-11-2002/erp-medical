import { env } from "../../config/env"
import {
  type InternalOrderForShipping,
  type CreateOrderResult,
  type AssignAwbResult,
  type TrackResult,
  mapProviderStatusToInternal,
} from "./types"
import { logShippingAction } from "./ShippingLog"
import mongoose from "mongoose"

const BASE = (env.rapidshypBaseUrl || "https://api.rapidshyp.com").replace(/\/$/, "")
const API_KEY = env.rapidshypApiKey || ""

async function request<T>(
  path: string,
  method: string,
  body?: Record<string, unknown>,
): Promise<{ data: T; status: number }> {
  const url = path.startsWith("http") ? path : `${BASE}${path}`
  const res = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      "rapidshyp-token": API_KEY,
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  const contentType = res.headers.get("content-type") || ""
  const data = (contentType.includes("application/json")
    ? await res.json()
    : { message: await res.text() }) as T
  return { data, status: res.status }
}

export async function auth(): Promise<void> {
  if (!API_KEY) {
    await logShippingAction({
      provider: "RAPIDSHYP",
      action: "AUTH",
      error: "RAPIDSHYP_API_KEY not configured",
    })
    throw new Error("RAPIDSHYP_API_KEY not configured")
  }
  await logShippingAction({
    provider: "RAPIDSHYP",
    action: "AUTH",
    request: { hasKey: !!API_KEY },
    response: { ok: true },
    statusCode: 200,
  })
}

function normalizeIndianPhone(s: string): string {
  let digits = String(s || "").replace(/\D/g, "")
  if (digits.length === 12 && digits.startsWith("91")) digits = digits.slice(2)
  if (digits.length === 11 && digits.startsWith("0")) digits = digits.slice(1)
  return digits || String(s || "")
}

function normalizePincode(address: string): string {
  const m = String(address || "").match(/\b(\d{6})\b/)
  return m?.[1] || "110001"
}

function deriveCityState(address: string): { city: string; state: string } {
  const parts = String(address || "")
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean)
  const city = parts.length >= 2 ? parts[parts.length - 2] : "City"
  const state = parts.length >= 1 ? parts[parts.length - 1].replace(/\b\d{6}\b/g, "").trim() || "State" : "State"
  return { city, state }
}

function firstString(...values: unknown[]): string | undefined {
  for (const v of values) {
    if (typeof v === "string" && v.trim()) return v.trim()
    if (typeof v === "number") return String(v)
  }
  return undefined
}

function toRecord(v: unknown): Record<string, unknown> {
  if (v && typeof v === "object" && !Array.isArray(v)) return v as Record<string, unknown>
  return {}
}

function extractShipmentMeta(raw: Record<string, unknown>): {
  shipmentId?: string
  awb?: string
  courierName?: string
  providerStatus?: string
} {
  const response = (Array.isArray(raw.response) ? raw.response[0] : raw.response) as unknown
  const row = toRecord(response)
  const shipments = Array.isArray(row.shipments) ? row.shipments : []
  const firstShipment = toRecord(shipments[0])
  const shipmentId = firstString(
    firstShipment.shipment_id,
    firstShipment.id,
    row.shipment_id,
    row.id,
  )
  const awb = firstString(
    firstShipment.awb_number,
    firstShipment.awb,
    row.awb_number,
    row.awb,
  )
  const courierName = firstString(
    firstShipment.courier_name,
    firstShipment.courier,
    row.courier_name,
    row.courier,
  )
  const providerStatus = firstString(
    firstShipment.status,
    row.shipment_status,
    row.status,
  )
  return { shipmentId, awb, courierName, providerStatus }
}

async function fetchOrderInfo(
  identifier: string,
): Promise<{ data: Record<string, unknown>; status: number }> {
  let res = await request<Record<string, unknown>>(
    `/rapidshyp/apis/v1/get_orders_info?seller_order_id=${encodeURIComponent(identifier)}`,
    "GET",
  )
  if (res.status >= 400) {
    res = await request<Record<string, unknown>>(
      `/rapidshyp/apis/v1/get_orders_info?order_id=${encodeURIComponent(identifier)}`,
      "GET",
    )
  }
  return res
}

export async function createOrderFromInternal(
  order: InternalOrderForShipping,
): Promise<CreateOrderResult> {
  await auth()
  const { city, state } = deriveCityState(order.customerAddress)
  const totalQty = order.items.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0) || 1
  const itemName = order.items
    .map((item) => (typeof item.product === "object" && item.product?.name ? item.product.name : "Item"))
    .join(", ")
    .slice(0, 120) || "Item"
  const orderItems = order.items.map((item, idx) => {
    const qty = Number(item.quantity) || 1
    const amount = Number(item.amount) || 0
    const itemValue = qty > 0 ? amount / qty : amount
    const name = typeof item.product === "object" && item.product?.name ? item.product.name : `Item ${idx + 1}`
    return {
      itemName: name,
      sku: `item-${idx + 1}`,
      quantity: qty,
      itemValue: Number(itemValue.toFixed(2)),
    }
  })
  const payload = {
    seller_order_id: order.orderNumber,
    customer_name: order.customerName || "Customer",
    customer_address: order.customerAddress || "Address",
    customer_city: city,
    customer_state: state,
    customer_country: "India",
    customer_pincode: normalizePincode(order.customerAddress),
    customer_phone: normalizeIndianPhone(order.customerMobile),
    customer_email: "order@example.com",
    item_name: itemName,
    package_length: 10,
    package_breadth: 10,
    package_height: 5,
    package_weight: 1,
    package_volumetric_weight: 1,
    package_total_value: Number(order.netAmount) || 0,
    payment_method: "prepaid",
    total_order_qty: totalQty,
    // RapidShyp create_order expects this exact field name.
    orderItems,
    // Keep optional alias for compatibility with older payload handlers.
    order_items: orderItems,
  }
  try {
    const { data, status } = await request<Record<string, unknown>>(
      "/rapidshyp/apis/v1/create_order",
      "POST",
      payload,
    )
    const createResponse = toRecord((data as Record<string, unknown>).response)
    const providerOrderId = firstString(
      createResponse.order_id,
      createResponse.seller_order_id,
      (data as Record<string, unknown>).order_id,
      payload.seller_order_id,
    ) || payload.seller_order_id

    const orderInfo = await fetchOrderInfo(providerOrderId)
    const meta = extractShipmentMeta(orderInfo.data)
    const internalStatus = mapProviderStatusToInternal(meta.providerStatus || "CREATED")

    await logShippingAction({
      orderId: order._id ? new mongoose.Types.ObjectId(order._id) : undefined,
      provider: "RAPIDSHYP",
      action: "CREATE_ORDER",
      request: payload,
      response: {
        create: data,
        orderInfo: orderInfo.data,
        parsed: {
          providerOrderId,
          shipmentId: meta.shipmentId,
          awb: meta.awb,
          courierName: meta.courierName,
          status: internalStatus,
        },
      },
      statusCode: status,
    })
    if (status >= 400) {
      throw new Error(JSON.stringify(data))
    }
    return {
      providerOrderId,
      shipmentId: meta.shipmentId,
      awb: meta.awb,
      courierName: meta.courierName,
      status: meta.awb ? "AWB_ASSIGNED" : internalStatus,
      raw: { create: data, orderInfo: orderInfo.data },
    }
  } catch (e) {
    await logShippingAction({
      orderId: order._id ? new mongoose.Types.ObjectId(order._id) : undefined,
      provider: "RAPIDSHYP",
      action: "CREATE_ORDER",
      request: payload,
      error: e instanceof Error ? e.message : String(e),
    })
    throw e
  }
}

export async function assignShipment(providerOrderId: string): Promise<AssignAwbResult> {
  await auth()
  let shipmentId = providerOrderId
  const prefetch = await fetchOrderInfo(providerOrderId)
  const preMeta = extractShipmentMeta(prefetch.data)
  if (preMeta.awb) {
    return {
      shipmentId: preMeta.shipmentId,
      awb: preMeta.awb,
      courierName: preMeta.courierName || "RapidShyp",
      status: "AWB_ASSIGNED",
      raw: { orderInfo: prefetch.data },
    }
  }
  if (preMeta.shipmentId) shipmentId = preMeta.shipmentId
  const body = { shipment_id: shipmentId }
  const { data, status } = await request<Record<string, unknown>>(
    "/rapidshyp/apis/v1/assign_awb",
    "POST",
    body,
  )
  const meta = extractShipmentMeta(data)
  await logShippingAction({
    provider: "RAPIDSHYP",
    action: "ASSIGN",
    request: { providerOrderId, shipmentId, body },
    response: data,
    statusCode: status,
  })
  if (status >= 400 || !meta.awb) {
    throw new Error("AWB assign failed: " + JSON.stringify(data))
  }
  return {
    shipmentId: meta.shipmentId || shipmentId,
    awb: meta.awb,
    courierName: meta.courierName || "RapidShyp",
    status: "AWB_ASSIGNED",
    raw: data,
  }
}

export async function generateAwb(shipmentId: string): Promise<AssignAwbResult> {
  return assignShipment(shipmentId)
}

export async function track(awbOrShipmentId: string): Promise<TrackResult> {
  await auth()
  const body: { awb?: string; seller_order_id?: string } = /^AWB\d+$/i.test(awbOrShipmentId)
    ? { awb: awbOrShipmentId }
    : { seller_order_id: awbOrShipmentId }
  try {
    const { data, status } = await request<{
      status?: string
      tracking?: Record<string, unknown>
      scan?: Array<{ status?: string }>
    }>("/rapidshyp/apis/v1/track_order", "POST", body)
    await logShippingAction({
      provider: "RAPIDSHYP",
      action: "TRACK",
      request: body,
      response: data as unknown as Record<string, unknown>,
      statusCode: status,
    })
    const providerStatus = (data as { status?: string }).status
      || (data as { scan?: Array<{ status?: string }> }).scan?.[0]?.status
      || ""
    const internalStatus = mapProviderStatusToInternal(providerStatus)
    return {
      status: internalStatus,
      tracking: (data as Record<string, unknown>) || {},
      raw: data as unknown as Record<string, unknown>,
    }
  } catch (e) {
    await logShippingAction({
      provider: "RAPIDSHYP",
      action: "TRACK",
      request: body,
      error: e instanceof Error ? e.message : String(e),
    })
    throw e
  }
}

/** Test API connectivity (diagnostic). Calls track endpoint with dummy AWB to verify API key. */
export async function testApiConnectivity(): Promise<{
  ok: boolean
  status: number
  message?: string
}> {
  await auth()
  try {
    const { data, status } = await request<{ message?: string; error?: string }>(
      "/rapidshyp/apis/v1/track_order",
      "POST",
      { awb: "AWB000000" }
    )
    const authOk = status !== 401 && status !== 403
    const msg = (data as { message?: string })?.message || (data as { error?: string })?.error
    return { ok: authOk, status, message: msg }
  } catch (e) {
    return {
      ok: false,
      status: 401,
      message: e instanceof Error ? e.message : String(e),
    }
  }
}

export async function cancel(
  _awbOrShipmentId: string,
): Promise<{ success: boolean; raw?: Record<string, unknown> }> {
  await auth()
  await logShippingAction({
    provider: "RAPIDSHYP",
    action: "CANCEL",
    request: { awbOrShipmentId: _awbOrShipmentId },
    response: { success: true },
    statusCode: 200,
  })
  return { success: true }
}
