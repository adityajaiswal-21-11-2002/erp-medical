import { runHandler } from "@/server/next-adapter"
import { shiprocketWebhook, rapidshypWebhook } from "@/server/controllers/shipmentController"
import { razorpayWebhook } from "@/server/controllers/razorpayController"

export const dynamic = "force-dynamic"

type Params = { path?: string[] }

export async function POST(request: Request, { params }: { params: Promise<Params> }) {
  const { path = [] } = await params
  if (path[0] === "shiprocket" && path.length === 1) {
    return runHandler(request, {}, [shiprocketWebhook], undefined)
  }
  if (path[0] === "rapidshyp" && path.length === 1) {
    return runHandler(request, {}, [rapidshypWebhook], undefined)
  }
  if (path[0] === "razorpay" && path.length === 1) {
    const rawBody = await request.text()
    const body = rawBody ? JSON.parse(rawBody) : {}
    return runHandler(request, {}, [razorpayWebhook], body, rawBody)
  }
  return new Response(JSON.stringify({ success: false, error: "Not found" }), {
    status: 404,
    headers: { "Content-Type": "application/json" },
  })
}
