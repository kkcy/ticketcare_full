'use client';

import type { SerializedEvent } from '@/types';
import { zodResolver } from '@hookform/resolvers/zod';
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
import { useState } from 'react';
import { z } from 'zod';
import { createEvent, updateEvent } from './actions';

interface EventFormProps {
  setOpen?: (open: boolean) => void;
  mode?: 'create' | 'edit';
  event?: SerializedEvent;
}

const eventCategories = ['music', 'sports', 'tech', 'art', 'film', 'food'];

// Define the Zod schema for event form validation
const eventFormSchema = z
  .object({
    title: z
      .string()
      .min(3, { message: 'Title must be at least 3 characters' }),
    description: z.string(),
    startTime: z.date({ required_error: 'Start time is required' }),
    endTime: z.date({ required_error: 'End time is required' }),
    doorsOpen: z.date().optional(),
    category: z.array(z.string()).min(1, {
      message: 'Please select at least one category',
    }),
    venueName: z.string().min(1, { message: 'Venue name is required' }),
  })
  .refine(
    (data) => {
      // Ensure end time is after start time
      return data.endTime > data.startTime;
    },
    {
      message: 'End time must be after start time',
      path: ['endTime'],
    }
  );

// Type for form values
type EventFormValues = z.infer<typeof eventFormSchema>;

export function EventForm({ setOpen, mode = 'create', event }: EventFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form with default values or existing event data
  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues:
      mode === 'edit'
        ? {
            title: event?.title || '',
            description: event?.description || '',
            startTime: event?.startTime
              ? new Date(event.startTime)
              : new Date(),
            endTime: event?.endTime ? new Date(event.endTime) : new Date(),
            doorsOpen: event?.doorsOpen ? new Date(event.doorsOpen) : undefined,
            category: event?.category || [],
            venueName: event?.venueName || '',
          }
        : undefined,
  });

  // Handle form submission
  async function onSubmit(values: EventFormValues) {
    setIsSubmitting(true);

    try {
      const prismaValues = values as PrismaNamespace.EventUncheckedCreateInput;

      // NOTE: hardcoded doors open for now
      prismaValues.doorsOpen = values.startTime;

      if (mode === 'create') {
        await createEvent(prismaValues);
        toast.success('Event created successfully');
      } else {
        if (!event) {
          throw new Error('No event to update');
        }
        await updateEvent(event.id, prismaValues);
        toast.success('Event updated successfully');
      }

      // Close the dialog if setOpen is provided
      if (setOpen) {
        setOpen(false);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'An error occurred';
      console.error('Failed to save event:', error);
      toast.error(`Failed to save event: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
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

        <Button type="submit" className="max-md:w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Submitting...' : 'Submit'}
        </Button>
      </form>
    </Form>
  );
}
