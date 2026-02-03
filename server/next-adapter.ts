import { NextResponse } from "next/server"
import type { Request as ExpressRequest, Response as ExpressResponse } from "express"
import { connectDb } from "./config/db"
import { AppError } from "./middleware/error"

type NextHandler = (
  req: ExpressRequest,
  res: ExpressResponse,
  next: () => void
) => void | Promise<void>

type NextRequest = Request

function parseQuery(url: string): Record<string, string> {
  const u = new URL(url, "http://localhost")
  const out: Record<string, string> = {}
  u.searchParams.forEach((v, k) => {
    out[k] = v
  })
  return out
}

export function buildReqResFromNextRequest(
  request: NextRequest,
  params: Record<string, string> = {}
): { req: ExpressRequest; res: ExpressResponse; nextResponse: () => NextResponse } {
  let statusCode = 200
  let body: unknown = null

  const res = {
    status(code: number) {
      statusCode = code
      return res
    },
    json(data: unknown) {
      body = data
      return res
    },
    send() {
      return res
    },
  } as ExpressResponse

  const req = {
    body: null as unknown,
    query: {} as Record<string, string>,
    params,
    headers: Object.fromEntries(request.headers.entries()),
    get(name: string) {
      return request.headers.get(name) ?? undefined
    },
    user: undefined as ExpressRequest["user"],
  } as ExpressRequest

  const nextResponse = () => {
    return NextResponse.json(body, { status: statusCode })
  }

  return { req, res, nextResponse }
}

export async function parseBody(request: NextRequest): Promise<unknown> {
  try {
    const contentType = request.headers.get("content-type") || ""
    if (contentType.includes("application/json")) {
      return await request.json()
    }
    return null
  } catch {
    return null
  }
}

export async function runHandler(
  request: NextRequest,
  params: Record<string, string>,
  chain: (NextHandler | NextHandler[])[],
  bodyOverride?: unknown
): Promise<NextResponse> {
  const { req, res, nextResponse } = buildReqResFromNextRequest(request, params)
  req.body = bodyOverride ?? (await parseBody(request))
  req.query = parseQuery(request.url)

  const flat = chain.flat()
  let i = 0

  const next = async (): Promise<void> => {
    i++
    if (i < flat.length) {
      await flat[i](req, res, next)
    }
  }

  try {
    await connectDb()
    if (flat.length === 0) return nextResponse()
    await flat[0](req, res, next)
    return nextResponse()
  } catch (err) {
    const status = err instanceof AppError ? err.status : 500
    const message = err instanceof Error ? err.message : "Server error"
    return NextResponse.json({ success: false, error: message }, { status })
  }
}