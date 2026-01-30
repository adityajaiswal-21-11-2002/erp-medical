'use client'

import { AuthGate } from '@/components/auth-gate'
import { RetailerLayout } from '@/components/retailer-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Gift, Zap, TrendingUp } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'

type Reward = {
  _id: string
  name: string
  pointsCost: number
}

export default function LoyaltyPage() {
  const [currentPoints, setCurrentPoints] = useState(0)
  const [tier, setTier] = useState("BRONZE")
  const [rewardsCatalog, setRewardsCatalog] = useState<Reward[]>([])
  const [pointsHistory, setPointsHistory] = useState<any[]>([])
  const [wish, setWish] = useState("")

  const nextTierPoints = tier === "BRONZE" ? 500 : tier === "SILVER" ? 1000 : 2000
  const pointsToNextTier = Math.max(nextTierPoints - currentPoints, 0)
  const progressPercent = Math.min((currentPoints / nextTierPoints) * 100, 100)

  useEffect(() => {
    const fetchData = async () => {
      const [summaryRes, rewardsRes] = await Promise.all([
        api.get("/api/loyalty/summary"),
        api.get("/api/rewards"),
      ])
      const summary = summaryRes.data?.data
      setCurrentPoints(summary?.points || 0)
      setTier(summary?.tier || "BRONZE")
      setPointsHistory(summary?.ledger || [])
      setRewardsCatalog(rewardsRes.data?.data || [])
    }
    fetchData().catch(() => undefined)
  }, [])

  const scratchCards = [
    { id: 1, value: 'Scratch now', scratch: '*** ***' },
    { id: 2, value: 'Scratch now', scratch: '*** ***' },
    { id: 3, value: 'Scratch now', scratch: '*** ***' },
  ]

  return (
    <AuthGate requiredAccountType="RETAILER">
      <RetailerLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Loyalty Program</h1>
            <p className="text-muted-foreground mt-2">Earn points on every order and redeem rewards</p>
          </div>

          {/* Points Balance Card */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="md:col-span-2">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Your Loyalty Points</p>
                    <p className="text-4xl font-bold">{currentPoints}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {tier} Member • {pointsToNextTier} pts to next tier
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge className="mb-2">{tier} Member</Badge>
                    <p className="text-xs text-muted-foreground">Next tier in {pointsToNextTier} pts</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Progress to Gold</span>
                    <span className="font-medium">{currentPoints}/{nextTierPoints}</span>
                  </div>
                  <Progress value={progressPercent} className="h-2" />
                  <p className="text-xs text-muted-foreground text-right">
                    {pointsToNextTier} points to unlock Gold member benefits
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Member Benefits</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <Zap className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">1 Pt per ₹1</p>
                    <p className="text-xs text-muted-foreground">On all orders</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">2x Points</p>
                    <p className="text-xs text-muted-foreground">On bulk orders</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Gift className="w-4 h-4 text-pink-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Exclusive Rewards</p>
                    <p className="text-xs text-muted-foreground">Premium catalog access</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs: Points History, Rewards, Scratch Cards */}
          <Tabs defaultValue="rewards" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="rewards">Rewards Catalog</TabsTrigger>
              <TabsTrigger value="history">Points History</TabsTrigger>
              <TabsTrigger value="scratch">Scratch Cards</TabsTrigger>
            </TabsList>

            <TabsContent value="rewards" className="space-y-4 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {rewardsCatalog.map((reward) => (
                  <Card key={reward._id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="pt-6 text-center space-y-4">
                      <div className="text-4xl">🎁</div>
                      <div>
                        <h4 className="font-semibold">{reward.name}</h4>
                        <p className="text-sm text-muted-foreground mt-1">{reward.pointsCost} points</p>
                      </div>
                      <Button
                        className="w-full"
                        disabled={currentPoints < reward.pointsCost}
                        onClick={async () => {
                          try {
                            await api.post(`/api/rewards/${reward._id}/redeem`)
                            toast.success("Reward redeemed")
                          } catch (error: any) {
                            toast.error(error?.response?.data?.error || "Failed to redeem")
                          }
                        }}
                      >
                        Redeem
                      </Button>
                      {currentPoints < reward.pointsCost && (
                        <p className="text-xs text-muted-foreground">
                          Need {reward.pointsCost - currentPoints} more points
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="history" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Points Activity</CardTitle>
                  <CardDescription>Your recent points transactions</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead className="text-right">Points</TableHead>
                        <TableHead>Type</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pointsHistory.map((item, idx) => (
                        <TableRow key={item._id || idx}>
                          <TableCell className="text-sm">
                            {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "-"}
                          </TableCell>
                          <TableCell className="text-sm">{item.source || "Activity"}</TableCell>
                          <TableCell
                            className={`text-right font-semibold ${
                              item.type === 'EARN' ? 'text-emerald-600' : 'text-red-600'
                            }`}
                          >
                            {item.type === 'EARN' ? '+' : '-'}
                            {item.points}
                          </TableCell>
                          <TableCell>
                            <Badge variant={item.type === 'EARN' ? 'default' : 'secondary'}>
                              {item.type === 'EARN' ? 'Earned' : 'Redeemed'}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="scratch" className="mt-6 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Lucky Scratch Cards</CardTitle>
                  <CardDescription>Scratch your lucky cards to earn instant bonus points</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {scratchCards.map((card) => (
                      <div
                        key={card.id}
                        className="border rounded-lg p-6 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950 dark:to-orange-950 text-center space-y-4 hover:shadow-lg transition-shadow cursor-pointer"
                      >
                        <div className="text-4xl font-bold text-orange-600">{card.scratch}</div>
                        <p className="text-sm text-muted-foreground">Scratch me!</p>
                        <Button
                          size="sm"
                          onClick={async () => {
                            try {
                              const res = await api.post("/api/rewards/scratch")
                              toast.success(`You earned ${res.data?.data?.points || 0} points`)
                            } catch (error: any) {
                              toast.error(error?.response?.data?.error || "Scratch failed")
                            }
                          }}
                        >
                          Scratch Card
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Make a Wish</CardTitle>
                  <CardDescription>Share a wish to earn surprise points.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Input
                    placeholder="e.g. New store display kits"
                    value={wish}
                    onChange={(e) => setWish(e.target.value)}
                  />
                  <Button
                    onClick={async () => {
                      try {
                        await api.post("/api/rewards/wish", { wish })
                        toast.success("Wish submitted")
                        setWish("")
                      } catch (error: any) {
                        toast.error(error?.response?.data?.error || "Failed to submit wish")
                      }
                    }}
                  >
                    Submit Wish
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </RetailerLayout>
    </AuthGate>
  )
}
