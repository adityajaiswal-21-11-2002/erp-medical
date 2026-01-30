'use client'

import React from "react"

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Minus, Plus } from 'lucide-react'

interface QuantityStepperProps {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  disabled?: boolean
}

export function QuantityStepper({ value, onChange, min = 1, max = 999, disabled = false }: QuantityStepperProps) {
  const handleDecrement = () => {
    if (value > min) onChange(value - 1)
  }

  const handleIncrement = () => {
    if (value < max) onChange(value + 1)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const num = parseInt(e.target.value, 10)
    if (!isNaN(num) && num >= min && num <= max) {
      onChange(num)
    }
  }

  return (
    <div className="flex items-center gap-1 border rounded-md w-fit">
      <Button
        size="sm"
        variant="ghost"
        onClick={handleDecrement}
        disabled={disabled || value <= min}
        className="h-8 w-8 p-0"
      >
        <Minus className="w-4 h-4" />
      </Button>
      <Input
        type="number"
        value={value}
        onChange={handleInputChange}
        disabled={disabled}
        className="h-8 w-12 text-center border-0 focus-visible:ring-0 px-1"
        min={min}
        max={max}
      />
      <Button
        size="sm"
        variant="ghost"
        onClick={handleIncrement}
        disabled={disabled || value >= max}
        className="h-8 w-8 p-0"
      >
        <Plus className="w-4 h-4" />
      </Button>
    </div>
  )
}
