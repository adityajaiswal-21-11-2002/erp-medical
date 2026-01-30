'use client'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Copy } from 'lucide-react'

interface DemoCredentialsProps {
  credentials: Record<string, string>
  onFill?: (creds: Record<string, string>) => void
}

export function DemoCredentials({
  credentials,
  onFill,
}: DemoCredentialsProps) {
  const handleCopy = (value: string) => {
    navigator.clipboard.writeText(value)
  }

  return (
    <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800">
      <AlertDescription className="space-y-3">
        <div className="flex items-center gap-2">
          <Badge variant="secondary">Demo Mode</Badge>
          <span className="text-sm font-medium">Use these credentials to explore</span>
        </div>

        <div className="grid gap-2 text-sm">
          {Object.entries(credentials).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground capitalize">
                  {key.replace(/_/g, ' ')}:
                </p>
                <p className="text-muted-foreground font-mono">{value}</p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleCopy(value)}
                title="Copy to clipboard"
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>

        {onFill && (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="w-full"
            onClick={() => onFill(credentials)}
          >
            Auto-fill Demo Credentials
          </Button>
        )}
      </AlertDescription>
    </Alert>
  )
}
