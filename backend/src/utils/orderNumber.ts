import crypto from "crypto"

export function generateOrderNumber(date = new Date()) {
  const yyyy = String(date.getFullYear())
  const mm = String(date.getMonth() + 1).padStart(2, "0")
  const dd = String(date.getDate()).padStart(2, "0")
  const rand = crypto.randomInt(0, 10000).toString().padStart(4, "0")
  return `ORD-${yyyy}${mm}${dd}-${rand}`
}
