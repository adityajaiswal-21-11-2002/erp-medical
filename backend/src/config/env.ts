import dotenv from "dotenv"
import fs from "fs"
import path from "path"

const localEnv = path.resolve(process.cwd(), ".env")
const rootEnv = path.resolve(process.cwd(), "..", ".env")

if (fs.existsSync(localEnv)) {
  dotenv.config({ path: localEnv })
} else if (fs.existsSync(rootEnv)) {
  dotenv.config({ path: rootEnv })
} else {
  dotenv.config()
}

export const env = {
  mongoUri: process.env.MONGODB_URI || "",
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET || "",
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || "",
  clientOrigin: process.env.CLIENT_ORIGIN || "http://localhost:3000",
  port: Number(process.env.PORT || 5000),
}

if (!env.mongoUri) {
  throw new Error("MONGODB_URI is required")
}
if (!env.jwtAccessSecret) {
  throw new Error("JWT_ACCESS_SECRET (or JWT_SECRET) is required")
}
