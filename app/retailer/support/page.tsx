'use client'

import { AuthGate } from '@/components/auth-gate'
import { RetailerLayout } from '@/components/retailer-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { FileUp, MessageSquare, Clock, CheckCircle2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { toast } from 'sonner'

export default function SupportPage() {
  const [category, setCategory] = useState('order')
  const [ticketForm, setTicketForm] = useState({ subject: '', message: '' })

  const [tickets, setTickets] = useState<any[]>([])

  const statusConfig: Record<string, { label: string; icon: any; color: string }> = {
    'OPEN': { label: 'Open', icon: Clock, color: 'bg-blue-100 text-blue-800' },
    'IN_PROGRESS': { label: 'In Progress', icon: MessageSquare, color: 'bg-yellow-100 text-yellow-800' },
    'RESOLVED': { label: 'Resolved', icon: CheckCircle2, color: 'bg-emerald-100 text-emerald-800' },
  }

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/api/tickets')
        setTickets(res.data?.data || [])
      } catch (error: any) {
        toast.error(error?.response?.data?.error || 'Failed to load tickets')
      }
    }
    load().catch(() => undefined)
  }, [])

  return (
    <AuthGate requiredAccountType="RETAILER">
      <RetailerLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Support Center</h1>
            <p className="text-muted-foreground mt-2">Get help and report issues</p>
          </div>

          <Tabs defaultValue="create" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="create">Create Ticket</TabsTrigger>
              <TabsTrigger value="tickets">My Tickets</TabsTrigger>
            </TabsList>

            {/* Create Ticket */}
            <TabsContent value="create" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Create a Support Ticket</CardTitle>
                  <CardDescription>Describe your issue and we will get back to you shortly</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label htmlFor="category">Category *</Label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger id="category" className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="order">Order Issue</SelectItem>
                        <SelectItem value="payment">Payment Issue</SelectItem>
                        <SelectItem value="product">Product Question</SelectItem>
                        <SelectItem value="delivery">Delivery</SelectItem>
                        <SelectItem value="account">Account & KYC</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="subject">Subject *</Label>
                    <Input
                      id="subject"
                      placeholder="Brief description of your issue"
                      value={ticketForm.subject}
                      onChange={(e) => setTicketForm({ ...ticketForm, subject: e.target.value })}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="message">Message *</Label>
                    <Textarea
                      id="message"
                      placeholder="Provide detailed information about your issue..."
                      rows={5}
                      value={ticketForm.message}
                      onChange={(e) => setTicketForm({ ...ticketForm, message: e.target.value })}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label>Attachment (Optional)</Label>
                    <div className="mt-2 border-2 border-dashed rounded-lg p-6 text-center hover:bg-muted/50 cursor-pointer transition">
                      <FileUp className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm font-medium">Click to upload or drag and drop</p>
                      <p className="text-xs text-muted-foreground">Images, PDFs (max 10MB)</p>
                    </div>
                  </div>

                  <Button
                    className="w-full"
                    onClick={async () => {
                      try {
                        await api.post('/api/tickets', {
                          subject: ticketForm.subject,
                          description: ticketForm.message,
                          priority: 'MEDIUM',
                        })
                        toast.success('Ticket submitted')
                        setTicketForm({ subject: '', message: '' })
                        const res = await api.get('/api/tickets')
                        setTickets(res.data?.data || [])
                      } catch (error: any) {
                        toast.error(error?.response?.data?.error || 'Failed to submit ticket')
                      }
                    }}
                  >
                    Submit Ticket
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* My Tickets */}
            <TabsContent value="tickets" className="mt-6 space-y-4">
              {tickets.map((ticket) => {
                const config = statusConfig[ticket.status] || statusConfig.OPEN
                const StatusIcon = config.icon

                return (
                  <Card key={ticket.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold">{ticket.subject}</h4>
                            <Badge variant="secondary" className="text-xs">
                              {ticket.category}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Ticket ID: {ticket._id} •{" "}
                            {ticket.createdAt ? new Date(ticket.createdAt).toLocaleDateString() : "-"}
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge
                            className={`mb-1 flex items-center gap-1 ${config.color}`}
                            variant="secondary"
                          >
                            <StatusIcon className="w-3 h-3" />
                            {config.label}
                          </Badge>
                          {ticket.priority === 'HIGH' && (
                            <Badge variant="destructive" className="block mt-1">
                              High
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="pt-3 border-t">
                        <Button size="sm" variant="outline" className="bg-transparent">
                          View Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </TabsContent>
          </Tabs>

          {/* Quick Help */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Help & FAQs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <details className="border rounded-lg p-4 hover:bg-muted/50 cursor-pointer">
                  <summary className="font-medium">How do I place a bulk order?</summary>
                  <p className="text-sm text-muted-foreground mt-2">
                    You can place bulk orders directly from the catalog. Orders above ₹20,000 get special discounts and 7% commission through affiliate program.
                  </p>
                </details>

                <details className="border rounded-lg p-4 hover:bg-muted/50 cursor-pointer">
                  <summary className="font-medium">What is the delivery timeframe?</summary>
                  <p className="text-sm text-muted-foreground mt-2">
                    Orders are typically delivered within 2-3 business days depending on your location. You can track your order status in real-time.
                  </p>
                </details>

                <details className="border rounded-lg p-4 hover:bg-muted/50 cursor-pointer">
                  <summary className="font-medium">How do I update my KYC details?</summary>
                  <p className="text-sm text-muted-foreground mt-2">
                    You can update your KYC information from the KYC page. Any major changes require re-verification and may take 2-3 business days.
                  </p>
                </details>

                <details className="border rounded-lg p-4 hover:bg-muted/50 cursor-pointer">
                  <summary className="font-medium">What payment methods are available?</summary>
                  <p className="text-sm text-muted-foreground mt-2">
                    Currently, online payments are available. Pay later and credit facilities will be available after KYC approval with sufficient credit limit.
                  </p>
                </details>
              </div>
            </CardContent>
          </Card>

          {/* Contact Info */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Us</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <p className="font-medium mb-1">Email Support</p>
                <p className="text-muted-foreground">support@pharmahub.in</p>
              </div>
              <div>
                <p className="font-medium mb-1">WhatsApp Support</p>
                <p className="text-muted-foreground">+91 98765 43210</p>
              </div>
              <div>
                <p className="font-medium mb-1">Business Hours</p>
                <p className="text-muted-foreground">Mon - Fri: 9:00 AM - 6:00 PM IST</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </RetailerLayout>
    </AuthGate>
  )
}
