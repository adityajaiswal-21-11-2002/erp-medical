'use client'

import React from "react"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, FileUp, ChevronRight } from 'lucide-react'

export type KycStep = 'shop-details' | 'address' | 'documents' | 'review' | 'completed'

interface KycWizardProps {
  initialStep?: KycStep
  onComplete?: () => void
  onSubmit?: (data: {
    shopName: string
    ownerName: string
    phone: string
    email: string
    pincode: string
    city: string
    state: string
    address: string
    gstNumber: string
    drugLicense: string
  }) => Promise<void>
}

export function KycWizard({ initialStep = 'shop-details', onComplete, onSubmit }: KycWizardProps) {
  const [currentStep, setCurrentStep] = useState<KycStep>(initialStep)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    shopName: '',
    ownerName: '',
    phone: '',
    email: '',
    pincode: '',
    city: '',
    state: '',
    address: '',
    gstNumber: '',
    drugLicense: '',
  })

  const steps: Array<{ id: KycStep; title: string; description: string }> = [
    { id: 'shop-details', title: 'Shop Details', description: 'Enter your shop information' },
    { id: 'address', title: 'Address & Delivery', description: 'Provide delivery address' },
    { id: 'documents', title: 'Documents', description: 'Upload verification documents' },
    { id: 'review', title: 'Review & Submit', description: 'Confirm your information' },
  ]

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleNext = async () => {
    const stepIndex = steps.findIndex((s) => s.id === currentStep)
    if (stepIndex < steps.length - 1) {
      setCurrentStep(steps[stepIndex + 1].id)
      return
    }
    if (currentStep === "review") {
      if (onSubmit) {
        setIsSubmitting(true)
        try {
          await onSubmit(formData)
          setCurrentStep("completed")
          onComplete?.()
        } finally {
          setIsSubmitting(false)
        }
      } else {
        setCurrentStep("completed")
        onComplete?.()
      }
    }
  }

  const handlePrev = () => {
    const stepIndex = steps.findIndex((s) => s.id === currentStep)
    if (stepIndex > 0) {
      setCurrentStep(steps[stepIndex - 1].id)
    }
  }

  if (currentStep === 'completed') {
    return (
      <Card>
        <CardContent className="pt-12 text-center">
          <CheckCircle2 className="w-16 h-16 text-emerald-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">KYC Submitted Successfully!</h3>
          <p className="text-muted-foreground mb-6">
            Your documents are under review. We will notify you once verification is complete.
          </p>
          <Badge variant="secondary" className="mb-4">Pending Review</Badge>
          <p className="text-sm text-muted-foreground">Expected completion: 2-3 business days</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Progress Indicator */}
      <div className="flex justify-between items-center">
        {steps.map((step, index) => (
          <div key={step.id} className="flex flex-col items-center flex-1">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
              steps.findIndex((s) => s.id === currentStep) >= index
                ? 'bg-emerald-600 text-white'
                : 'bg-muted text-muted-foreground'
            }`}>
              {index + 1}
            </div>
            <p className="text-xs mt-2 font-medium text-center">{step.title}</p>
            {index < steps.length - 1 && (
              <div className={`w-full h-0.5 mt-4 ${
                steps.findIndex((s) => s.id === currentStep) > index ? 'bg-emerald-600' : 'bg-muted'
              }`} />
            )}
          </div>
        ))}
      </div>

      {/* Form Content */}
      <Card>
        <CardHeader>
          <CardTitle>{steps.find((s) => s.id === currentStep)?.title}</CardTitle>
          <CardDescription>{steps.find((s) => s.id === currentStep)?.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {currentStep === 'shop-details' && (
            <>
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="shopName">Shop Name *</Label>
                  <Input id="shopName" name="shopName" value={formData.shopName} onChange={handleInputChange} placeholder="Enter shop name" />
                </div>
                <div>
                  <Label htmlFor="ownerName">Owner Name *</Label>
                  <Input id="ownerName" name="ownerName" value={formData.ownerName} onChange={handleInputChange} placeholder="Full name" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone">Phone *</Label>
                    <Input id="phone" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="10-digit number" />
                  </div>
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} placeholder="your@email.com" />
                  </div>
                </div>
              </div>
            </>
          )}

          {currentStep === 'address' && (
            <>
              <div className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="pincode">Pincode *</Label>
                    <Input id="pincode" name="pincode" value={formData.pincode} onChange={handleInputChange} placeholder="6-digit pincode" />
                  </div>
                  <div>
                    <Label htmlFor="state">State *</Label>
                    <Input id="state" name="state" value={formData.state} onChange={handleInputChange} placeholder="State" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="city">City *</Label>
                  <Input id="city" name="city" value={formData.city} onChange={handleInputChange} placeholder="City" />
                </div>
                <div>
                  <Label htmlFor="address">Full Address *</Label>
                  <Textarea id="address" name="address" value={formData.address} onChange={handleInputChange} placeholder="Complete address" rows={3} />
                </div>
              </div>
            </>
          )}

          {currentStep === 'documents' && (
            <>
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="gstNumber">GST Number *</Label>
                  <Input id="gstNumber" name="gstNumber" value={formData.gstNumber} onChange={handleInputChange} placeholder="15-digit GST number" />
                </div>
                <div>
                  <Label htmlFor="drugLicense">Drug License Number *</Label>
                  <Input id="drugLicense" name="drugLicense" value={formData.drugLicense} onChange={handleInputChange} placeholder="License number" />
                </div>
                <div className="space-y-3 pt-2">
                  <div>
                    <Label>Upload GST Certificate</Label>
                    <div className="mt-2 border-2 border-dashed rounded-lg p-6 text-center hover:bg-muted/50 cursor-pointer transition">
                      <FileUp className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm font-medium">Click to upload or drag and drop</p>
                      <p className="text-xs text-muted-foreground">PDF, JPG (max 5MB)</p>
                    </div>
                  </div>
                  <div>
                    <Label>Upload Drug License</Label>
                    <div className="mt-2 border-2 border-dashed rounded-lg p-6 text-center hover:bg-muted/50 cursor-pointer transition">
                      <FileUp className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm font-medium">Click to upload or drag and drop</p>
                      <p className="text-xs text-muted-foreground">PDF, JPG (max 5MB)</p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {currentStep === 'review' && (
            <>
              <div className="space-y-4 bg-muted/50 p-4 rounded-lg">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Shop Name</p>
                    <p className="text-sm font-semibold mt-1">{formData.shopName || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Owner Name</p>
                    <p className="text-sm font-semibold mt-1">{formData.ownerName || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Phone</p>
                    <p className="text-sm font-semibold mt-1">{formData.phone || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Email</p>
                    <p className="text-sm font-semibold mt-1">{formData.email || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Address</p>
                    <p className="text-sm font-semibold mt-1">{formData.address || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">GST Number</p>
                    <p className="text-sm font-semibold mt-1">{formData.gstNumber || 'Not provided'}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-2 p-3 bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 rounded-lg">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-emerald-800 dark:text-emerald-200">
                  By submitting, you confirm that all information is accurate and complete.
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex justify-between gap-4">
        <Button
          variant="outline"
          onClick={handlePrev}
          disabled={currentStep === 'shop-details'}
          className="bg-transparent"
        >
          Previous
        </Button>
        <Button onClick={handleNext} className="gap-2" disabled={isSubmitting}>
          {currentStep === 'review'
            ? isSubmitting
              ? 'Submitting...'
              : 'Submit KYC'
            : 'Next'}
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}
