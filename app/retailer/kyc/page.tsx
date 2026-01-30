'use client'

import { AuthGate } from '@/components/auth-gate'
import { RetailerLayout } from '@/components/retailer-layout'
import { KycWizard } from '@/components/kyc-wizard'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle2, AlertCircle, Clock } from 'lucide-react'
import { Timeline, TimelineItem } from '@/components/timeline'
import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { toast } from 'sonner'

export default function RetailerKycPage() {
  const [kycStatus, setKycStatus] = useState<'pending' | 'approved' | 'rejected' | 'not_started'>(
    'not_started',
  )
  const [submission, setSubmission] = useState<any>(null)

  useEffect(() => {
    const fetchStatus = async () => {
      const res = await api.get('/api/kyc/status')
      const status = res.data?.data?.kycStatus || 'NOT_STARTED'
      const mapped =
        status === 'APPROVED'
          ? 'approved'
          : status === 'REJECTED'
            ? 'rejected'
            : status === 'PENDING'
              ? 'pending'
              : 'not_started'
      setKycStatus(mapped)
      setSubmission(res.data?.data?.submission || null)
    }
    fetchStatus().catch(() => undefined)
  }, [])

  const timelineItems: TimelineItem[] = [
    {
      id: '1',
      label: 'KYC Submitted',
      timestamp: submission?.createdAt
        ? new Date(submission.createdAt).toLocaleString()
        : 'Pending',
      completed: kycStatus !== 'not_started',
    },
    {
      id: '2',
      label: 'Documents Verification',
      description: 'Our team is reviewing your submitted documents',
      completed: kycStatus !== 'pending',
    },
    {
      id: '3',
      label: 'KYC Approved',
      completed: kycStatus === 'approved',
    },
  ]

  if (kycStatus === 'approved') {
    return (
      <AuthGate requiredAccountType="RETAILER">
        <RetailerLayout>
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold">KYC Verification</h1>
              <p className="text-muted-foreground mt-2">Your account has been verified</p>
            </div>

            <Alert className="border-emerald-200 bg-emerald-50 dark:bg-emerald-950">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <AlertDescription className="ml-2 text-emerald-800 dark:text-emerald-100">
                Your KYC has been approved! You now have full access to ordering and all platform features.
              </AlertDescription>
            </Alert>

            <Card>
              <CardHeader>
                <CardTitle>KYC Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-medium">Status</p>
                    <p className="text-sm text-muted-foreground">Account Verified</p>
                  </div>
                  <Badge className="bg-emerald-600">Approved</Badge>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="font-medium text-sm mb-2">Approval Timeline</p>
                  <Timeline items={timelineItems} />
                </div>
              </CardContent>
            </Card>
          </div>
        </RetailerLayout>
      </AuthGate>
    )
  }

  if (kycStatus === 'rejected') {
    return (
      <AuthGate requiredAccountType="RETAILER">
        <RetailerLayout>
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold">KYC Verification</h1>
              <p className="text-muted-foreground mt-2">Your verification was not approved</p>
            </div>

            <Alert className="border-red-200 bg-red-50 dark:bg-red-950">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="ml-2 text-red-800 dark:text-red-100">
                Your KYC application was rejected. Please review the reason below and resubmit.
              </AlertDescription>
            </Alert>

            <Card className="border-red-200">
              <CardHeader>
                <CardTitle>Rejection Reason</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-red-50 dark:bg-red-950 rounded-lg border border-red-200 dark:border-red-800">
                  <p className="font-medium text-red-900 dark:text-red-100 mb-2">
                    {submission?.rejectionReason || 'KYC needs updates'}
                  </p>
                  <p className="text-sm text-red-800 dark:text-red-200">
                    Please review your documents and resubmit.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Resubmit KYC</CardTitle>
                <CardDescription>Please correct the issues and resubmit your documents</CardDescription>
              </CardHeader>
              <CardContent>
                <KycWizard
                  initialStep="documents"
                  onSubmit={async (data) => {
                    await api.post('/api/kyc/submit', {
                      businessName: data.shopName,
                      gstin: data.gstNumber,
                      drugLicenseNumber: data.drugLicense,
                      address: data.address,
                      documents: [],
                    })
                    toast.success('KYC submitted')
                  }}
                />
              </CardContent>
            </Card>
          </div>
        </RetailerLayout>
      </AuthGate>
    )
  }

  // Pending status (default)
  return (
    <AuthGate requiredAccountType="RETAILER">
      <RetailerLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Complete Your KYC</h1>
            <p className="text-muted-foreground mt-2">Help us verify your business details</p>
          </div>

          <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-950">
            <Clock className="h-4 w-4 text-amber-600" />
            <AlertDescription className="ml-2 text-amber-800 dark:text-amber-100">
              Complete KYC to unlock full ordering capabilities including bulk orders and credit facilities.
            </AlertDescription>
          </Alert>

          <Card>
            <CardHeader>
              <CardTitle>KYC Application</CardTitle>
              <CardDescription>Fill in your details step by step</CardDescription>
            </CardHeader>
            <CardContent>
              <KycWizard
                onSubmit={async (data) => {
                  await api.post('/api/kyc/submit', {
                    businessName: data.shopName,
                    gstin: data.gstNumber,
                    drugLicenseNumber: data.drugLicense,
                    address: data.address,
                    documents: [],
                  })
                  toast.success('KYC submitted')
                }}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Verification Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <Timeline items={timelineItems} />
            </CardContent>
          </Card>
        </div>
      </RetailerLayout>
    </AuthGate>
  )
}
