'use client'

import type { SerializedPremiumTier } from '@/types'
import { Loader2 } from '@repo/design-system/components/icons'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@repo/design-system/components/ui/alert-dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@repo/design-system/components/ui/select'
import { useState } from 'react'
import { updatePremiumTier } from '../actions'

interface PremiumTierStatusProps {
  premiumTier: SerializedPremiumTier
}

export function PremiumTierStatus({ premiumTier }: PremiumTierStatusProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleStatusChange = (newStatus: string) => {
    setSelectedStatus(newStatus)
    setIsOpen(true)
  }

  const handleConfirm = async () => {
    if (selectedStatus) {
      setIsLoading(true)

      try {
        if (premiumTier.id) {
          await updatePremiumTier(premiumTier.id, { isActive: selectedStatus === 'active' })
        }
      } finally {
        setIsLoading(false)
        setIsOpen(false)
      }
    }
  }

  return (
    <>
      <Select
        value={premiumTier.isActive ? 'active' : 'inactive'}
        onValueChange={handleStatusChange}
        disabled={isLoading}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select status" />
          {isLoading && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="active">Active</SelectItem>
          <SelectItem value="inactive">Inactive</SelectItem>
        </SelectContent>
      </Select>

      <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Change Premium Tier Status</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to change the premium tier status to {selectedStatus}? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirm} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                'Continue'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
