'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Copy, MessageCircle, TrendingUp, Users, Link as LinkIcon, Store, User, Truck } from 'lucide-react'
import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { toast } from 'sonner'

type ReferralType = 'retailer' | 'customer' | 'distributor'

const REFERRAL_TYPES: { id: ReferralType; label: string; path: string; icon: typeof Store }[] = [
  { id: 'retailer', label: 'Retailer', path: '/retailer', icon: Store },
  { id: 'customer', label: 'Customer', path: '/customer', icon: User },
  { id: 'distributor', label: 'Distributor', path: '/distributor', icon: Truck },
]

export default function AffiliatePage() {
  const [copied, setCopied] = useState<ReferralType | null>(null)
  const [referralCode, setReferralCode] = useState("REF-XXXX")
  const [stats, setStats] = useState({ clicks: 0, attributedOrders: 0 })
  const [selectedType, setSelectedType] = useState<ReferralType>('customer')

  const getReferralLink = (type: ReferralType) => {
    const base = typeof window !== "undefined" ? window.location.origin : "https://pharmahub.in"
    const config = REFERRAL_TYPES.find((t) => t.id === type)
    return `${base}${config?.path || '/customer'}?ref=${referralCode}`
  }

  const handleCopyLink = (type: ReferralType) => {
    navigator.clipboard.writeText(getReferralLink(type))
    setCopied(type)
    toast.success("Link copied to clipboard")
    setTimeout(() => setCopied(null), 2000)
  }

  const affiliateStats = [
    { label: 'Total Clicks', value: stats.clicks, icon: Users },
    { label: 'Conversions', value: stats.attributedOrders, icon: TrendingUp },
    { label: 'Attributed Sales', value: '₹0', icon: LinkIcon },
    { label: 'Earnings', value: '₹0', icon: LinkIcon },
  ]

  const recentAffiliateOrders: any[] = []

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/api/referrals/me")
        const data = res.data?.data
        setReferralCode(data?.refCode || "REF-XXXX")
        setStats({ clicks: data?.clicks || 0, attributedOrders: data?.attributedOrders || 0 })
      } catch (error: any) {
        toast.error(error?.response?.data?.error || "Failed to load referral info")
      }
    }
    load().catch(() => undefined)
  }, [])

  return (
    <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Affiliate Program</h1>
            <p className="text-muted-foreground mt-2">Earn commission by referring retailers, customers, or distributors</p>
          </div>

          {/* Referral Link Generator - Separate links per type */}
          <Card className="border-emerald-200 bg-emerald-50 dark:bg-emerald-950 dark:border-emerald-800">
            <CardHeader>
              <CardTitle>Your Referral Links</CardTitle>
              <CardDescription className="text-emerald-700 dark:text-emerald-300">
                Get separate referral links for each audience. Share the right link to earn 5% commission.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Tabs value={selectedType} onValueChange={(v) => setSelectedType(v as ReferralType)}>
                <TabsList className="grid w-full grid-cols-3">
                  {REFERRAL_TYPES.map((t) => {
                    const Icon = t.icon
                    return (
                      <TabsTrigger key={t.id} value={t.id} className="gap-2">
                        <Icon className="w-4 h-4" />
                        {t.label}
                      </TabsTrigger>
                    )
                  })}
                </TabsList>
                {REFERRAL_TYPES.map((t) => (
                  <TabsContent key={t.id} value={t.id} className="mt-4">
                    <div className="space-y-3">
                      <p className="text-sm text-muted-foreground">
                        Referral link for <strong>{t.label}s</strong>
                      </p>
                      <div className="flex gap-2">
                        <Input
                          value={getReferralLink(t.id)}
                          readOnly
                          className="bg-white dark:bg-slate-950 font-mono text-sm"
                        />
                        <Button onClick={() => handleCopyLink(t.id)} className="shrink-0 gap-2">
                          <Copy className="w-4 h-4" />
                          {copied === t.id ? 'Copied!' : 'Copy'}
                        </Button>
                      </div>
                    </div>
                  </TabsContent>
                ))}
              </Tabs>

              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  className="flex-1 bg-transparent gap-2"
                  onClick={() => {
                    const link = getReferralLink(selectedType)
                    const wa = `https://wa.me/?text=${encodeURIComponent(link)}`
                    window.open(wa, '_blank')
                  }}
                >
                  <MessageCircle className="w-4 h-4" />
                  Share on WhatsApp
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 bg-transparent gap-2"
                  onClick={() => handleCopyLink(selectedType)}
                >
                  <LinkIcon className="w-4 h-4" />
                  Copy Link
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {affiliateStats.map((stat, index) => {
              const Icon = stat.icon
              return (
                <Card key={index}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">{stat.label}</p>
                        <p className="text-2xl font-bold">{stat.value}</p>
                      </div>
                      <Icon className="w-5 h-5 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Earnings Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Earning Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">This Month</span>
                  <span className="font-semibold">₹2,150</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Last Month</span>
                  <span className="font-semibold">₹1,680</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Earnings</span>
                  <span className="font-semibold text-emerald-600">₹15,420</span>
                </div>
                <div className="flex justify-between pt-2 border-t font-bold">
                  <span>Available for Payout</span>
                  <span className="text-emerald-600">₹2,150</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Commission Structure</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p className="text-muted-foreground">Earn commission based on order values:</p>
                <div className="space-y-1">
                  <div className="flex justify-between p-2 bg-muted rounded">
                    <span>Orders ₹0 - ₹5K</span>
                    <Badge variant="secondary">3%</Badge>
                  </div>
                  <div className="flex justify-between p-2 bg-muted rounded">
                    <span>Orders ₹5K - ₹20K</span>
                    <Badge variant="secondary">5%</Badge>
                  </div>
                  <div className="flex justify-between p-2 bg-muted rounded">
                    <span>Orders above ₹20K</span>
                    <Badge variant="secondary">7%</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Affiliate Orders */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Affiliate Orders</CardTitle>
              <CardDescription>Orders from your referred retailers</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Retailer</TableHead>
                    <TableHead className="text-right">Order Amount</TableHead>
                    <TableHead className="text-right">Commission</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentAffiliateOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium text-sm">{order.orderid}</TableCell>
                      <TableCell className="text-sm">{order.retailer}</TableCell>
                      <TableCell className="text-right font-semibold">₹{order.amount}</TableCell>
                      <TableCell className="text-right font-semibold text-emerald-600">
                        ₹{order.commission}
                      </TableCell>
                      <TableCell className="text-sm">{order.date}</TableCell>
                      <TableCell>
                        <Badge variant={order.status === 'completed' ? 'default' : 'secondary'}>
                          {order.status === 'completed' ? 'Paid' : 'Pending'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                  {recentAffiliateOrders.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground">
                        No attributed orders yet
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Payout Info */}
          <Card>
            <CardHeader>
              <CardTitle>Payouts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-sm mb-2">Payout Schedule</h4>
                <p className="text-sm text-muted-foreground">
                  Commission payouts are processed every month on the 5th. Minimum payout amount: ₹500
                </p>
              </div>
              <Button className="w-full">Request Payout</Button>
            </CardContent>
          </Card>
        </div>
  )
}
