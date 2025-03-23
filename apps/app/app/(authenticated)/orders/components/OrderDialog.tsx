'use client';
import type { PrismaNamespace } from '@repo/database';
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
import { useMediaQuery } from '@repo/design-system/hooks/use-media-query';
import * as React from 'react';
import { OrderForm } from '../form';

interface OrderDialogProps {
  mode?: 'create' | 'edit';
  order?: PrismaNamespace.OrderGetPayload<{ include: { user: true } }>;
}

function title(mode: 'create' | 'edit') {
  return mode === 'create' ? 'Create' : 'Edit';
}

export function OrderDialog({ mode = 'create', order }: OrderDialogProps) {
  const [open, setOpen] = React.useState(false);
  const isDesktop = useMediaQuery('(min-width: 768px)');

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button>{title(mode)} Order</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{title(mode)} an order</DialogTitle>
          </DialogHeader>
          <OrderForm {...{ setOpen, mode, order }} />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button>{title(mode)} Order</Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DialogTitle>{title(mode)} an order</DialogTitle>
        </DrawerHeader>
        <OrderForm {...{ setOpen, mode, order }} />
        <DrawerFooter className="pt-2">
          <DrawerClose asChild>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
