'use client';

import type { SerializedEvent, SerializedPremiumTier } from '@/types';
import { useEffect, useState } from 'react';

import type { PrismaNamespace } from '@repo/database';
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
import {
  MultiSelector,
  MultiSelectorContent,
  MultiSelectorInput,
  MultiSelectorItem,
  MultiSelectorList,
  MultiSelectorTrigger,
} from '@repo/design-system/components/ui/multi-select';
import { toast } from '@repo/design-system/components/ui/sonner';
import { Textarea } from '@repo/design-system/components/ui/textarea';
import { title } from 'radash';
import { getPremiumTiers } from './[slug]/actions';
import { createEvent, updateEvent } from './actions';

interface EventFormProps {
  setOpen?: (open: boolean) => void;
  mode?: 'create' | 'edit';
  event?: SerializedEvent;
}

const eventCategories = ['music', 'sports', 'tech', 'art', 'film', 'food'];

export function EventForm({ setOpen, mode = 'create', event }: EventFormProps) {
  const [premiumTiers, setPremiumTiers] = useState<SerializedPremiumTier[]>([]);
  const [isLoadingTiers, setIsLoadingTiers] = useState(false);

  // Fetch premium tiers when the form loads
  useEffect(() => {
    const fetchPremiumTiers = async () => {
      setIsLoadingTiers(true);
      try {
        const tiers = await getPremiumTiers();
        setPremiumTiers(tiers.filter((tier) => tier.isActive));
      } catch (error) {
        // Log error and show toast notification
        toast.error(
          `Failed to load premium tiers: ${error instanceof Error ? error.message : String(error)}`
        );
        toast.error('Failed to load premium tiers');
      } finally {
        setIsLoadingTiers(false);
      }
    };

    fetchPremiumTiers();
  }, []);

  const form = useForm<PrismaNamespace.EventUncheckedCreateInput>({
    defaultValues: event
      ? {
          title: event.title,
          description: event.description || '',
          category: event.category,
          startTime: event.startTime ? new Date(event.startTime) : undefined,
          endTime: event.endTime ? new Date(event.endTime) : undefined,
          doorsOpen: event.doorsOpen ? new Date(event.doorsOpen) : undefined,
          status: event.status,
          isPublic: event.isPublic,
          requiresApproval: event.requiresApproval,
          waitingListEnabled: event.waitingListEnabled,
          refundPolicy: event.refundPolicy || '',
          // venueId: Number(event.venueId),
          venueName: event.venueName || '',
          isPremiumEvent: event.isPremiumEvent || false,
          maxTicketsPerEvent: event.maxTicketsPerEvent || 20,
          premiumTierId: event.premiumTierId || null,
        }
      : {
          title: '',
          description: '',
          category: [],
          startTime: new Date(),
          endTime: new Date(),
          doorsOpen: new Date(),
          status: 'draft',
          isPublic: true,
          requiresApproval: false,
          waitingListEnabled: false,
          refundPolicy: '',
          // venueId: undefined,
          venueName: undefined,
          isPremiumEvent: false,
          maxTicketsPerEvent: 20,
          premiumTierId: null,
        },
  });

  async function onSubmit(values: PrismaNamespace.EventUncheckedCreateInput) {
    try {
      if (mode === 'edit' && event?.id) {
        // if (values.venueId === undefined) {
        if (values.venueName === undefined) {
          throw new Error('Venue is required');
        }

        await updateEvent(event.id, {
          ...values,
          // venueId: values.venueId,
        });
        toast.success('Event updated successfully');
      } else {
        // if (values.venueId === undefined) {
        if (values.venueName === undefined) {
          throw new Error('Venue is required');
        }

        await createEvent({
          ...values,
          // venueId: values.venueId,
        });
        toast.success('Event created successfully');
      }
      setOpen?.(false);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Something went wrong';
      console.error(errorMessage);
      toast.error(errorMessage);
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="mx-auto w-full max-w-3xl space-y-4 px-4 md:px-0"
      >
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Event Title" type="" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Event Description"
                  className="resize-none"
                  {...field}
                  // Convert null to empty string
                  value={field.value ?? ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="venueName"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Venue</FormLabel>
                <FormControl>
                  {/* <VenueAutocomplete {...field} value={String(field.value)} /> */}
                  <Input placeholder="Venue Name" type="" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Category</FormLabel>
                <FormControl>
                  <MultiSelector
                    values={field.value ?? []}
                    onValuesChange={field.onChange}
                    loop
                    className="w-full"
                  >
                    <MultiSelectorTrigger>
                      <MultiSelectorInput placeholder="Select categories" />
                    </MultiSelectorTrigger>
                    <MultiSelectorContent>
                      <MultiSelectorList>
                        {eventCategories.map((category) => (
                          <MultiSelectorItem key={category} value={category}>
                            {title(category)}
                          </MultiSelectorItem>
                        ))}
                      </MultiSelectorList>
                    </MultiSelectorContent>
                  </MultiSelector>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="startTime"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Start Date</FormLabel>
                <DatetimePicker
                  {...field}
                  format={[
                    ['days', 'months', 'years'],
                    ['hours', 'minutes', 'am/pm'],
                  ]}
                />
                <FormDescription>When does the event start?</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="endTime"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>End Date</FormLabel>
                <DatetimePicker
                  {...field}
                  format={[
                    ['days', 'months', 'years'],
                    ['hours', 'minutes', 'am/pm'],
                  ]}
                />
                <FormDescription>When does the event end?</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* <FormField
            control={form.control}
            name="isPremiumEvent"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md p-4">
                <FormControl>
                  <div className="flex h-4 w-4 items-center justify-center rounded-sm border border-primary">
                    {field.value ? <CheckIcon className="h-4 w-4" /> : null}
                    <input
                      type="checkbox"
                      className="absolute h-4 w-4 cursor-pointer opacity-0"
                      checked={field.value}
                      onChange={(e) => {
                        field.onChange(e);
                        if (!e.target.checked) {
                          // Reset premium tier when unchecking premium event
                          form.setValue('premiumTierId', null);
                          form.setValue('maxTicketsPerEvent', 20);
                        }
                      }}
                      onBlur={field.onBlur}
                      name={field.name}
                      ref={field.ref}
                    />
                  </div>
                </FormControl>
                <div className="flex-1 space-y-1 leading-none">
                  <FormLabel>Premium Event</FormLabel>
                  <FormDescription>
                    Premium events allow for more ticket sales but require
                    credits.
                  </FormDescription>
                </div>
              </FormItem>
            )}
          /> */}

          {form.getValues().isPremiumEvent && (
            <FormField
              control={form.control}
              name="premiumTierId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Premium Tier</FormLabel>
                  <FormControl>
                    <select
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:font-medium file:text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={field.value || ''}
                      onChange={(e) => {
                        const tierId = e.target.value
                          ? Number.parseInt(e.target.value, 10)
                          : null;
                        field.onChange(tierId);

                        // Update max tickets based on selected tier
                        if (tierId) {
                          const selectedTier = premiumTiers.find(
                            (tier) => tier.id === tierId
                          );
                          if (selectedTier) {
                            form.setValue(
                              'maxTicketsPerEvent',
                              selectedTier.maxTicketsPerEvent
                            );
                          }
                        }
                      }}
                      disabled={isLoadingTiers}
                    >
                      <option value="">Select a premium tier</option>
                      {premiumTiers.map((tier) => (
                        <option key={tier.id} value={tier.id}>
                          {tier.name} - {tier.maxTicketsPerEvent} tickets ($
                          {tier.price})
                        </option>
                      ))}
                    </select>
                  </FormControl>
                  <FormDescription>
                    Select a premium tier to determine the maximum number of
                    tickets.
                    {premiumTiers.length === 0 && !isLoadingTiers && (
                      <span className="mt-1 block text-amber-600">
                        No premium tiers available. Contact an admin to create
                        tiers.
                      </span>
                    )}
                    {isLoadingTiers && (
                      <span className="mt-1 block text-muted-foreground">
                        Loading premium tiers...
                      </span>
                    )}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {/* <FormField
                control={form.control}
                name="maxTicketsPerEvent"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Maximum Tickets</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        max={1000}
                        {...field}
                        onChange={(e) =>
                          field.onChange(Number.parseInt(e.target.value) || 20)
                        }
                        disabled={!form.getValues().isPremiumEvent}
                        value={
                          form.getValues().isPremiumEvent ? field.value : 20
                        }
                      />
                    </FormControl>
                    <FormDescription>
                      Maximum number of tickets that can be sold for this event.
                      {!form.getValues().isPremiumEvent && (
                        <span className="mt-1 block text-amber-600">
                          Free tier limited to 20 tickets per event.
                        </span>
                      )}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              /> */}
        </div>

        <Button type="submit" className="max-md:w-full">
          Submit
        </Button>
      </form>
    </Form>
  );
}
