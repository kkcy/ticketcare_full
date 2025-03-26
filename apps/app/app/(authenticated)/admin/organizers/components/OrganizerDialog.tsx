'use client';

import * as React from 'react';

import { useIsDesktop } from '@/app/hooks/useIsDesktop';
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
import type { SerializedOrganizer } from '../../../../../types';
import { OrganizerForm } from '../form';

interface OrganizerDialogProps {
  mode?: 'create' | 'edit';
  organizer?: SerializedOrganizer;
}

export function OrganizerDialog({
  mode = 'create',
  organizer,
}: OrganizerDialogProps) {
  const [open, setOpen] = React.useState(false);
  const isDesktop = useIsDesktop();

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button>{title(mode)} Organizer</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{title(mode)} an organizer</DialogTitle>
          </DialogHeader>
          <OrganizerForm {...{ setOpen, mode, organizer }} />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button>{title(mode)} Organizer</Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DialogTitle>{title(mode)} an organizer</DialogTitle>
        </DrawerHeader>
        <OrganizerForm {...{ setOpen, mode, organizer }} />
        <DrawerFooter className="pt-2">
          <DrawerClose asChild>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
