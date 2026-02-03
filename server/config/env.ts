// Next.js loads .env automatically; no dotenv needed
export const env = {
  mongoUri: process.env.MONGODB_URI || "",
  jwtAccessSecret:
    process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET || "",
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || "",
  clientOrigin: process.env.CLIENT_ORIGIN || "http://localhost:3000",
  port: Number(process.env.PORT || 5000),
}

if (typeof window === "undefined" && !env.mongoUri) {
  throw new Error("MONGODB_URI is required")
}
if (typeof window === "undefined" && !env.jwtAccessSecret) {
  throw new Error("JWT_ACCESS_SECRET (or JWT_SECRET) is required")
}
