'use client';

import type { SerializedEvent } from '@/types';
import type { EventStatus } from '@repo/database';
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
import { createEvent, updateEvent } from './actions';
import { VenueAutocomplete } from './components/VenueAutocomplete';

interface EventFormValues {
  title: string;
  description: string;
  category: string[];
  startTime: Date;
  endTime: Date;
  doorsOpen: Date;
  status: EventStatus;
  isPublic: boolean;
  requiresApproval: boolean;
  waitingListEnabled: boolean;
  refundPolicy: string;
  venueId: number | undefined;
}

interface EventFormProps {
  setOpen?: (open: boolean) => void;
  mode?: 'create' | 'edit';
  event?: SerializedEvent;
}

const eventCategories = ['music', 'sports', 'tech', 'art', 'film', 'food'];

export function EventForm({ setOpen, mode = 'create', event }: EventFormProps) {
  const form = useForm<EventFormValues>({
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
          venueId: Number(event.venueId),
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
          venueId: undefined,
        },
  });

  async function onSubmit(values: EventFormValues) {
    try {
      if (mode === 'edit' && event?.id) {
        if (values.venueId === undefined) {
          throw new Error('Venue is required');
        }

        await updateEvent(event.id, {
          ...values,
          venueId: BigInt(values.venueId),
        });
        toast.success('Event updated successfully');
      } else {
        if (values.venueId === undefined) {
          throw new Error('Venue is required');
        }

        await createEvent({
          ...values,
          venueId: BigInt(values.venueId),
        });
        toast.success('Event created successfully');
      }
      setOpen?.(false);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Something went wrong';

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
            name="venueId"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Venue</FormLabel>
                <FormControl>
                  <VenueAutocomplete {...field} value={String(field.value)} />
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
                    ['months', 'days', 'years'],
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
                    ['months', 'days', 'years'],
                    ['hours', 'minutes', 'am/pm'],
                  ]}
                />
                <FormDescription>When does the event end?</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" className="max-md:w-full">
          Submit
        </Button>
      </form>
    </Form>
  );
}
