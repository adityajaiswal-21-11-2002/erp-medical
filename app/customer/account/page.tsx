import React from "react"
import { Save } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

export default function CustomerAccountPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Account</h2>
          <p className="text-sm text-muted-foreground">Manage your profile and preferences.</p>
        </div>
        <Button className="gap-2">
          <Save className="w-4 h-4" />
          Save changes
        </Button>
      </div>

      <Card className="border">
        <CardHeader>
          <CardTitle className="text-base">Profile Details</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Store Name</label>
            <Input defaultValue="Apollo Pharmacy - Delhi" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Contact Person</label>
            <Input defaultValue="Anita Rao" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Email</label>
            <Input defaultValue="store@apollo.in" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Phone</label>
            <Input defaultValue="+91 99887 66554" />
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="text-xs font-medium text-muted-foreground">Delivery Address</label>
            <Textarea defaultValue="Apollo Pharmacy Warehouse, Okhla, New Delhi - 110020" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
