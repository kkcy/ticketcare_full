'use client';

import { useIsPastEvent } from '@/app/hooks/useIsPastEvent';
import type { SerializedEvent } from '@/types';
import { Edit } from '@repo/design-system/components/icons';
import { Button } from '@repo/design-system/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@repo/design-system/components/ui/dialog';
import { title } from 'radash';
import React from 'react';
import { CreateTicketTypeForm } from './CreateTicketTypeForm';
import { EditTicketTypeForm } from './EditTicketTypeForm';

interface TicketTypeDialogProps {
  eventId: string;
  slug: string;
  startTime?: string;
  endTime?: string;
  ticketType?: SerializedEvent['ticketTypes'][number];
  mode?: 'create' | 'edit';
}

export function TicketTypeDialog({
  eventId,
  slug,
  startTime,
  endTime,
  ticketType,
  mode = 'create',
}: TicketTypeDialogProps) {
  const isPast = useIsPastEvent(startTime);
  const [open, setOpen] = React.useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          disabled={isPast}
          variant={mode === 'edit' ? 'outline' : 'default'}
        >
          {mode === 'edit' && <Edit />}
          {title(mode)} Ticket Type
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{title(mode)} Ticket Type</DialogTitle>
          <DialogDescription>
            {mode === 'create'
              ? 'Create a new ticket type for this event.'
              : 'Edit the selected ticket type.'}
          </DialogDescription>
        </DialogHeader>

        {mode === 'create' ? (
          <CreateTicketTypeForm
            setOpen={setOpen}
            eventId={eventId}
            slug={slug}
            startTime={startTime}
            endTime={endTime}
          />
        ) : (
          ticketType && (
            <EditTicketTypeForm
              setOpen={setOpen}
              ticketType={ticketType}
              eventId={eventId}
              slug={slug}
            />
          )
        )}
      </DialogContent>
    </Dialog>
  );
}
