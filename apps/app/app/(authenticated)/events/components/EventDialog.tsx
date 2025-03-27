'use client';

import * as React from 'react';

import { useIsDesktop } from '@/app/hooks/useIsDesktop';
import { useIsPastEvent } from '@/app/hooks/useIsPastEvent';
import type { SerializedEvent } from '@/types';
import { Button } from '@repo/design-system/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@repo/design-system/components/ui/dialog';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTrigger,
} from '@repo/design-system/components/ui/drawer';
import { title } from 'radash';
import { EventForm } from '../form';

interface EventDialogProps {
  mode?: 'create' | 'edit';
  event?: SerializedEvent;
}

export function EventDialog({ mode = 'create', event }: EventDialogProps) {
  const isDesktop = useIsDesktop();
  const isPast = useIsPastEvent(event?.startTime);

  const [open, setOpen] = React.useState(false);

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button disabled={mode === 'edit' && isPast}>
            {title(mode)} Event
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{title(mode)} an event</DialogTitle>
          </DialogHeader>
          <EventForm {...{ setOpen, mode, event }} />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button>{title(mode)} Event</Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DialogTitle>{title(mode)} an event</DialogTitle>
        </DrawerHeader>
        <EventForm {...{ setOpen, mode, event }} />
        <DrawerFooter className="pt-2">
          <DrawerClose asChild>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
