'use client';

import type { SerializedEvent } from '@/app/types';
import { FormField, FormItem } from '@repo/design-system/components/ui/form';
import { Separator } from '@repo/design-system/components/ui/separator';
// import { useRouter } from 'next/navigation';
import { useFormContext } from 'react-hook-form';
import * as z from 'zod';
import {
  DateStep,
  QuantityStep,
  TicketTypeStep,
  TimeStep,
} from './event-pricing-steps';

export const ticketFormSchema = z.object({
  date: z.string().min(1, 'Please select a date'),
  timeSlot: z.string().min(1, 'Please select a time slot'),
  ticketTypeId: z.string().min(1, 'Please select a ticket type'),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
});

export type TicketFormValues = z.infer<typeof ticketFormSchema>;

interface EventPricingProps {
  event: SerializedEvent;
}

export function EventPricing({ event }: EventPricingProps) {
  // const router = useRouter();
  const form = useFormContext<TicketFormValues>();
  const { watch } = form;
  const formValues = watch();
  const timeSlot = formValues.timeSlot;

  // Find selected time slot's inventory
  const selectedTimeSlot = timeSlot
    ? event.eventDates
        ?.flatMap((ed) => ed.timeSlots)
        .find((ts) => ts.id.toString() === timeSlot)
    : null;

  // Map inventory to ticket types
  const availableTicketTypes =
    selectedTimeSlot?.inventory.reduce(
      (acc, inv) => {
        acc[inv.ticketType.id.toString()] = {
          ...inv.ticketType,
          availableQuantity: inv.quantity,
        };
        return acc;
      },
      {} as Record<string, any>
    ) ?? {};

  return (
    <div className="space-y-8">
      <FormField
        control={form.control}
        name="date"
        render={() => (
          <FormItem>
            <DateStep control={form.control} event={event} />
          </FormItem>
        )}
      />

      <Separator />

      <FormField
        control={form.control}
        name="timeSlot"
        render={() => (
          <FormItem>
            <TimeStep control={form.control} event={event} />
          </FormItem>
        )}
      />

      <Separator />

      <FormField
        control={form.control}
        name="ticketTypeId"
        render={() => (
          <FormItem>
            <TicketTypeStep
              control={form.control}
              event={event}
              availableTicketTypes={availableTicketTypes}
            />
          </FormItem>
        )}
      />

      <Separator />

      <FormField
        control={form.control}
        name="quantity"
        render={() => (
          <FormItem>
            <QuantityStep control={form.control} />
          </FormItem>
        )}
      />

      <div className="mt-32" />
    </div>
  );
}
