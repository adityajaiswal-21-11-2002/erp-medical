"use client"

import * as React from "react"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { Button } from "@/components/ui/button"
import { useIsMobile } from "@/hooks/use-mobile"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

export interface DetailDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  children: React.ReactNode
  onCloseLabel?: string
  actions?: React.ReactNode
  className?: string
}

/** Desktop: dialog. Mobile: drawer from bottom. Use for detail/read views. */
export function DetailDrawer({
  open,
  onOpenChange,
  title,
  description,
  children,
  onCloseLabel = "Close",
  actions,
  className,
}: DetailDrawerProps) {
  const isMobile = useIsMobile()

  const content = (
    <>
      <div className={cn("overflow-auto px-4 pb-4 md:px-6 md:pb-6", className)}>
        {children}
      </div>
      <DrawerFooter className="flex-row gap-2 justify-end border-t border-border pt-4">
        {actions}
        <DrawerClose asChild>
          <Button variant="outline" aria-label={onCloseLabel}>
            {onCloseLabel}
          </Button>
        </DrawerClose>
      </DrawerFooter>
    </>
  )

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="max-h-[90vh] border-t border-border">
          <DrawerHeader className="text-left">
            <DrawerTitle className="text-lg font-semibold">{title}</DrawerTitle>
            {description && (
              <DrawerDescription className="text-sm text-muted-foreground">
                {description}
              </DrawerDescription>
            )}
          </DrawerHeader>
          {content}
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && (
            <DialogDescription>{description}</DialogDescription>
          )}
        </DialogHeader>
        <div className="overflow-auto flex-1 min-h-0">{children}</div>
        <DialogFooter className="flex gap-2 border-t border-border pt-4">
          {actions}
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {onCloseLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
