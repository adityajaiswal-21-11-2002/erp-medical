import { NextResponse } from "next/server"
import { connectDb, getDbStatus } from "@/server/config/db"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    await connectDb()
    const db = getDbStatus()
    return NextResponse.json({
      success: true,
      data: { status: "ok", db },
      message: "Healthy",
    })
  } catch {
    return NextResponse.json(
      { success: true, data: { status: "ok", db: "disconnected" }, message: "Healthy" },
      { status: 200 }
    )
  }
}
