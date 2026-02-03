import mongoose from "mongoose"

const MONGODB_URI = process.env.MONGODB_URI || ""

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI is required")
}

// Cache connection for serverless (Next.js) to avoid creating new connection per request
declare global {
  // eslint-disable-next-line no-var
  var mongoose: { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null }
}

const cached = global.mongoose ?? { conn: null, promise: null }
if (process.env.NODE_ENV !== "production") global.mongoose = cached

export async function connectDb(): Promise<typeof mongoose> {
  if (cached.conn) return cached.conn
  if (!cached.promise) {
    mongoose.set("strictQuery", true)
    cached.promise = mongoose.connect(MONGODB_URI)
  }
  cached.conn = await cached.promise
  return cached.conn
}

export function getDbStatus(): string {
  const state = mongoose.connection.readyState
  if (state === 1) return "connected"
  if (state === 2) return "connecting"
  if (state === 3) return "disconnecting"
  return "disconnected"
}
