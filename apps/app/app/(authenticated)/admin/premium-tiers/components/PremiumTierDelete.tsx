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
import { useState } from 'react'
import { deletePremiumTier } from '../actions'
import { Button } from '@repo/design-system/components/ui/button'

interface PremiumTierDeleteProps {
  premiumTier: SerializedPremiumTier
}

export function PremiumTierDelete({ premiumTier }: PremiumTierDeleteProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleDelete = () => {
    setIsOpen(true)
  }

  const handleConfirm = async () => {
    if (premiumTier.id) {
      setIsLoading(true)

      try {
        if (premiumTier.id) {
          await deletePremiumTier(premiumTier.id)
        }
      } finally {
        setIsLoading(false)
        setIsOpen(false)
      }
    }
  }

  return (
    <>
      <Button variant="destructive" onClick={handleDelete}>Delete</Button>

      <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Premium Tier</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this premium tier? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirm} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
