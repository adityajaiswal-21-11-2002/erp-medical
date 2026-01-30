"use client"

import { useState } from "react"
import {
  MessageSquare,
  Clock,
  AlertCircle,
  CheckCircle2,
  Filter,
  Plus,
  Send,
  Paperclip,
  Search,
  ChevronRight,
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"

interface Ticket {
  id: string
  ticketId: string
  retailerId: string
  retailerName: string
  category: string
  priority: "low" | "medium" | "high" | "urgent"
  status: "open" | "in_progress" | "waiting" | "resolved" | "closed"
  subject: string
  createdAt: string
  lastUpdatedAt: string
  assignedTo?: string
  slaTime: string
  slaWarning: boolean
}

interface TicketMessage {
  id: string
  author: string
  role: "retailer" | "support" | "system"
  message: string
  timestamp: string
  attachments?: string[]
}

const mockTickets: Ticket[] = [
  {
    id: "tkt_001",
    ticketId: "TKT-2024-0847",
    retailerId: "RTL_284",
    retailerName: "Metro Pharmacy - Mumbai",
    category: "Inventory Issue",
    priority: "urgent",
    status: "in_progress",
    subject: "Stock update not syncing for SKU 45821",
    createdAt: "2025-01-24 08:15:00",
    lastUpdatedAt: "2025-01-24 14:30:00",
    assignedTo: "Raj Kumar",
    slaTime: "2h 15m remaining",
    slaWarning: false,
  },
  {
    id: "tkt_002",
    ticketId: "TKT-2024-0846",
    retailerId: "RTL_156",
    retailerName: "Apollo Medical",
    category: "Payment Issue",
    priority: "high",
    status: "in_progress",
    subject: "Transaction failed - amount deducted but order not created",
    createdAt: "2025-01-24 10:22:00",
    lastUpdatedAt: "2025-01-24 13:45:00",
    assignedTo: "Priya Singh",
    slaTime: "4h 10m remaining",
    slaWarning: true,
  },
  {
    id: "tkt_003",
    ticketId: "TKT-2024-0845",
    retailerId: "RTL_423",
    retailerName: "Health Plus Retail",
    category: "Order Fulfillment",
    priority: "medium",
    status: "waiting",
    subject: "Delayed delivery for order PO-2025-001234",
    createdAt: "2025-01-23 15:30:00",
    lastUpdatedAt: "2025-01-24 09:00:00",
    assignedTo: "Aisha Patel",
    slaTime: "18h 45m remaining",
    slaWarning: false,
  },
  {
    id: "tkt_004",
    ticketId: "TKT-2024-0844",
    retailerId: "RTL_589",
    retailerName: "Wellness Store",
    category: "Technical Issue",
    priority: "medium",
    status: "open",
    subject: "Dashboard login error - 403 Forbidden",
    createdAt: "2025-01-24 11:00:00",
    lastUpdatedAt: "2025-01-24 11:00:00",
    slaTime: "8h 30m remaining",
    slaWarning: false,
  },
  {
    id: "tkt_005",
    ticketId: "TKT-2024-0843",
    retailerId: "RTL_234",
    retailerName: "Care Pharmacy",
    category: "General Inquiry",
    priority: "low",
    status: "resolved",
    subject: "How to set up payment gateway integration?",
    createdAt: "2025-01-22 14:15:00",
    lastUpdatedAt: "2025-01-24 10:30:00",
    assignedTo: "Raj Kumar",
    slaTime: "Resolved",
    slaWarning: false,
  },
]

const mockMessages: TicketMessage[] = [
  {
    id: "msg_001",
    author: "Metro Pharmacy",
    role: "retailer",
    message:
      "Hi, our inventory system shows 500 units of SKU 45821 but the PharmaHub dashboard still shows 120 units. This is causing order rejections from our customers.",
    timestamp: "2025-01-24 08:15:00",
  },
  {
    id: "msg_002",
    author: "System",
    role: "system",
    message: "Ticket assigned to Raj Kumar",
    timestamp: "2025-01-24 08:20:00",
  },
  {
    id: "msg_003",
    author: "Raj Kumar",
    role: "support",
    message:
      "Thank you for reporting this. I can see the discrepancy in our system. Let me check the ERP sync logs to identify the issue.",
    timestamp: "2025-01-24 08:30:00",
  },
  {
    id: "msg_004",
    author: "Raj Kumar",
    role: "support",
    message:
      "Found the issue - the last sync job failed due to a gateway timeout. I'm triggering a manual sync now to update your inventory.",
    timestamp: "2025-01-24 14:25:00",
    attachments: ["sync-report.pdf"],
  },
  {
    id: "msg_005",
    author: "Metro Pharmacy",
    role: "retailer",
    message: "Perfect! Thank you for the quick fix. The inventory is now showing correctly.",
    timestamp: "2025-01-24 14:30:00",
  },
]

export function SupportTickets() {
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(mockTickets[0])
  const [statusFilter, setStatusFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [assignedTo, setAssignedTo] = useState(selectedTicket?.assignedTo || "")
  const [internalNote, setInternalNote] = useState("")
  const [replyMessage, setReplyMessage] = useState("")

  const filteredTickets = mockTickets.filter((ticket) => {
    const matchesSearch =
      ticket.ticketId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.retailerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.subject.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || ticket.status === statusFilter
    const matchesPriority = priorityFilter === "all" || ticket.priority === priorityFilter

    return matchesSearch && matchesStatus && matchesPriority
  })

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-800"
      case "high":
        return "bg-orange-100 text-orange-800"
      case "medium":
        return "bg-amber-100 text-amber-800"
      case "low":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-blue-100 text-blue-800"
      case "in_progress":
        return "bg-purple-100 text-purple-800"
      case "waiting":
        return "bg-amber-100 text-amber-800"
      case "resolved":
        return "bg-emerald-100 text-emerald-800"
      case "closed":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Tickets List */}
      <div className="lg:col-span-1">
        <Card className="border">
          <CardHeader>
            <CardTitle className="text-base">Tickets</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Filters */}
            <div className="space-y-3">
              <div>
                <Label className="text-xs">Status</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="waiting">Waiting</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs">Priority</Label>
                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                  <SelectTrigger className="text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priorities</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search tickets..."
                  className="pl-8 text-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Tickets */}
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {filteredTickets.map((ticket) => (
                <button
                  key={ticket.id}
                  onClick={() => setSelectedTicket(ticket)}
                  className={`w-full text-left p-2 rounded-lg border transition-all ${
                    selectedTicket?.id === ticket.id
                      ? "bg-primary/10 border-primary"
                      : "hover:bg-muted border-border"
                  }`}
                >
                  <div className="flex items-start justify-between mb-1">
                    <p className="font-medium text-xs">{ticket.ticketId}</p>
                    <Badge className={`text-xs ${getPriorityColor(ticket.priority)}`}>
                      {ticket.priority}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{ticket.retailerName}</p>
                  <p className="text-xs truncate mt-1">{ticket.subject}</p>
                  <div className="flex items-center justify-between mt-2">
                    <Badge className={`text-xs ${getStatusColor(ticket.status)}`}>
                      {ticket.status.replace("_", " ")}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{ticket.createdAt.split(" ")[0]}</span>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ticket Details */}
      <div className="lg:col-span-3 space-y-6">
        {selectedTicket && (
          <>
            {/* Header */}
            <Card className="border">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold">{selectedTicket.ticketId}</h2>
                    <p className="text-muted-foreground mt-1">{selectedTicket.subject}</p>
                  </div>
                  <div className="flex space-x-2">
                    <Badge className={`${getPriorityColor(selectedTicket.priority)}`}>
                      {selectedTicket.priority}
                    </Badge>
                    <Badge className={`${getStatusColor(selectedTicket.status)}`}>
                      {selectedTicket.status.replace("_", " ")}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Retailer</p>
                    <p className="font-semibold text-sm">{selectedTicket.retailerName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Category</p>
                    <p className="font-semibold text-sm">{selectedTicket.category}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Created</p>
                    <p className="font-semibold text-sm">{selectedTicket.createdAt}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">SLA Time</p>
                    <p
                      className={`font-semibold text-sm ${selectedTicket.slaWarning ? "text-red-600" : "text-emerald-600"}`}
                    >
                      {selectedTicket.slaTime}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Chat */}
              <div className="lg:col-span-2 space-y-4">
                <Card className="border">
                  <CardHeader>
                    <CardTitle className="text-base">Conversation</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4 h-80 overflow-y-auto mb-4">
                      {mockMessages.map((msg) => (
                        <div key={msg.id} className={`flex ${msg.role === "support" ? "justify-start" : "justify-end"}`}>
                          <div
                            className={`max-w-sm rounded-lg p-3 ${
                              msg.role === "support"
                                ? "bg-muted"
                                : msg.role === "system"
                                  ? "bg-blue-50 border border-blue-200"
                                  : "bg-primary text-primary-foreground"
                            }`}
                          >
                            <div className="flex items-center space-x-2 mb-1">
                              <p className="font-semibold text-xs">{msg.author}</p>
                              <p className="text-xs opacity-70">{msg.timestamp}</p>
                            </div>
                            <p className="text-sm">{msg.message}</p>
                            {msg.attachments && (
                              <div className="mt-2 flex flex-wrap gap-2">
                                {msg.attachments.map((att) => (
                                  <Button
                                    key={att}
                                    variant="ghost"
                                    size="sm"
                                    className="text-xs h-6 px-2"
                                  >
                                    <Paperclip className="w-3 h-3 mr-1" />
                                    {att}
                                  </Button>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-2">
                      <Textarea
                        placeholder="Type your reply..."
                        value={replyMessage}
                        onChange={(e) => setReplyMessage(e.target.value)}
                        className="min-h-20"
                      />
                      <Button className="w-full">
                        <Send className="w-4 h-4 mr-2" />
                        Send Reply
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-4">
                {/* Assignment */}
                <Card className="border">
                  <CardHeader>
                    <CardTitle className="text-base">Assignment</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Select value={assignedTo} onValueChange={setAssignedTo}>
                      <SelectTrigger>
                        <SelectValue placeholder="Assign to..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Raj Kumar">Raj Kumar</SelectItem>
                        <SelectItem value="Priya Singh">Priya Singh</SelectItem>
                        <SelectItem value="Aisha Patel">Aisha Patel</SelectItem>
                        <SelectItem value="Unassigned">Unassigned</SelectItem>
                      </SelectContent>
                    </Select>
                    <div className="text-xs text-muted-foreground">
                      Currently assigned to: <span className="font-semibold">{selectedTicket.assignedTo}</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Internal Notes */}
                <Card className="border">
                  <CardHeader>
                    <CardTitle className="text-base">Internal Notes</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Textarea
                      placeholder="Add internal notes (not visible to retailer)..."
                      value={internalNote}
                      onChange={(e) => setInternalNote(e.target.value)}
                      className="min-h-24"
                    />
                    <Button variant="outline" size="sm" className="w-full bg-transparent">
                      Save Note
                    </Button>
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card className="border">
                  <CardHeader>
                    <CardTitle className="text-base">Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button variant="outline" size="sm" className="w-full bg-transparent">
                      Mark as Resolved
                    </Button>
                    <Button variant="outline" size="sm" className="w-full bg-transparent">
                      Reopen Ticket
                    </Button>
                    <Button variant="outline" size="sm" className="w-full bg-transparent">
                      Send Survey
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
