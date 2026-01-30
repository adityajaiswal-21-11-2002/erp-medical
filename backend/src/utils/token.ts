import jwt from "jsonwebtoken"
import { env } from "../config/env"

export type JwtPayload = {
  userId: string
  role: "ADMIN" | "USER"
}

export function signAccessToken(payload: JwtPayload) {
  return jwt.sign(payload, env.jwtAccessSecret, { expiresIn: "1d" })
}

export function verifyAccessToken(token: string) {
  return jwt.verify(token, env.jwtAccessSecret) as JwtPayload
}
