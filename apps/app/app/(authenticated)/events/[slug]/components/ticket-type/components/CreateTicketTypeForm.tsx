'use client';
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
import { createTicketType } from '../../../actions';
import { TimeSlotMultiSelect } from '../../time-slot/components/TimeSlotMultiSelect';

// Schema definition for the form
export const createTicketTypeFormSchema = z.object({
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
// Type for form values
export type CreateTicketTypeFormValues = z.infer<
  typeof createTicketTypeFormSchema
>;

interface CreateTicketTypeFormProps {
  setOpen?: (open: boolean) => void;
  eventId: string;
  slug: string;
  startTime?: string;
  endTime?: string;
}

export function CreateTicketTypeForm({
  setOpen,
  eventId,
  slug,
  startTime,
  endTime,
}: CreateTicketTypeFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CreateTicketTypeFormValues>({
    resolver: zodResolver(createTicketTypeFormSchema),
    defaultValues: {
      name: '',
      description: '',
      price: '',
      maxPerOrder: '1',
      minPerOrder: '1',
      saleStartTime: startTime ? new Date(startTime) : new Date(),
      saleEndTime: endTime ? new Date(endTime) : new Date(),
      quantity: '1',
      timeSlotIds: [],
    },
  });

  async function onSubmit(values: CreateTicketTypeFormValues) {
    setIsSubmitting(true);

    try {
      await createTicketType(eventId, slug, {
        ...values,
        price: Number.parseFloat(values.price),
        quantity: Number.parseInt(values.quantity),
        maxPerOrder: Number.parseInt(values.maxPerOrder),
        minPerOrder: Number.parseInt(values.minPerOrder),
      });
      toast.success('Ticket type created successfully');

      if (setOpen) {
        // Close the dialog if setOpen is provided
        setOpen(false);
        form.reset();
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'An error occurred';
      toast.error(`Failed to create ticket type: ${errorMessage}`);
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

          <FormField
            control={form.control}
            name="quantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Quantity</FormLabel>
                <FormControl>
                  <Input type="number" min="1" {...field} />
                </FormControl>
                <FormDescription>Number of tickets available</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

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
            name="timeSlotIds"
            render={({ field }) => (
              <FormItem className="col-span-2">
                <FormLabel>Time Slots</FormLabel>
                <FormControl>
                  <TimeSlotMultiSelect
                    values={field.value}
                    eventId={eventId}
                    onChange={field.onChange}
                  />
                </FormControl>
                <FormDescription>Time Slot of the ticket</FormDescription>
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
            {isSubmitting ? 'Creating...' : 'Create Ticket Type'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
