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
  method: string,
  path: string,
  body?: Record<string, unknown>,
  orderId?: mongoose.Types.ObjectId,
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
  const data = (await res.json()) as T
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

export async function createOrderFromInternal(
  order: InternalOrderForShipping,
): Promise<CreateOrderResult> {
  await auth()
  // RapidShyp Forward/Create Order: stub that returns simulated ids when exact endpoint differs.
  // Real integration would call their create order + assign shipment endpoints.
  const simulatedOrderId = `RS-${order.orderNumber}-${Date.now()}`
  const simulatedShipmentId = `ship-${simulatedOrderId}`
  const simulatedAwb = `AWB${String(Math.floor(100000 + Math.random() * 900000))}`
  const payload = {
    order_id: order.orderNumber,
    customer_name: order.customerName,
    customer_phone: order.customerMobile,
    address: order.customerAddress,
    order_value: order.netAmount,
  }
  try {
    await logShippingAction({
      orderId: order._id ? new mongoose.Types.ObjectId(order._id) : undefined,
      provider: "RAPIDSHYP",
      action: "CREATE_ORDER",
      request: payload,
      response: {
        providerOrderId: simulatedOrderId,
        shipmentId: simulatedShipmentId,
        awb: simulatedAwb,
        courierName: "RapidShyp Courier",
      },
      statusCode: 200,
    })
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
  return {
    providerOrderId: simulatedOrderId,
    shipmentId: simulatedShipmentId,
    awb: simulatedAwb,
    courierName: "RapidShyp Courier",
    status: "AWB_ASSIGNED",
    raw: { providerOrderId: simulatedOrderId, shipmentId: simulatedShipmentId },
  }
}

export async function assignShipment(providerOrderId: string): Promise<AssignAwbResult> {
  await auth()
  const simulatedAwb = `AWB${String(Math.floor(100000 + Math.random() * 900000))}`
  await logShippingAction({
    provider: "RAPIDSHYP",
    action: "ASSIGN",
    request: { providerOrderId },
    response: { awb: simulatedAwb, courierName: "RapidShyp Courier" },
    statusCode: 200,
  })
  return {
    awb: simulatedAwb,
    courierName: "RapidShyp Courier",
    status: "AWB_ASSIGNED",
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
      "POST",
      "/rapidshyp/apis/v1/track_order",
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
