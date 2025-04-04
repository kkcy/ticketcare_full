'use client';

import type { SerializedOrder } from '@/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@repo/design-system/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@repo/design-system/components/ui/form';
import { useForm } from '@repo/design-system/components/ui/form';
import { Input } from '@repo/design-system/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/design-system/components/ui/select';
import { toast } from '@repo/design-system/components/ui/sonner';
import { first } from 'radash';
import { useState } from 'react';
import { z } from 'zod';
import { UserAutocomplete } from '../components/UserAutocomplete';
import { TimeSlotAutocomplete } from '../events/[slug]/components/time-slot/components/TimeSlotAutocomplete';
import { createOrder } from './actions';
import { EventAutocomplete } from './components/EventAutocomplete';
import { TicketTypeAutocomplete } from './components/TicketTypeAutocomplete';

interface OrderFormProps {
  setOpen?: (open: boolean) => void;
  mode?: 'create' | 'edit';
  order?: SerializedOrder;
}

// Define the Zod schema for order form validation
const orderFormSchema = z.object({
  userId: z.string().min(1, { message: 'User is required' }),
  // perform manual validation if userId: -1 (create new user)
  customerEmail: z.string().optional(),
  customerName: z.string().optional(),
  customerPhone: z.string().optional(),

  // autocomplete fields
  eventId: z.string().min(1, { message: 'Event is required' }),
  ticketTypeId: z.string().min(1, { message: 'Ticket type is required' }),
  timeSlotId: z.string().min(1, { message: 'Time slot is required' }),

  // order fields
  quantity: z.number().min(1, { message: 'Quantity must be at least 1' }),
  paymentMethod: z.string().min(1, { message: 'Payment method is required' }),
  paymentStatus: z.string().min(1, { message: 'Payment status is required' }),
  status: z.string().min(1, { message: 'Order status is required' }),
});

// Type for form values
export type OrderFormValues = z.infer<typeof orderFormSchema>;

