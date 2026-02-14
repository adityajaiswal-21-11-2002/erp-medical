import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Extract user-facing error message from axios/API error. */
export function getErrorMessage(err: unknown, fallback = "Something went wrong"): string {
  if (!err || typeof err !== "object") return fallback
  if ("response" in err && err.response && typeof err.response === "object") {
    const data = (err.response as { data?: unknown }).data
    if (data && typeof data === "object" && "error" in data && typeof (data as { error?: unknown }).error === "string") {
      return (data as { error: string }).error
    }
  }
  if ("message" in err && typeof (err as { message?: unknown }).message === "string") {
    return (err as { message: string }).message
  }
  return fallback
}
