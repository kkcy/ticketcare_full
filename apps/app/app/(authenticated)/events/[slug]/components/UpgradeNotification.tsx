'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@repo/design-system/components/ui/dialog';
import { Button } from '@repo/design-system/components/ui/button';
import { StarIcon, CheckCircleIcon, XCircleIcon } from '@repo/design-system/components/icons';

export function UpgradeNotification() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [showCancelledDialog, setShowCancelledDialog] = useState(false);

  useEffect(() => {
    const upgradeSuccess = searchParams.get('upgrade_success');
    const upgradeCancelled = searchParams.get('upgrade_cancelled');

    // If no upgrade parameters, do nothing
    if (!upgradeSuccess && !upgradeCancelled) {
      return;
    }

    // Clean up URL by removing query parameters
    const url = new URL(window.location.href);
    url.search = '';
    window.history.replaceState({}, '', url.toString());

    // Handle upgrade success
    if (upgradeSuccess === 'true') {
      setShowSuccessDialog(true);
    }
    // Handle upgrade cancellation
    else if (upgradeCancelled === 'true') {
      setShowCancelledDialog(true);
    }
  }, [searchParams]);

  const handleSuccessClose = () => {
    setShowSuccessDialog(false);
    // Refresh the page to show updated event data
    router.refresh();
  };

  const handleCancelledClose = () => {
    setShowCancelledDialog(false);
  };

  return (
    <>
      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <StarIcon className="h-5 w-5 text-amber-500" />
              Premium Upgrade Successful
            </DialogTitle>
            <DialogDescription>
              Your event has been successfully upgraded to premium status.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center py-4">
            <div className="rounded-full bg-green-50 p-3">
              <CheckCircleIcon className="h-10 w-10 text-green-500" />
            </div>
          </div>
          <div className="text-center text-sm">
            <p>Your event now has increased ticket sales capacity and premium features.</p>
            <p className="mt-2 text-muted-foreground">The page will refresh to show your updated event information.</p>
          </div>
          <DialogFooter>
            <Button onClick={handleSuccessClose} className="w-full sm:w-auto">
              Continue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancelled Dialog */}
      <Dialog open={showCancelledDialog} onOpenChange={setShowCancelledDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <XCircleIcon className="h-5 w-5 text-red-500" />
              Premium Upgrade Not Completed
            </DialogTitle>
            <DialogDescription>
              Your premium upgrade was cancelled or the payment failed.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center py-4">
            <div className="rounded-full bg-red-50 p-3">
              <XCircleIcon className="h-10 w-10 text-red-500" />
            </div>
          </div>
          <div className="text-center text-sm">
            <p>Your event remains in its current state. You can try upgrading again from the event dashboard.</p>
            <p className="mt-2 text-muted-foreground">If you were charged but the upgrade failed, please contact support.</p>
          </div>
          <DialogFooter>
            <Button onClick={handleCancelledClose} variant="outline" className="w-full sm:w-auto">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