export function OrderForm({ setOpen, mode = 'create', order }: OrderFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const firstTicketType = first(order?.tickets ?? []);

  const form = useForm<OrderFormValues>({
    resolver: zodResolver(orderFormSchema),
    defaultValues: {
      userId: order?.userId || '',
      customerEmail: order?.user?.email ?? undefined,
      customerName: order?.user?.firstName ?? undefined,
      customerPhone: order?.user?.phone ?? undefined,
      eventId: order?.eventId || '',
      ticketTypeId: firstTicketType?.ticketTypeId || '',
      timeSlotId: firstTicketType?.timeSlotId || '',
      quantity: 1,
      paymentMethod: order?.paymentMethod || 'custom',
      paymentStatus: order?.paymentStatus || 'custom',
      status: order?.status || 'pending',
    },
  });

  // Update total amount when quantity or ticket type changes
  // const updateTotalAmount = React.useCallback(
  //   (ticketTypeId: string, quantity: number) => {
  //     const ticketType = ticketTypes.find((tt) => tt.id === ticketTypeId)
  //     if (ticketType) {
  //       form.setValue('totalAmount', ticketType.price * quantity)
  //     }
  //   },
  //   [ticketTypes, form]
  // )

  // Watch for changes in quantity and ticket type
  const eventId = form.watch('eventId');
  const ticketTypeId = form.watch('ticketTypeId');
  const timeSlotId = form.watch('timeSlotId');
  const userId = form.watch('userId');

  // React.useEffect(() => {
  //   if (ticketTypeId && quantity) {
  //     updateTotalAmount(ticketTypeId, quantity)
  //   }
  // }, [ticketTypeId, quantity, updateTotalAmount])

  async function onSubmit(values: OrderFormValues) {
    setIsSubmitting(true);

    if (userId === '-1') {
      // Validate customer information when creating a new customer
      const customerEmail = form.getValues('customerEmail');
      const customerName = form.getValues('customerName');

      let hasErrors = false;

      if (!customerEmail || customerEmail.trim() === '') {
        form.setError('customerEmail', {
          message: 'Customer email is required when creating a new customer',
        });
        hasErrors = true;
      }

      if (!customerName || customerName.trim() === '') {
        form.setError('customerName', {
          message: 'Customer name is required when creating a new customer',
        });
        hasErrors = true;
      }

      if (hasErrors) {
        setIsSubmitting(false);
        return;
      }
    }

    try {
      if (mode === 'create') {
        await createOrder({ ...values });
      } else {
        // await updateOrder(
        //   order.id,
        //   values as PrismaNamespace.OrderUncheckedCreateInput
        // );
      }

      toast.success(
        `Order ${mode === 'create' ? 'created' : 'updated'} successfully`
      );
      form.reset();
      setOpen?.(false);
    } catch (error) {
      console.error('Failed to submit order:', error);

      const errorMessage =
        error instanceof Error ? error.message : 'Something went wrong';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="userId"
            render={({ field }) => (
              <FormItem className="col-span-2">
                <FormLabel>User</FormLabel>
                <FormControl>
                  <UserAutocomplete
                    value={field.value ?? ''}
                    onChange={field.onChange}
                  />
                </FormControl>
                {userId !== '-1' && (
                  <FormDescription>
                    Select the user for this order
                  </FormDescription>
                )}
                <FormMessage />
              </FormItem>
            )}
          />

          {userId === '-1' && (
            <div className="col-span-2 space-y-4 border-b-2 pb-4">
              <FormLabel>New Customer Information</FormLabel>
              <div className="grid grid-cols-2 gap-4 ">
                <FormField
                  control={form.control}
                  name="customerEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="john@example.com"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Customer's email address
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="customerName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormDescription>Customer's full name</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="customerPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="+1234567890" {...field} />
                      </FormControl>
                      <FormDescription>
                        Customer's contact number
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          )}

          <FormField
            control={form.control}
            name="eventId"
            render={({ field }) => (
              <FormItem className="col-span-2">
                <FormLabel>Event</FormLabel>
                <FormControl>
                  <EventAutocomplete
                    value={field.value}
                    onChange={field.onChange}
                    // onChange={(value) => {
                    //   field.onChange(value);
                    //   form.setValue('ticketTypeId', '-2');
                    //   form.setValue('quantity', 1);
                    //   // form.setValue('totalAmount', 0)
                    // }}
                  />
                </FormControl>
                <FormDescription>
                  Select the event for this order
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="timeSlotId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ticket Time Slot</FormLabel>
                <FormControl>
                  <TimeSlotAutocomplete
                    eventId={eventId}
                    value={field.value}
                    onChange={field.onChange}
                  />
                </FormControl>
                <FormDescription>Select the time slot</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="ticketTypeId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ticket Type</FormLabel>
                <FormControl>
                  <TicketTypeAutocomplete
                    eventId={eventId}
                    timeSlotId={timeSlotId}
                    value={field.value}
                    onChange={field.onChange}
                  />
                </FormControl>
                <FormDescription>Select the ticket type</FormDescription>
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
                  <Input
                    type="number"
                    min="1"
                    {...field}
                    onChange={(e) =>
                      field.onChange(Number.parseInt(e.target.value, 10))
                    }
                    disabled={!eventId || !ticketTypeId || !timeSlotId}
                  />
                </FormControl>
                <FormDescription>Number of tickets to order</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="paymentMethod"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Payment Method</FormLabel>
                <FormControl>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="card">Card</SelectItem>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormDescription>Method of payment</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="paymentStatus"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Payment Status</FormLabel>
                <FormControl>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select payment status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormDescription>Current status of the payment</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Order Status</FormLabel>
                <FormControl>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select order status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                      <SelectItem value="refunded">Refunded</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormDescription>Current status of the order</FormDescription>
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
            {mode === 'create' ? 'Create' : 'Update'} Order
          </Button>
        </div>
      </form>
    </Form>
  );
}
