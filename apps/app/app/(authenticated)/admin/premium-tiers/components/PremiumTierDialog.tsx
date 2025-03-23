'use client'

import * as React from 'react'

import type { SerializedPremiumTier } from '@/types'
import { Button } from '@repo/design-system/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@repo/design-system/components/ui/dialog'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTrigger
} from '@repo/design-system/components/ui/drawer'
import { useMediaQuery } from '@repo/design-system/hooks/use-media-query'
import { title } from 'radash'
import { PremiumTierForm } from '../form'

interface PremiumTierDialogProps {
  mode?: 'create' | 'edit'
  premiumTier?: SerializedPremiumTier
}

export function PremiumTierDialog({ mode = 'create', premiumTier }: PremiumTierDialogProps) {
  const [open, setOpen] = React.useState(false)
  const isDesktop = useMediaQuery('(min-width: 768px)')

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button>{title(mode)} Premium Tier</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{title(mode)} a premium tier</DialogTitle>
          </DialogHeader>
          <PremiumTierForm {...{ setOpen, mode, premiumTier }} />
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button>{title(mode)} Premium Tier</Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DialogTitle>{title(mode)} a premium tier</DialogTitle>
        </DrawerHeader>
        <PremiumTierForm {...{ setOpen, mode, premiumTier }} />
        <DrawerFooter className="pt-2">
          <DrawerClose asChild>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
