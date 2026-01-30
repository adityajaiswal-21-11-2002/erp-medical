'use client'

import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp'

interface OTPInputProps {
  value: string
  onChange: (value: string) => void
  error?: string
}

export function OTPInput({ value, onChange, error }: OTPInputProps) {
  return (
    <div className="space-y-3">
      <div className="flex justify-center">
        <InputOTP
          maxLength={6}
          value={value}
          onChange={onChange}
        >
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
            <InputOTPSlot index={3} />
            <InputOTPSlot index={4} />
            <InputOTPSlot index={5} />
          </InputOTPGroup>
        </InputOTP>
      </div>
      {error && (
        <p className="text-xs text-center text-red-500">{error}</p>
      )}
    </div>
  )
}
