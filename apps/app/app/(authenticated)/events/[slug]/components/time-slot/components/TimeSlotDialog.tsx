'use client';

import type { SerializedEvent } from '@/types';
import { zodResolver } from '@hookform/resolvers/zod';
import type { PrismaNamespace } from '@repo/database';
import { PlusIcon } from '@repo/design-system/components/icons';
import { Button } from '@repo/design-system/components/ui/button';
import { DatetimePicker } from '@repo/design-system/components/ui/datetime-picker';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@repo/design-system/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  useForm,
} from '@repo/design-system/components/ui/form';
import { toast } from '@repo/design-system/components/ui/sonner';
import { format } from 'date-fns';
import { useState } from 'react';
import { z } from 'zod';
import { createTimeSlot } from '../action';

interface TimeSlotDialogProps {
  eventDate: SerializedEvent['eventDates'][number];
}

// Schema for time slot creation
const timeSlotFormSchema = z.object({
  startTime: z.date({
    required_error: 'Start time is required',
  }),
  endTime: z.date({
    required_error: 'End time is required',
  }),
  doorsOpen: z.date({
    required_error: 'Doors open time is required',
  }),
});
type TimeSlotFormValues = z.infer<typeof timeSlotFormSchema>;

export function TimeSlotDialog({ eventDate }: TimeSlotDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize the form
  const form = useForm<TimeSlotFormValues>({
    resolver: zodResolver(timeSlotFormSchema),
    defaultValues: {
      startTime: new Date(eventDate.date ?? ''),
      endTime: new Date(eventDate.date ?? ''),
      doorsOpen: new Date(eventDate.date ?? ''),
    },
  });

  async function onSubmit(data: TimeSlotFormValues) {
    try {
      setIsSubmitting(true);

      // convert zod to prisma type
      const prismaData: PrismaNamespace.TimeSlotUncheckedCreateInput = {
        eventDateId: eventDate.id,
        startTime: data.startTime,
        endTime: data.endTime,
        doorsOpen: data.doorsOpen ? data.doorsOpen : data.startTime,
      };

      // Call the server action
      const result = await createTimeSlot(eventDate.id, prismaData);

      if (result.success) {
        toast.success('Time slot created successfully');

        // Close the dialog
        setOpen(false);

        // Reset the form
        form.reset();
      } else {
        toast.error(result.error || 'Failed to create time slot');
      }
    } catch (error) {
      // Close the dialog
      setOpen(false);

      const errorMessage =
        error instanceof Error ? error.message : 'Something went wrong';
      console.error('Failed to create time slot:', error);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  }

  // Format time for display
  const formatTime = (time: string | Date) => {
    return format(new Date(time), 'h:mm a');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <PlusIcon className="mr-1 h-3 w-3" />
          Add Time Slot
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Time Slot</DialogTitle>
          <DialogDescription>
            Create a new time slot for this event date.
          </DialogDescription>
        </DialogHeader>

        {/* Display existing time slots */}
        {eventDate.timeSlots && eventDate.timeSlots.length > 0 ? (
          <div className="mb-4">
            <h4 className="mb-2 font-medium text-sm">Existing Time Slots:</h4>
            <div className="max-h-32 space-y-2 overflow-y-auto">
              {eventDate.timeSlots.map((slot) => (
                <div
                  key={slot.id}
                  className="flex justify-between rounded-sm bg-muted p-2 text-xs"
                >
                  <span>
                    {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                  </span>
                  {slot.doorsOpen && (
                    <span className="text-muted-foreground">
                      Doors: {formatTime(slot.doorsOpen)}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="mb-4 text-muted-foreground text-sm">
            No time slots yet.
          </p>
        )}

        <h4 className="mb-2 font-medium text-sm">New Time Slot</h4>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="flex">
              <FormField
                control={form.control}
                name="startTime"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Start Time</FormLabel>
                    <FormControl>
                      <DatetimePicker
                        {...field}
                        format={[undefined, ['hours', 'minutes', 'am/pm']]}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="endTime"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>End Time</FormLabel>
                    <FormControl>
                      <DatetimePicker
                        {...field}
                        format={[undefined, ['hours', 'minutes', 'am/pm']]}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="doorsOpen"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Doors Open</FormLabel>
                  <FormControl>
                    <DatetimePicker
                      {...field}
                      format={[undefined, ['hours', 'minutes', 'am/pm']]}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Creating...' : 'Create Time Slot'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
