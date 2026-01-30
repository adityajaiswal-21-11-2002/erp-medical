"use client"

import React from "react"

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

interface DrawerPanelProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  children: React.ReactNode
  onCloseLabel?: string
  actions?: React.ReactNode
}

export function DrawerPanel({
  open,
  onOpenChange,
  title,
  description,
  children,
  onCloseLabel = "Close",
  actions,
}: DrawerPanelProps) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[90vh]">
        <DrawerHeader>
          <DrawerTitle>{title}</DrawerTitle>
          {description && <DrawerDescription>{description}</DrawerDescription>}
        </DrawerHeader>
        <div className="px-4 pb-4 overflow-auto">{children}</div>
        <DrawerFooter>
          {actions}
          <DrawerClose asChild>
            <Button variant="outline">{onCloseLabel}</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
