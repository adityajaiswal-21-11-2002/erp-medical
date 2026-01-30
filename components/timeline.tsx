'use client'

import { Check, Circle } from 'lucide-react'

export interface TimelineItem {
  id: string
  label: string
  description?: string
  timestamp?: string
  completed: boolean
}

interface TimelineProps {
  items: TimelineItem[]
}

export function Timeline({ items }: TimelineProps) {
  return (
    <div className="space-y-4">
      {items.map((item, index) => (
        <div key={item.id} className="flex gap-4">
          <div className="flex flex-col items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                item.completed
                  ? 'bg-primary/10 border-primary'
                  : 'bg-muted border-muted-foreground'
              }`}
            >
              {item.completed ? (
                <Check className="w-5 h-5 text-primary" />
              ) : (
                <Circle className="w-4 h-4 text-muted-foreground" />
              )}
            </div>
            {index < items.length - 1 && (
              <div className="w-0.5 h-12 bg-border mt-2" />
            )}
          </div>
          <div className="flex-1 pb-4">
            <h4
              className={`font-semibold text-sm ${
                item.completed ? 'text-foreground' : 'text-muted-foreground'
              }`}
            >
              {item.label}
            </h4>
            {item.description && (
              <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
            )}
            {item.timestamp && (
              <p className="text-xs text-muted-foreground mt-1">{item.timestamp}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
