"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { api } from "@/lib/api"
import { PageHeader } from "@/components/page-header"
import { Card, CardContent } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"

type FeatureFlag = {
  _id: string
  key: "RETURNS_ENABLED" | "COUPONS_ENABLED"
  enabled: boolean
}

const defaultFlags: FeatureFlag[] = [
  { _id: "RETURNS_ENABLED", key: "RETURNS_ENABLED", enabled: false },
  { _id: "COUPONS_ENABLED", key: "COUPONS_ENABLED", enabled: false },
]

export default function FeatureFlagsPage() {
  const [flags, setFlags] = useState<FeatureFlag[]>(defaultFlags)

  const loadFlags = async () => {
    try {
      const res = await api.get("/api/feature-flags")
      const list = res.data?.data || []
      const merged = defaultFlags.map((flag) => {
        const existing = list.find((item: FeatureFlag) => item.key === flag.key)
        return existing || flag
      })
      setFlags(merged)
    } catch (error: any) {
      toast.error(error?.response?.data?.error || "Failed to load feature flags")
    }
  }

  const updateFlag = async (key: FeatureFlag["key"], enabled: boolean) => {
    try {
      await api.patch(`/api/feature-flags/${key}`, { enabled })
      toast.success("Flag updated")
      loadFlags()
    } catch (error: any) {
      toast.error(error?.response?.data?.error || "Failed to update flag")
    }
  }

  useEffect(() => {
    loadFlags().catch(() => undefined)
  }, [])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Feature Flags"
        description="Enable or disable returns and coupons across portals."
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {flags.map((flag) => (
          <Card key={flag.key}>
            <CardContent className="pt-6 flex items-center justify-between">
              <div>
                <p className="font-medium">{flag.key}</p>
                <p className="text-sm text-muted-foreground">
                  {flag.key === "RETURNS_ENABLED"
                    ? "Toggle retailer returns workflow"
                    : "Toggle coupons and schemes availability"}
                </p>
              </div>
              <Switch
                checked={flag.enabled}
                onCheckedChange={(value) => updateFlag(flag.key, value)}
              />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
