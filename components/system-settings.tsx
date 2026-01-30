"use client"

import { useState } from "react"
import {
  Settings,
  Save,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  Trash2,
  Plus,
  Copy,
  ExternalLink,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface PasswordField {
  id: string
  label: string
  value: string
  isVisible: boolean
}

interface Role {
  id: string
  name: string
  permissions: string[]
  userCount: number
}

interface AuditLog {
  id: string
  timestamp: string
  user: string
  action: string
  resource: string
  status: "success" | "failure"
  details: string
}

const mockRoles: Role[] = [
  {
    id: "role_001",
    name: "Super Admin",
    permissions: ["manage_settings", "manage_users", "manage_retailers", "view_analytics", "manage_payments"],
    userCount: 2,
  },
  {
    id: "role_002",
    name: "Support Manager",
    permissions: ["manage_support", "view_analytics", "manage_retailers"],
    userCount: 5,
  },
  {
    id: "role_003",
    name: "Finance Manager",
    permissions: ["manage_payments", "view_analytics", "export_reports"],
    userCount: 3,
  },
  {
    id: "role_004",
    name: "Operations Manager",
    permissions: ["manage_inventory", "manage_orders", "view_analytics"],
    userCount: 4,
  },
]

const mockAuditLogs: AuditLog[] = [
  {
    id: "audit_001",
    timestamp: "2025-01-24 14:45:00",
    user: "Raj Kumar",
    action: "Updated ERP Settings",
    resource: "ERP Gateway Config",
    status: "success",
    details: "Changed gateway timeout from 30s to 45s",
  },
  {
    id: "audit_002",
    timestamp: "2025-01-24 14:30:00",
    user: "Priya Singh",
    action: "Triggered Manual Sync",
    resource: "Inventory Sync Job",
    status: "success",
    details: "Manual inventory sync completed - 2847 records",
  },
  {
    id: "audit_003",
    timestamp: "2025-01-24 13:15:00",
    user: "Aisha Patel",
    action: "Modified Payment Gateway",
    resource: "Payment Config",
    status: "success",
    details: "Updated webhook URL for payment notifications",
  },
  {
    id: "audit_004",
    timestamp: "2025-01-24 12:00:00",
    user: "Admin User",
    action: "Added New Role",
    resource: "Role Management",
    status: "success",
    details: "Created new role: Regional Manager",
  },
  {
    id: "audit_005",
    timestamp: "2025-01-24 11:30:00",
    user: "Raj Kumar",
    action: "Failed Authentication",
    resource: "Admin Login",
    status: "failure",
    details: "Invalid API key used for authentication",
  },
]

export function SystemSettings() {
  const [selectedTab, setSelectedTab] = useState("general")
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle")
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [passwordFields, setPasswordFields] = useState<PasswordField[]>([
    { id: "erp_key", label: "ERP API Key", value: "sk_live_51a2b3c4d5e6f7g8h9i0j", isVisible: false },
    { id: "payment_key", label: "Payment Gateway Key", value: "pk_live_aBcDeFgHiJkLmNoPqRsTuVwX", isVisible: false },
    {
      id: "webhook_secret",
      label: "Webhook Secret",
      value: "whsec_1234567890abcdefghijklmnopqrst",
      isVisible: false,
    },
  ])

  const [generalSettings, setGeneralSettings] = useState({
    platformName: "PharmaHub Distribution",
    supportEmail: "support@pharmahub.io",
    supportPhone: "+91-1800-123-4567",
    timezone: "IST",
    currency: "INR",
  })

  const [erpSettings, setErpSettings] = useState({
    gatewayUrl: "https://erp.pharma-system.com/api",
    syncInterval: "15",
    timeout: "45",
    retryAttempts: "3",
    batchSize: "500",
  })

  const [paymentSettings, setPaymentSettings] = useState({
    gateway: "stripe",
    environment: "production",
    webhookUrl: "https://pharmahub.io/webhooks/payment",
    enableRetry: true,
    retryInterval: "5",
  })

  const handleSaveSettings = () => {
    setSaveStatus("saving")
    setTimeout(() => {
      setSaveStatus("saved")
      setTimeout(() => setSaveStatus("idle"), 2000)
    }, 1000)
  }

  const togglePasswordVisibility = (id: string) => {
    setPasswordFields(
      passwordFields.map((field) => (field.id === id ? { ...field, isVisible: !field.isVisible } : field))
    )
  }

  const handleCopyPassword = (value: string) => {
    navigator.clipboard.writeText(value)
    console.log("[v0] Copied to clipboard")
  }

  return (
    <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
      <TabsList className="grid w-full max-w-2xl grid-cols-6">
        <TabsTrigger value="general">General</TabsTrigger>
        <TabsTrigger value="erp">ERP</TabsTrigger>
        <TabsTrigger value="payment">Payment</TabsTrigger>
        <TabsTrigger value="notifications">Notifications</TabsTrigger>
        <TabsTrigger value="roles">Roles</TabsTrigger>
        <TabsTrigger value="audit">Audit</TabsTrigger>
      </TabsList>

      {/* General Tab */}
      <TabsContent value="general" className="space-y-6">
        <Card className="border">
          <CardHeader>
            <CardTitle>General Settings</CardTitle>
            <CardDescription>Configure basic platform settings and preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="platformName">Platform Name</Label>
                <Input
                  id="platformName"
                  value={generalSettings.platformName}
                  onChange={(e) =>
                    setGeneralSettings({ ...generalSettings, platformName: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="supportEmail">Support Email</Label>
                <Input
                  id="supportEmail"
                  type="email"
                  value={generalSettings.supportEmail}
                  onChange={(e) =>
                    setGeneralSettings({ ...generalSettings, supportEmail: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="supportPhone">Support Phone</Label>
                <Input
                  id="supportPhone"
                  value={generalSettings.supportPhone}
                  onChange={(e) =>
                    setGeneralSettings({ ...generalSettings, supportPhone: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="timezone">Timezone</Label>
                <Select value={generalSettings.timezone} onValueChange={(value) =>
                  setGeneralSettings({ ...generalSettings, timezone: value })
                }>
                  <SelectTrigger id="timezone">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="IST">IST (India Standard Time)</SelectItem>
                    <SelectItem value="UTC">UTC</SelectItem>
                    <SelectItem value="EST">EST (Eastern Standard Time)</SelectItem>
                    <SelectItem value="PST">PST (Pacific Standard Time)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="currency">Currency</Label>
                <Select value={generalSettings.currency} onValueChange={(value) =>
                  setGeneralSettings({ ...generalSettings, currency: value })
                }>
                  <SelectTrigger id="currency">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="INR">INR (₹)</SelectItem>
                    <SelectItem value="USD">USD ($)</SelectItem>
                    <SelectItem value="EUR">EUR (€)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button onClick={handleSaveSettings} className="w-full">
              {saveStatus === "saving" ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Saving...
                </>
              ) : saveStatus === "saved" ? (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Saved!
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </TabsContent>

      {/* ERP Tab */}
      <TabsContent value="erp" className="space-y-6">
        <Card className="border">
          <CardHeader>
            <CardTitle>ERP Integration Settings</CardTitle>
            <CardDescription>Configure ERP gateway and synchronization parameters</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="gatewayUrl">Gateway URL</Label>
                <Input
                  id="gatewayUrl"
                  value={erpSettings.gatewayUrl}
                  onChange={(e) => setErpSettings({ ...erpSettings, gatewayUrl: e.target.value })}
                />
                <p className="text-xs text-muted-foreground mt-1">Base URL for ERP API endpoints</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="syncInterval">Sync Interval (minutes)</Label>
                  <Input
                    id="syncInterval"
                    type="number"
                    value={erpSettings.syncInterval}
                    onChange={(e) =>
                      setErpSettings({ ...erpSettings, syncInterval: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="timeout">Timeout (seconds)</Label>
                  <Input
                    id="timeout"
                    type="number"
                    value={erpSettings.timeout}
                    onChange={(e) =>
                      setErpSettings({ ...erpSettings, timeout: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="retryAttempts">Retry Attempts</Label>
                  <Input
                    id="retryAttempts"
                    type="number"
                    value={erpSettings.retryAttempts}
                    onChange={(e) =>
                      setErpSettings({ ...erpSettings, retryAttempts: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="batchSize">Batch Size (records)</Label>
                  <Input
                    id="batchSize"
                    type="number"
                    value={erpSettings.batchSize}
                    onChange={(e) =>
                      setErpSettings({ ...erpSettings, batchSize: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>

            <Button onClick={handleSaveSettings} className="w-full">
              <Save className="w-4 h-4 mr-2" />
              Save ERP Settings
            </Button>
          </CardContent>
        </Card>

        {/* Secure Credentials */}
        <Card className="border border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-base flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <span>Secure Credentials</span>
            </CardTitle>
            <CardDescription>API keys and secrets for ERP gateway</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {passwordFields.map((field) => (
              <div key={field.id} className="space-y-2">
                <Label className="text-sm">{field.label}</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    type={field.isVisible ? "text" : "password"}
                    value={field.value}
                    readOnly
                    className="font-mono text-sm"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => togglePasswordVisibility(field.id)}
                  >
                    {field.isVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopyPassword(field.value)}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
            <Button variant="outline" className="w-full bg-transparent">
              Regenerate Keys
            </Button>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Payment Tab */}
      <TabsContent value="payment" className="space-y-6">
        <Card className="border">
          <CardHeader>
            <CardTitle>Payment Gateway Settings</CardTitle>
            <CardDescription>Configure payment processing and reconciliation</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="gateway">Payment Gateway</Label>
                  <Select value={paymentSettings.gateway} onValueChange={(value) =>
                    setPaymentSettings({ ...paymentSettings, gateway: value })
                  }>
                    <SelectTrigger id="gateway">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="stripe">Stripe</SelectItem>
                      <SelectItem value="razorpay">Razorpay</SelectItem>
                      <SelectItem value="paypal">PayPal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="environment">Environment</Label>
                  <Select value={paymentSettings.environment} onValueChange={(value) =>
                    setPaymentSettings({ ...paymentSettings, environment: value })
                  }>
                    <SelectTrigger id="environment">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="production">Production</SelectItem>
                      <SelectItem value="sandbox">Sandbox</SelectItem>
                      <SelectItem value="testing">Testing</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="webhookUrl">Webhook URL</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="webhookUrl"
                    value={paymentSettings.webhookUrl}
                    onChange={(e) =>
                      setPaymentSettings({
                        ...paymentSettings,
                        webhookUrl: e.target.value,
                      })
                    }
                  />
                  <Button variant="outline" size="sm">
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-muted rounded">
                <Label className="flex items-center space-x-2 cursor-pointer m-0">
                  <input
                    type="checkbox"
                    checked={paymentSettings.enableRetry}
                    onChange={(e) =>
                      setPaymentSettings({
                        ...paymentSettings,
                        enableRetry: e.target.checked,
                      })
                    }
                    className="rounded"
                  />
                  <span className="text-sm">Enable Automatic Payment Retry</span>
                </Label>
              </div>

              {paymentSettings.enableRetry && (
                <div>
                  <Label htmlFor="retryInterval">Retry Interval (hours)</Label>
                  <Input
                    id="retryInterval"
                    type="number"
                    value={paymentSettings.retryInterval}
                    onChange={(e) =>
                      setPaymentSettings({
                        ...paymentSettings,
                        retryInterval: e.target.value,
                      })
                    }
                  />
                </div>
              )}
            </div>

            <Button onClick={handleSaveSettings} className="w-full">
              <Save className="w-4 h-4 mr-2" />
              Save Payment Settings
            </Button>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Notifications Tab */}
      <TabsContent value="notifications" className="space-y-6">
        <Card className="border">
          <CardHeader>
            <CardTitle>Email Notification Templates</CardTitle>
            <CardDescription>Customize email templates for system notifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {[
                { name: "Order Confirmation", subject: "Your order #{orderId} has been placed" },
                { name: "Payment Failed", subject: "Payment failed for order #{orderId}" },
                { name: "ERP Sync Error", subject: "ERP sync failed for retailer #{retailerId}" },
                { name: "Stock Alert", subject: "Low stock alert for SKU {skuId}" },
              ].map((template) => (
                <Card key={template.name} className="border bg-muted/30">
                  <CardContent className="pt-4 flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-sm">{template.name}</p>
                      <p className="text-xs text-muted-foreground mt-1">{template.subject}</p>
                    </div>
                    <Button variant="outline" size="sm">
                      Edit Template
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Roles Tab */}
      <TabsContent value="roles" className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Role Management</h3>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Create Role
          </Button>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Role Name</TableHead>
                <TableHead>Users</TableHead>
                <TableHead>Permissions</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockRoles.map((role) => (
                <TableRow key={role.id}>
                  <TableCell className="font-medium">{role.name}</TableCell>
                  <TableCell>{role.userCount}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {role.permissions.slice(0, 2).map((perm) => (
                        <Badge key={perm} variant="secondary" className="text-xs">
                          {perm.replace("_", " ")}
                        </Badge>
                      ))}
                      {role.permissions.length > 2 && (
                        <Badge variant="secondary" className="text-xs">
                          +{role.permissions.length - 2}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </TabsContent>

      {/* Audit Tab */}
      <TabsContent value="audit" className="space-y-6">
        <Card className="border">
          <CardHeader>
            <CardTitle>Audit Logs</CardTitle>
            <CardDescription>Track all system changes and user actions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Resource</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockAuditLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="text-sm">{log.timestamp}</TableCell>
                      <TableCell className="font-medium text-sm">{log.user}</TableCell>
                      <TableCell className="text-sm">{log.action}</TableCell>
                      <TableCell className="text-sm">{log.resource}</TableCell>
                      <TableCell>
                        {log.status === "success" ? (
                          <Badge className="bg-emerald-100 text-emerald-800">Success</Badge>
                        ) : (
                          <Badge className="bg-red-100 text-red-800">Failed</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
