'use client';

import { useIsPastEvent } from '@/app/hooks/useIsPastEvent';
import type { SerializedEvent } from '@/types';
import { zodResolver } from '@hookform/resolvers/zod';
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  useForm,
} from '@repo/design-system/components/ui/form';
import { Input } from '@repo/design-system/components/ui/input';
import { toast } from '@repo/design-system/components/ui/sonner';
import React from 'react';
import { z } from 'zod';
import { createTicketType } from '../actions';
import { TimeSlotMultiSelect } from './time-slot/components/TimeSlotMultiSelect';

const ticketTypeFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  price: z.string().min(1, 'Price is required'),
  quantity: z.string().min(1, 'Quantity is required'),
  maxPerOrder: z.string().min(1, 'Maximum per order is required'),
  minPerOrder: z.string().min(1, 'Minimum per order is required'),
  saleStartTime: z.date(),
  saleEndTime: z.date(),
  timeSlotIds: z.array(z.string()).min(1, {
    message: 'Please select at least one timeslot',
  }),
});
type TicketTypeFormValues = z.infer<typeof ticketTypeFormSchema>;

interface TicketTypeDialogProps {
  event: SerializedEvent;
}

export function TicketTypeDialog({ event }: TicketTypeDialogProps) {
  const isPast = useIsPastEvent(event.startTime);

  const [open, setOpen] = React.useState(false);

  const form = useForm<TicketTypeFormValues>({
    resolver: zodResolver(ticketTypeFormSchema),
    defaultValues: {
      name: '',
      description: '',
      price: '',
      quantity: '1',
      maxPerOrder: '1',
      minPerOrder: '1',
      saleStartTime: new Date(event.startTime),
      saleEndTime: new Date(event.endTime),
      timeSlotIds: [],
    },
  });

  async function onSubmit(values: TicketTypeFormValues) {
    try {
      await createTicketType(event.id, event.slug, {
        ...values,
        price: Number.parseFloat(values.price),
        quantity: Number.parseInt(values.quantity),
        maxPerOrder: Number.parseInt(values.maxPerOrder),
        minPerOrder: Number.parseInt(values.minPerOrder),
      });

      toast.success('Ticket type created successfully');
      form.reset();
      setOpen?.(false);
    } catch (error) {
      console.error('Failed to create ticket type:', error);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" disabled={isPast}>
          Create Ticket Type
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create Ticket Type</DialogTitle>
          <DialogDescription>
            Create a new ticket type for this event. This will allow you to
            generate multiple tickets of this type.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="mx-auto w-full max-w-3xl space-y-4 px-4 md:px-0"
          >
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="VIP Access" {...field} />
                    </FormControl>
                    <FormDescription>Name of the ticket type</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" step="0.01" {...field} />
                    </FormControl>
                    <FormDescription>Price per ticket</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Total Quantity</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" {...field} />
                    </FormControl>
                    <FormDescription>
                      Total number of tickets available
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="timeSlotIds"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Time Slot</FormLabel>
                    <FormControl>
                      <TimeSlotMultiSelect
                        values={field.value}
                        eventId={event.id}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormDescription>Time Slot of the ticket</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4 self-start">
                <FormField
                  control={form.control}
                  name="minPerOrder"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Min per Order</FormLabel>
                      <FormControl>
                        <Input type="number" min="1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="maxPerOrder"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Max per Order</FormLabel>
                      <FormControl>
                        <Input type="number" min="1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Special access with exclusive perks"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Optional description of what this ticket type includes
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="saleStartTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sale Start Time</FormLabel>
                    <FormControl>
                      <DatetimePicker
                        {...field}
                        format={[
                          ['days', 'months', 'years'],
                          ['hours', 'minutes', 'am/pm'],
                        ]}
                      />
                    </FormControl>
                    <FormDescription>When ticket sales begin</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="saleEndTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sale End Time</FormLabel>
                    <FormControl>
                      <DatetimePicker
                        {...field}
                        format={[
                          ['days', 'months', 'years'],
                          ['hours', 'minutes', 'am/pm'],
                        ]}
                      />
                    </FormControl>
                    <FormDescription>When ticket sales end</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button type="submit">Create Ticket Type</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
