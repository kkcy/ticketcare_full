'use client';

import type { SerializedEvent } from '@/app/types';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@repo/design-system/components/ui/tabs';
import { useRouter, useSearchParams } from 'next/navigation';
import { FormProvider, useForm } from 'react-hook-form';
import { createCart } from '../actions';
import { EventAbout } from './event-about';
import { EventFooter } from './event-footer';
import {
  EventPricing,
  type TicketFormValues,
  ticketFormSchema,
} from './event-pricing';
import { EventTerms } from './event-terms';

interface EventTabsProps {
  event: SerializedEvent;
}

export function EventTabs({ event }: EventTabsProps) {
  const searchParams = useSearchParams();
  const currentTab = (searchParams.get('tab') as string) || 'about';
  const router = useRouter();

  const form = useForm<TicketFormValues>({
    resolver: zodResolver(ticketFormSchema),
    defaultValues: {
      date: '',
      timeSlot: '',
      ticketTypeId: '',
      quantity: 1,
    },
    mode: 'onChange',
  });

  const onSubmit = async (data: TicketFormValues) => {
    try {
      const { cartId } = await createCart({
        timeSlotId: data.timeSlot,
        ticketTypeId: data.ticketTypeId,
        quantity: data.quantity,
      });

      router.push(`/checkout?cartId=${cartId}`);
    } catch (error) {
      console.error('Error creating cart:', error);
      // TODO: Show error toast
    }
  };

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Tabs
          value={currentTab}
          className="w-full"
          onValueChange={(value) => {
            const url = new URL(window.location.href);
            url.searchParams.set('tab', value);
            window.history.replaceState(null, '', url);
          }}
        >
          <div className="sticky top-16 right-0 left-0 z-10 bg-background">
            <TabsList
              className="flex"
              // className="flex gap-4 border-b w-full bg-transparent h-auto p-0"
            >
              {['About', 'Pricing', 'Terms'].map((label) => (
                <TabsTrigger
                  key={label}
                  value={label.toLowerCase()}
                  className="flex-1"
                  // className="px-4 py-2 border-b-2 data-[state=active]:border-teal-500 data-[state=active]:text-teal-500 font-medium border-transparent"
                >
                  {label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
          <TabsContent value="about" className="mt-4 min-h-[calc(100vh-208px)]">
            <EventAbout event={event} />
          </TabsContent>
          <TabsContent
            value="pricing"
            className="mt-4 min-h-[calc(100vh-208px)] space-y-6"
          >
            <EventPricing event={event} />
          </TabsContent>
          <TabsContent value="terms" className="mt-4 min-h-[calc(100vh-208px)]">
            <EventTerms />
          </TabsContent>
        </Tabs>
        <EventFooter />
      </form>
    </FormProvider>
  );
}
