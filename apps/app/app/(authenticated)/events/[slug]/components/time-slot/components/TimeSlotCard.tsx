'use client';

import { formatTime } from '@/app/util';
import { ClockIcon, TrashIcon } from '@repo/design-system/components/icons';
import { Button } from '@repo/design-system/components/ui/button';
import { toast } from '@repo/design-system/components/ui/sonner';
import { useState } from 'react';
import { removeTimeSlot } from '../action';

interface TimeSlotCardProps {
  timeSlot: {
    id: string;
    startTime: string | Date;
    endTime: string | Date;
    doorsOpen?: string | Date | null;
  };
  onRemove?: (id: string) => void;
}

export function TimeSlotCard({ timeSlot, onRemove }: TimeSlotCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleRemove = async () => {
    if (isDeleting) {
      return;
    }

    try {
      setIsDeleting(true);

      // Call the server action to remove the time slot
      const result = await removeTimeSlot(timeSlot.id);

      if (result.success) {
        toast.success('Time slot removed successfully');

        // Call the onRemove callback if provided
        if (onRemove) {
          onRemove(timeSlot.id);
        }
      } else {
        toast.error(result.error || 'Failed to remove time slot');
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Something went wrong';
      console.error('Failed to remove time slot:', error);
      toast.error(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="rounded bg-muted/50 p-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ClockIcon className="h-4 w-4 text-muted-foreground" />
          <div>
            <p className="font-medium text-sm">
              {formatTime(timeSlot.startTime)} - {formatTime(timeSlot.endTime)}
            </p>
            {timeSlot.doorsOpen && (
              <p className="text-muted-foreground text-xs">
                Doors open: {formatTime(timeSlot.doorsOpen)}
              </p>
            )}
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-muted-foreground hover:text-destructive"
          onClick={handleRemove}
          disabled={isDeleting}
          title="Remove time slot"
        >
          <TrashIcon
            className={`h-3.5 w-3.5 ${isDeleting ? 'animate-spin' : ''}`}
          />
        </Button>
      </div>
    </div>
  );
}
