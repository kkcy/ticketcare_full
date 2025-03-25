'use client';

import { updateOrganizer } from '@/app/(authenticated)/admin/organizers/actions';
import type { PrismaNamespace } from '@repo/database';
import { Pencil } from '@repo/design-system/components/icons';
import { Button } from '@repo/design-system/components/ui/button';
import {} from '@repo/design-system/components/ui/card';
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
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  useForm,
} from '@repo/design-system/components/ui/form';
import { toast } from '@repo/design-system/components/ui/sonner';
import { Switch } from '@repo/design-system/components/ui/switch';
import { useMediaQuery } from '@repo/design-system/hooks/use-media-query';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface OrganizerNotificationProps {
  organizer: PrismaNamespace.Organizer;
}

function OrganizerNotificationForm({ organizer }: OrganizerNotificationProps) {
  const router = useRouter();

  const form = useForm<PrismaNamespace.OrganizerUncheckedUpdateInput>({
    defaultValues: {
      emailNotifications: organizer.emailNotifications,
      smsNotifications: organizer.smsNotifications,
      pushNotifications: organizer.pushNotifications,
    },
  });

  async function onSubmit(
    values: PrismaNamespace.OrganizerUncheckedUpdateInput
  ) {
    try {
      await updateOrganizer(organizer.id, values);
      toast.success('Notification preferences updated successfully');

      router.refresh();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Something went wrong';

      toast.error(errorMessage);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <h3 className="font-medium text-lg">Notification Preferences</h3>

        <FormField
          control={form.control}
          name="emailNotifications"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Email Notifications</FormLabel>
                <FormDescription>
                  Receive notifications via email
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="smsNotifications"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">SMS Notifications</FormLabel>
                <FormDescription>Receive notifications via SMS</FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="pushNotifications"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Push Notifications</FormLabel>
                <FormDescription>Receive push notifications</FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-full"
          disabled={form.formState.isSubmitting}
        >
          Save
        </Button>
      </form>
    </Form>
  );
}

export function OrganizerNotification({
  organizer,
}: OrganizerNotificationProps) {
  const [open, setOpen] = useState(false);
  const isDesktop = useMediaQuery('(min-width: 768px)');

  return isDesktop ? (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Pencil className="mr-2 h-4 w-4" />
          Edit Notification Preferences
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Notification Preferences</DialogTitle>
        </DialogHeader>
        <OrganizerNotificationForm organizer={organizer} />
      </DialogContent>
    </Dialog>
  ) : (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button size="sm" variant="outline">
          <Pencil className="mr-2 h-4 w-4" />
          Edit Notification Preferences
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DialogTitle>Edit Notification Preferences</DialogTitle>
        </DrawerHeader>
        <OrganizerNotificationForm organizer={organizer} />
        <DrawerFooter className="pt-2">
          <DrawerClose asChild>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
