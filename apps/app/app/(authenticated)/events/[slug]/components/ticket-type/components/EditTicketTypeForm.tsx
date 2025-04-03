'use client';

import type { SerializedEvent } from '@/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@repo/design-system/components/ui/button';
import { DatetimePicker } from '@repo/design-system/components/ui/datetime-picker';
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
import { useState } from 'react';
import { z } from 'zod';
import { updateTicketType } from '../../../actions';

// Schema definition for the form
export const editTicketTypeFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  price: z.string().min(1, 'Price is required'),
  maxPerOrder: z.string().min(1, 'Maximum per order is required'),
  minPerOrder: z.string().min(1, 'Minimum per order is required'),
  saleStartTime: z.date(),
  saleEndTime: z.date(),
});
// Type for form values
export type EditTicketTypeFormValues = z.infer<typeof editTicketTypeFormSchema>;

interface EditTicketTypeFormProps {
  setOpen?: (open: boolean) => void;
  ticketType: SerializedEvent['ticketTypes'][number];
  eventId: string;
  slug: string;
}

export function EditTicketTypeForm({
  setOpen,
  ticketType,
  eventId,
  slug,
}: EditTicketTypeFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<EditTicketTypeFormValues>({
    resolver: zodResolver(editTicketTypeFormSchema),
    defaultValues: {
      name: ticketType.name,
      description: ticketType.description || '',
      price: String(ticketType.price),
      maxPerOrder: String(ticketType.maxPerOrder),
      minPerOrder: String(ticketType.minPerOrder),
      saleStartTime: new Date(ticketType.saleStartTime),
      saleEndTime: new Date(ticketType.saleEndTime),
    },
  });

  async function onSubmit(values: EditTicketTypeFormValues) {
    setIsSubmitting(true);

    try {
      await updateTicketType(ticketType.id, eventId, slug, {
        name: values.name,
        description: values.description,
        saleStartTime: values.saleStartTime,
        saleEndTime: values.saleEndTime,
        price: Number.parseFloat(values.price),
        maxPerOrder: Number.parseInt(values.maxPerOrder),
        minPerOrder: Number.parseInt(values.minPerOrder),
      });
      toast.success('Ticket type updated successfully');

      if (setOpen) {
        // Close the dialog if setOpen is provided
        setOpen(false);
        form.reset();
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'An error occurred';
      toast.error(`Failed to update ticket type: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="col-span-2">
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="VIP" {...field} />
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

          <div />

          <FormField
            control={form.control}
            name="minPerOrder"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Min per Order</FormLabel>
                <FormControl>
                  <Input type="number" min="1" {...field} />
                </FormControl>
                <FormDescription>
                  Minimum number of tickets per order
                </FormDescription>
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
                <FormDescription>
                  Maximum number of tickets per order
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

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

        <div className="flex justify-end">
          <Button
            type="submit"
            className="max-md:w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Updating...' : 'Update Ticket Type'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
