import { runHandler } from "@/server/next-adapter"
import { listSyncLogs, retrySync } from "@/server/controllers/syncController"
import { requireAuth } from "@/server/middleware/auth"
import { requireRole } from "@/server/middleware/role"

const withAuth = [requireAuth, requireRole("ADMIN")]

export const dynamic = "force-dynamic"

type Params = { path?: string[] }

export async function GET(request: Request, { params }: { params: Promise<Params> }) {
  const { path = [] } = await params
  if (path[0] !== "logs") return notFound()
  return runHandler(request, {}, [...withAuth, listSyncLogs], undefined)
}

export async function POST(request: Request, { params }: { params: Promise<Params> }) {
  const { path = [] } = await params
  if (path[0] !== "retry" || !path[1]) return notFound()
  return runHandler(request, { id: path[1] }, [...withAuth, retrySync], undefined)
}

function notFound() {
  return new Response(JSON.stringify({ success: false, error: "Not found" }), {
    status: 404,
    headers: { "Content-Type": "application/json" },
  })
}
