"use client"

import { useState } from "react"
import {
  Gift,
  Plus,
  Edit2,
  Trash2,
  TrendingUp,
  Users,
  Award,
  DollarSign,
  ChevronRight,
  Check,
  X,
  Filter,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
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

interface PointsRule {
  id: string
  name: string
  type: "purchase" | "referral" | "review" | "milestone"
  pointsPerValue: number
  valueType: string
  active: boolean
  description: string
}

interface Tier {
  id: string
  name: string
  minPoints: number
  maxPoints: number
  benefits: string[]
  discountPercentage: number
  memberCount: number
}

interface Reward {
  id: string
  name: string
  pointsCost: number
  category: string
  description: string
  stock: number
  redeemed: number
  active: boolean
}

interface RetailerPoints {
  id: string
  retailerId: string
  retailerName: string
  currentPoints: number
  tier: string
  joinDate: string
  lastActivity: string
  totalSpent: number
}

interface RedemptionRequest {
  id: string
  retailerId: string
  retailerName: string
  rewardId: string
  rewardName: string
  pointsCost: number
  requestedAt: string
  status: "pending" | "approved" | "rejected" | "completed"
}

const mockRules: PointsRule[] = [
  {
    id: "rule_001",
    name: "Purchase Points",
    type: "purchase",
    pointsPerValue: 1,
    valueType: "₹1 spent = 1 point",
    active: true,
    description: "Earn 1 point for every rupee spent on orders",
  },
  {
    id: "rule_002",
    name: "Referral Bonus",
    type: "referral",
    pointsPerValue: 500,
    valueType: "Per referral",
    active: true,
    description: "500 bonus points for each successful retailer referral",
  },
  {
    id: "rule_003",
    name: "Product Review",
    type: "review",
    pointsPerValue: 25,
    valueType: "Per review",
    active: true,
    description: "25 points for submitting a product review",
  },
  {
    id: "rule_004",
    name: "Milestone Bonus",
    type: "milestone",
    pointsPerValue: 100,
    valueType: "Monthly activity",
    active: false,
    description: "100 points on order anniversary",
  },
]

const mockTiers: Tier[] = [
  {
    id: "tier_001",
    name: "Bronze",
    minPoints: 0,
    maxPoints: 4999,
    benefits: ["10% order discount", "Priority support"],
    discountPercentage: 10,
    memberCount: 245,
  },
  {
    id: "tier_002",
    name: "Silver",
    minPoints: 5000,
    maxPoints: 14999,
    benefits: ["15% order discount", "Free shipping", "Exclusive offers"],
    discountPercentage: 15,
    memberCount: 89,
  },
  {
    id: "tier_003",
    name: "Gold",
    minPoints: 15000,
    maxPoints: 49999,
    benefits: ["20% discount", "Free shipping", "Early access", "Dedicated support"],
    discountPercentage: 20,
    memberCount: 28,
  },
  {
    id: "tier_004",
    name: "Platinum",
    minPoints: 50000,
    maxPoints: Infinity,
    benefits: ["25% discount", "Concierge service", "Exclusive products", "VIP events"],
    discountPercentage: 25,
    memberCount: 6,
  },
]

const mockRewards: Reward[] = [
  {
    id: "reward_001",
    name: "₹500 Store Credit",
    pointsCost: 2000,
    category: "credit",
    description: "Redeem for store credit",
    stock: 150,
    redeemed: 45,
    active: true,
  },
  {
    id: "reward_002",
    name: "Free Shipping Coupon",
    pointsCost: 500,
    category: "shipping",
    description: "Valid for one order up to ₹5000",
    stock: 300,
    redeemed: 120,
    active: true,
  },
  {
    id: "reward_003",
    name: "Exclusive Product Bundle",
    pointsCost: 5000,
    category: "product",
    description: "Limited edition pharmaceutical bundle",
    stock: 25,
    redeemed: 8,
    active: true,
  },
  {
    id: "reward_004",
    name: "20% Discount Voucher",
    pointsCost: 3000,
    category: "discount",
    description: "20% off on next purchase",
    stock: 80,
    redeemed: 15,
    active: false,
  },
]

const mockRetailerPoints: RetailerPoints[] = [
  {
    id: "ret_001",
    retailerId: "RTL_284",
    retailerName: "Metro Pharmacy - Mumbai",
    currentPoints: 28450,
    tier: "Gold",
    joinDate: "2024-03-15",
    lastActivity: "2025-01-24",
    totalSpent: 1245000,
  },
  {
    id: "ret_002",
    retailerId: "RTL_156",
    retailerName: "Apollo Medical",
    currentPoints: 5680,
    tier: "Silver",
    joinDate: "2024-06-20",
    lastActivity: "2025-01-23",
    totalSpent: 234500,
  },
  {
    id: "ret_003",
    retailerId: "RTL_423",
    retailerName: "Health Plus Retail",
    currentPoints: 1240,
    tier: "Bronze",
    joinDate: "2024-11-10",
    lastActivity: "2025-01-22",
    totalSpent: 45600,
  },
]

const mockRedemptions: RedemptionRequest[] = [
  {
    id: "redemp_001",
    retailerId: "RTL_284",
    retailerName: "Metro Pharmacy",
    rewardId: "reward_001",
    rewardName: "₹500 Store Credit",
    pointsCost: 2000,
    requestedAt: "2025-01-24 10:30",
    status: "pending",
  },
  {
    id: "redemp_002",
    retailerId: "RTL_156",
    retailerName: "Apollo Medical",
    rewardId: "reward_002",
    rewardName: "Free Shipping Coupon",
    pointsCost: 500,
    requestedAt: "2025-01-24 09:15",
    status: "approved",
  },
  {
    id: "redemp_003",
    retailerId: "RTL_423",
    retailerName: "Health Plus Retail",
    rewardId: "reward_003",
    rewardName: "Exclusive Product Bundle",
    pointsCost: 5000,
    requestedAt: "2025-01-23 14:22",
    status: "pending",
  },
]

export function LoyaltyRewards() {
  const [selectedTab, setSelectedTab] = useState("overview")
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-amber-100 text-amber-800">Pending</Badge>
      case "approved":
        return <Badge className="bg-emerald-100 text-emerald-800">Approved</Badge>
      case "rejected":
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>
      case "completed":
        return <Badge className="bg-blue-100 text-blue-800">Completed</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getTierColor = (tier: string) => {
    switch (tier) {
      case "Bronze":
        return "text-amber-700 bg-amber-50"
      case "Silver":
        return "text-slate-700 bg-slate-50"
      case "Gold":
        return "text-yellow-700 bg-yellow-50"
      case "Platinum":
        return "text-purple-700 bg-purple-50"
      default:
        return ""
    }
  }

  const handleApproveRedemption = (redemptionId: string) => {
    console.log("[v0] Approving redemption:", redemptionId)
  }

  const handleRejectRedemption = (redemptionId: string) => {
    console.log("[v0] Rejecting redemption:", redemptionId)
  }

  return (
    <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
      <TabsList className="grid w-full max-w-md grid-cols-5">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="rules">Rules</TabsTrigger>
        <TabsTrigger value="tiers">Tiers</TabsTrigger>
        <TabsTrigger value="rewards">Rewards</TabsTrigger>
        <TabsTrigger value="redemptions">Approvals</TabsTrigger>
      </TabsList>

      {/* Overview Tab */}
      <TabsContent value="overview" className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Members</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">368</div>
              <p className="text-xs text-muted-foreground">+12 this month</p>
            </CardContent>
          </Card>

          <Card className="border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Points Issued</CardTitle>
              <TrendingUp className="h-4 w-4 text-emerald-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">5,240,500</div>
              <p className="text-xs text-muted-foreground">This fiscal year</p>
            </CardContent>
          </Card>

          <Card className="border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Redeemed Value</CardTitle>
              <DollarSign className="h-4 w-4 text-amber-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹14,28,000</div>
              <p className="text-xs text-muted-foreground">In store credit</p>
            </CardContent>
          </Card>

          <Card className="border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
              <Award className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {mockRedemptions.filter((r) => r.status === "pending").length}
              </div>
              <p className="text-xs text-muted-foreground">Await your review</p>
            </CardContent>
          </Card>
        </div>

        {/* Tier Distribution */}
        <Card className="border">
          <CardHeader>
            <CardTitle className="text-base">Member Distribution by Tier</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockTiers.map((tier) => (
                <div key={tier.id} className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className={`font-medium text-sm px-2 py-1 rounded-full w-fit ${getTierColor(tier.name)}`}>
                      {tier.name}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {tier.minPoints.toLocaleString()} - {tier.maxPoints === Infinity ? "∞" : tier.maxPoints.toLocaleString()} points
                    </p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-32 bg-muted rounded-full h-2">
                      <div
                        className="h-2 rounded-full bg-emerald-500"
                        style={{ width: `${(tier.memberCount / 370) * 100}%` }}
                      />
                    </div>
                    <span className="font-bold text-sm w-12">{tier.memberCount}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Rules Tab */}
      <TabsContent value="rules" className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Points Rules Configuration</h3>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add New Rule
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Points Rule</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="ruleName">Rule Name</Label>
                  <Input id="ruleName" placeholder="E.g., Purchase Points" />
                </div>
                <div>
                  <Label htmlFor="ruleType">Rule Type</Label>
                  <Select>
                    <SelectTrigger id="ruleType">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="purchase">Purchase</SelectItem>
                      <SelectItem value="referral">Referral</SelectItem>
                      <SelectItem value="review">Review</SelectItem>
                      <SelectItem value="milestone">Milestone</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="points">Points Per Value</Label>
                  <Input id="points" type="number" placeholder="E.g., 1" />
                </div>
                <Button onClick={() => setIsDialogOpen(false)} className="w-full">
                  Create Rule
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="space-y-3">
          {mockRules.map((rule) => (
            <Card key={rule.id} className="border">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-semibold text-sm">{rule.name}</h4>
                      {rule.active ? (
                        <Badge className="bg-emerald-100 text-emerald-800 text-xs">Active</Badge>
                      ) : (
                        <Badge className="bg-gray-100 text-gray-800 text-xs">Inactive</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{rule.description}</p>
                    <div className="flex items-center space-x-4 mt-3">
                      <span className="text-sm font-medium">{rule.pointsPerValue} points</span>
                      <span className="text-xs text-muted-foreground">{rule.valueType}</span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="ghost" size="sm">
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </TabsContent>

      {/* Tiers Tab */}
      <TabsContent value="tiers" className="space-y-6">
        <h3 className="text-lg font-semibold">Tier Configuration</h3>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tier Name</TableHead>
                <TableHead>Points Range</TableHead>
                <TableHead>Discount</TableHead>
                <TableHead>Members</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockTiers.map((tier) => (
                <TableRow key={tier.id}>
                  <TableCell className="font-medium">
                    <span className={`px-2 py-1 rounded-full ${getTierColor(tier.name)}`}>{tier.name}</span>
                  </TableCell>
                  <TableCell className="text-sm">
                    {tier.minPoints.toLocaleString()} - {tier.maxPoints === Infinity ? "∞" : tier.maxPoints.toLocaleString()}
                  </TableCell>
                  <TableCell className="font-semibold">{tier.discountPercentage}%</TableCell>
                  <TableCell>{tier.memberCount}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="sm">
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </TabsContent>

      {/* Rewards Tab */}
      <TabsContent value="rewards" className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Rewards Catalog</h3>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Reward
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {mockRewards.map((reward) => (
            <Card key={reward.id} className="border">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="font-semibold text-sm">{reward.name}</h4>
                    <p className="text-xs text-muted-foreground mt-1">{reward.description}</p>
                  </div>
                  {reward.active ? (
                    <Badge className="bg-emerald-100 text-emerald-800">Active</Badge>
                  ) : (
                    <Badge className="bg-gray-100 text-gray-800">Inactive</Badge>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-2 mb-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Points Cost</p>
                    <p className="font-bold text-sm">{reward.pointsCost.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">In Stock</p>
                    <p className="font-bold text-sm">{reward.stock}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Redeemed</p>
                    <p className="font-bold text-sm">{reward.redeemed}</p>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                    <Edit2 className="w-3 h-3 mr-1" />
                    Edit
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </TabsContent>

      {/* Redemptions Tab */}
      <TabsContent value="redemptions" className="space-y-6">
        <h3 className="text-lg font-semibold">Redemption Approval Queue</h3>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Retailer</TableHead>
                <TableHead>Reward</TableHead>
                <TableHead>Points Cost</TableHead>
                <TableHead>Requested</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockRedemptions.map((redemption) => (
                <TableRow key={redemption.id}>
                  <TableCell className="font-medium text-sm">{redemption.retailerName}</TableCell>
                  <TableCell className="text-sm">{redemption.rewardName}</TableCell>
                  <TableCell className="font-bold">{redemption.pointsCost.toLocaleString()}</TableCell>
                  <TableCell className="text-sm">{redemption.requestedAt}</TableCell>
                  <TableCell>{getStatusBadge(redemption.status)}</TableCell>
                  <TableCell className="text-right">
                    {redemption.status === "pending" && (
                      <div className="flex justify-end space-x-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleApproveRedemption(redemption.id)}
                        >
                          <Check className="w-4 h-4 text-emerald-600" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleRejectRedemption(redemption.id)}
                        >
                          <X className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </TabsContent>
    </Tabs>
  )
}
