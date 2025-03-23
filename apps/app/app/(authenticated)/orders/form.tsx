'use client';

import type { PrismaNamespace } from '@repo/database';
import { Button } from '@repo/design-system/components/ui/button';
import { DialogFooter } from '@repo/design-system/components/ui/dialog';
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
import { UserAutocomplete } from '../components/UserAutocomplete';
import { EventAutocomplete } from './components/EventAutocomplete';
import { TicketTypeAutocomplete } from './components/TicketTypeAutocomplete';

interface OrderFormProps {
  setOpen?: (open: boolean) => void;
  mode?: 'create' | 'edit';
  order?: PrismaNamespace.OrderGetPayload<{ include: { user: true } }>;
}

export function OrderForm({ setOpen, mode = 'create', order }: OrderFormProps) {
  const form = useForm<PrismaNamespace.OrderUncheckedCreateInput>({
    defaultValues: {
      userId: order?.userId || '',
      customerEmail: order?.user?.email || '',
      customerName: order?.user?.firstName || '',
      customerPhone: order?.user?.phone || '',
      eventId: order?.eventId || '',
      ticketTypeId: order?.ticketTypeId || '',
      quantity: 1,
      totalAmount: Number(order?.totalAmount) || 0,
      paymentMethod: order?.paymentMethod || '',
      transactionId: order?.transactionId || '',
      paymentStatus: order?.paymentStatus || '',
      status: order?.status || 'pending',
      orderedAt: order?.orderedAt || new Date(),
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
  const userId = form.watch('userId');

  // React.useEffect(() => {
  //   if (ticketTypeId && quantity) {
  //     updateTotalAmount(ticketTypeId, quantity)
  //   }
  // }, [ticketTypeId, quantity, updateTotalAmount])

  function onSubmit(values: PrismaNamespace.OrderUncheckedCreateInput) {
    console.log(values);

    try {
      if (mode === 'create') {
        // const createResponse = await createOrder(values);
      } else {
        // await updateOrder(order.id, values)
      }

      toast.success(
        `Order ${mode === 'create' ? 'created' : 'updated'} successfully`
      );
      form.reset();
      setOpen?.(false);
    } catch (error) {
      console.error('Failed to submit order:', error);
      toast.error('Failed to submit order');
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="eventId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Event</FormLabel>
              <FormControl>
                <EventAutocomplete
                  value={field.value}
                  onChange={(value) => {
                    field.onChange(value);
                    form.setValue('ticketTypeId', -2);
                    form.setValue('quantity', 1);
                    // form.setValue('totalAmount', 0)
                  }}
                />
              </FormControl>
              <FormDescription>Select the event for this order</FormDescription>
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
                  disabled={!eventId || !ticketTypeId}
                />
              </FormControl>
              <FormDescription>Number of tickets to order</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="userId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>User</FormLabel>
              <FormControl>
                <UserAutocomplete
                  value={field.value ?? ''}
                  onChange={field.onChange}
                />
              </FormControl>
              <FormDescription>Select the user for this order</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {userId === '-1' && (
          <>
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
                  <FormDescription>Customer's email address</FormDescription>
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
                  <FormDescription>Customer's contact number</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}

        {/* <FormField
          control={form.control}
          name="totalAmount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Total Amount</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  {...field}
                  disabled
                />
              </FormControl>
              <FormDescription>Total amount for the order</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        /> */}

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
                  </SelectContent>
                </Select>
              </FormControl>
              <FormDescription>Method of payment</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* <FormField
          control={form.control}
          name="transactionId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Transaction ID</FormLabel>
              <FormControl>
                <Input placeholder="Transaction ID" {...field} />
              </FormControl>
              <FormDescription>Unique transaction identifier</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        /> */}

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

        <DialogFooter>
          <Button type="submit">
            {mode === 'create' ? 'Create' : 'Update'} Order
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}
