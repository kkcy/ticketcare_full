'use client';

import { useIsPastEvent } from '@/app/hooks/useIsPastEvent';
import type { SerializedEvent } from '@/types';
import { Loader2 } from '@repo/design-system/components/icons';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@repo/design-system/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/design-system/components/ui/select';
import { useState } from 'react';
import { updateEventStatus } from '../actions';

interface EventStatusProps {
  event: SerializedEvent;
}

export function EventStatus({ event }: EventStatusProps) {
  const isPast = useIsPastEvent(event.startTime);

  const [isOpen, setIsOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleStatusChange = (newStatus: string) => {
    setSelectedStatus(newStatus);
    setIsOpen(true);
  };

  const handleConfirm = async () => {
    if (selectedStatus) {
      setIsLoading(true);

      try {
        if (event.slug) {
          await updateEventStatus(
            event.slug,
            selectedStatus as 'draft' | 'published' | 'cancelled' | 'sold_out'
          );
        }
      } finally {
        setIsLoading(false);
        setIsOpen(false);
      }
    }
  };

  return (
    <>
      <Select
        value={isPast ? 'past' : event.status}
        onValueChange={handleStatusChange}
        disabled={isLoading || isPast}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select status" />
          {isLoading && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="draft">Draft</SelectItem>
          <SelectItem value="published">Published</SelectItem>
          <SelectItem value="cancelled">Cancelled</SelectItem>
          <SelectItem value="sold_out">Sold Out</SelectItem>
          {isPast && <SelectItem value="past">Past</SelectItem>}
        </SelectContent>
      </Select>

      <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Change Event Status</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to change the event status to{' '}
              {selectedStatus}? This action cannot be undone.
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
  );
}
