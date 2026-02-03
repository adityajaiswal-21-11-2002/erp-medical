'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import Link from 'next/link'
import { Edit2, Check, CheckCircle2, AlertCircle, LogOut, Clock } from 'lucide-react'
import { useAuth } from '@/app/auth-context'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { toast } from 'sonner'

export default function ProfilePage() {
  const { logout } = useAuth()
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [consent, setConsent] = useState({ dpdpAccepted: false, marketingOptIn: false })
  const [kycStatus, setKycStatus] = useState<'NOT_STARTED' | 'PENDING' | 'APPROVED' | 'REJECTED' | null>(null)
  const [kycSubmission, setKycSubmission] = useState<{ createdAt?: string; rejectionReason?: string; businessName?: string; gstin?: string; drugLicenseNumber?: string } | null>(null)
  const [profile, setProfile] = useState({
    shopName: 'Raj Retail Store',
    ownerName: 'Raj Kumar',
    phone: '9876543210',
    email: 'raj@retailstore.com',
    address: '123, Main Market, Delhi - 110001',
    city: 'Delhi',
    state: 'Delhi',
    pincode: '110001',
  })

  const handleLogout = () => {
    logout()
    router.push('/auth/login')
  }

  const handleProfileChange = (field: string, value: string) => {
    setProfile({ ...profile, [field]: value })
  }

  const handleSaveProfile = () => {
    setIsEditing(false)
    // API call would happen here
  }

  useEffect(() => {
    const loadConsent = async () => {
      try {
        const res = await api.get('/api/account/profile')
        const c = res.data?.data?.consent
        if (c) {
          setConsent({
            dpdpAccepted: Boolean(c.dpdpAccepted),
            marketingOptIn: Boolean(c.marketingOptIn),
          })
        }
      } catch {
        // ignore
      }
    }
    loadConsent().catch(() => undefined)
  }, [])

  useEffect(() => {
    const loadKyc = async () => {
      try {
        const res = await api.get('/api/kyc/status')
        const data = res.data?.data
        setKycStatus(data?.kycStatus || 'NOT_STARTED')
        setKycSubmission(data?.submission || null)
      } catch {
        setKycStatus('NOT_STARTED')
      }
    }
    loadKyc().catch(() => undefined)
  }, [])

  return (
    <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">My Profile</h1>
              <p className="text-muted-foreground mt-2">Manage your account settings</p>
            </div>
            <Button variant="outline" size="sm" className="bg-transparent gap-2" onClick={handleLogout}>
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>

          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="kyc">KYC Status</TabsTrigger>
              <TabsTrigger value="preferences">Preferences</TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile" className="space-y-6 mt-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                  <div>
                    <CardTitle>Business Information</CardTitle>
                    <CardDescription>Your shop details and contact information</CardDescription>
                  </div>
                  <Button
                    size="sm"
                    variant={isEditing ? 'default' : 'outline'}
                    onClick={() => (isEditing ? handleSaveProfile() : setIsEditing(true))}
                    className={isEditing ? '' : 'bg-transparent'}
                    gap="gap-2"
                  >
                    {isEditing ? (
                      <>
                        <Check className="w-4 h-4" />
                        Save Changes
                      </>
                    ) : (
                      <>
                        <Edit2 className="w-4 h-4" />
                        Edit
                      </>
                    )}
                  </Button>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="shopName">Shop Name</Label>
                      <Input
                        id="shopName"
                        value={profile.shopName}
                        onChange={(e) => handleProfileChange('shopName', e.target.value)}
                        disabled={!isEditing}
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="ownerName">Owner Name</Label>
                      <Input
                        id="ownerName"
                        value={profile.ownerName}
                        onChange={(e) => handleProfileChange('ownerName', e.target.value)}
                        disabled={!isEditing}
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        value={profile.phone}
                        onChange={(e) => handleProfileChange('phone', e.target.value)}
                        disabled={!isEditing}
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={profile.email}
                        onChange={(e) => handleProfileChange('email', e.target.value)}
                        disabled={!isEditing}
                        className="mt-2"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="address">Address</Label>
                      <Input
                        id="address"
                        value={profile.address}
                        onChange={(e) => handleProfileChange('address', e.target.value)}
                        disabled={!isEditing}
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        value={profile.city}
                        onChange={(e) => handleProfileChange('city', e.target.value)}
                        disabled={!isEditing}
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="state">State</Label>
                      <Input
                        id="state"
                        value={profile.state}
                        onChange={(e) => handleProfileChange('state', e.target.value)}
                        disabled={!isEditing}
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="pincode">Pincode</Label>
                      <Input
                        id="pincode"
                        value={profile.pincode}
                        onChange={(e) => handleProfileChange('pincode', e.target.value)}
                        disabled={!isEditing}
                        className="mt-2"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Password Change */}
              <Card>
                <CardHeader>
                  <CardTitle>Security</CardTitle>
                  <CardDescription>Change your password</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="current">Current Password</Label>
                    <Input id="current" type="password" className="mt-2" />
                  </div>
                  <div>
                    <Label htmlFor="new">New Password</Label>
                    <Input id="new" type="password" className="mt-2" />
                  </div>
                  <div>
                    <Label htmlFor="confirm">Confirm Password</Label>
                    <Input id="confirm" type="password" className="mt-2" />
                  </div>
                  <Button className="w-full">Update Password</Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* KYC Status Tab - dynamic from /api/kyc/status */}
            <TabsContent value="kyc" className="space-y-6 mt-6">
              {kycStatus === null && (
                <p className="text-sm text-muted-foreground">Loading KYC status...</p>
              )}
              {kycStatus === 'NOT_STARTED' && (
                <>
                  <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-950">
                    <Clock className="h-4 w-4 text-amber-600" />
                    <AlertDescription className="ml-2 text-amber-800 dark:text-amber-100">
                      Complete KYC to unlock full ordering capabilities including bulk orders and credit facilities.
                    </AlertDescription>
                  </Alert>
                  <Card>
                    <CardHeader>
                      <CardTitle>KYC Status</CardTitle>
                      <CardDescription>You have not started KYC verification</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button asChild>
                        <Link href="/retailer/kyc">Complete KYC</Link>
                      </Button>
                    </CardContent>
                  </Card>
                </>
              )}
              {kycStatus === 'PENDING' && (
                <>
                  <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-950">
                    <Clock className="h-4 w-4 text-amber-600" />
                    <AlertDescription className="ml-2 text-amber-800 dark:text-amber-100">
                      Your KYC is under review. We will notify you once verification is complete.
                    </AlertDescription>
                  </Alert>
                  <Card>
                    <CardHeader>
                      <CardTitle>KYC Status</CardTitle>
                      <CardDescription>Documents submitted – awaiting verification</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Badge variant="secondary">Pending</Badge>
                    </CardContent>
                  </Card>
                </>
              )}
              {kycStatus === 'REJECTED' && (
                <>
                  <Alert className="border-red-200 bg-red-50 dark:bg-red-950">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="ml-2 text-red-800 dark:text-red-100">
                      Your KYC application was rejected. Please review the reason and resubmit.
                    </AlertDescription>
                  </Alert>
                  <Card>
                    <CardHeader>
                      <CardTitle>Rejection Reason</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        {kycSubmission?.rejectionReason || 'KYC needs updates.'}
                      </p>
                      <Button asChild variant="outline">
                        <Link href="/retailer/kyc">Resubmit KYC</Link>
                      </Button>
                    </CardContent>
                  </Card>
                </>
              )}
              {kycStatus === 'APPROVED' && (
                <>
                  <Alert className="border-emerald-200 bg-emerald-50 dark:bg-emerald-950">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    <AlertDescription className="ml-2 text-emerald-800 dark:text-emerald-100">
                      Your KYC is verified and approved
                    </AlertDescription>
                  </Alert>
                  <Card>
                    <CardHeader>
                      <CardTitle>KYC Information</CardTitle>
                      <CardDescription>Your verified business details</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">KYC Status</p>
                          <p className="mt-1 font-semibold">Approved</p>
                          <Badge className="mt-2 bg-emerald-100 text-emerald-800">Verified</Badge>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Approval Date</p>
                          <p className="mt-1 font-semibold">
                            {kycSubmission?.createdAt
                              ? new Date(kycSubmission.createdAt).toLocaleDateString()
                              : '—'}
                          </p>
                        </div>
                        {(kycSubmission?.gstin || kycSubmission?.businessName) && (
                          <div className="col-span-2">
                            <p className="text-sm font-medium text-muted-foreground mb-2">Verified Details</p>
                            <div className="space-y-2">
                              {kycSubmission.gstin && (
                                <div className="flex items-center gap-2">
                                  <Check className="w-4 h-4 text-emerald-600" />
                                  <span className="text-sm">GST: {kycSubmission.gstin}</span>
                                </div>
                              )}
                              {kycSubmission.businessName && (
                                <div className="flex items-center gap-2">
                                  <Check className="w-4 h-4 text-emerald-600" />
                                  <span className="text-sm">{kycSubmission.businessName}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Update KYC Documents</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">
                        If your documents have expired or changed, you can update them from the KYC page.
                      </p>
                      <Button variant="outline" className="bg-transparent" asChild>
                        <Link href="/retailer/kyc">Update KYC Documents</Link>
                      </Button>
                    </CardContent>
                  </Card>
                </>
              )}
            </TabsContent>

            {/* Preferences Tab */}
            <TabsContent value="preferences" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Communication Preferences</CardTitle>
                  <CardDescription>Manage how you receive notifications</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">DPDP Consent</p>
                      <p className="text-sm text-muted-foreground">Allow processing of personal data</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={consent.dpdpAccepted}
                      onChange={(e) => setConsent({ ...consent, dpdpAccepted: e.target.checked })}
                      className="w-5 h-5"
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">Marketing Opt-in</p>
                      <p className="text-sm text-muted-foreground">Receive product updates</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={consent.marketingOptIn}
                      onChange={(e) => setConsent({ ...consent, marketingOptIn: e.target.checked })}
                      className="w-5 h-5"
                    />
                  </div>

                  <Button
                    onClick={async () => {
                      try {
                        await api.patch('/api/account/consent', {
                          consent: {
                            ...consent,
                            acceptedAt: new Date().toISOString(),
                            source: 'retailer_profile',
                          },
                        })
                        toast.success('Preferences saved')
                      } catch (error: any) {
                        toast.error(error?.response?.data?.error || 'Failed to save preferences')
                      }
                    }}
                  >
                    Save Preferences
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Account Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    Download My Data
                  </Button>
                  <Button variant="outline" className="w-full justify-start bg-transparent text-red-600 hover:text-red-700">
                    Deactivate Account
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
  )
}
