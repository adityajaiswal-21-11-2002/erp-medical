import axios from "axios"

// When NEXT_PUBLIC_API_URL is unset or empty, requests go to same-origin /api (Next.js API routes).
// Set it (e.g. http://localhost:5000) only if you use the separate Express backend.
const baseURL = process.env.NEXT_PUBLIC_API_URL ?? ""

export const api = axios.create({
  baseURL,
})

let accessToken: string | null = null
let onUnauthorized: (() => void) | null = null

export function setAccessToken(token: string | null) {
  accessToken = token
  if (typeof window !== "undefined") {
    if (token) {
      localStorage.setItem("pharma_token", token)
    } else {
      localStorage.removeItem("pharma_token")
    }
  }
}

export function setUnauthorizedHandler(handler: (() => void) | null) {
  onUnauthorized = handler
}

api.interceptors.request.use((config) => {
  const token =
    accessToken || (typeof window !== "undefined" ? localStorage.getItem("pharma_token") : null)
  if (token) {
    config.headers = config.headers || {}
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401 && typeof window !== "undefined") {
      const url = String(error?.config?.url ?? "")
      const isAuthEndpoint =
        url.includes("auth/login") ||
        url.includes("auth/logout") ||
        url.includes("auth/register")
      if (!isAuthEndpoint) {
        setAccessToken(null)
        if (onUnauthorized) {
          onUnauthorized()
        }
      }
    }
    return Promise.reject(error)
  },
)
