import { api } from "@/lib/api"

export async function trackEvent(eventType: string, metadata?: Record<string, unknown>) {
  try {
    await api.post("/api/analytics/events", { eventType, metadata })
  } catch {
    // ignore analytics failures
  }
}
