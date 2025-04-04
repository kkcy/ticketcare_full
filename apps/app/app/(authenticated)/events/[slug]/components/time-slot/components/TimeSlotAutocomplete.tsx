import { formatDate, formatTime } from '@/app/util';
import type { PrismaNamespace } from '@repo/database';
import { Autocomplete } from '@repo/design-system/components/ui/autocomplete';
import { useDebounce } from '@repo/design-system/hooks/use-debounce';
import { urlSerialize } from '@repo/design-system/lib/utils';
import { useMemo, useState } from 'react';
import useSWR from 'swr';

interface TimeSlotAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  eventId?: string;
  placeholder?: string;
}

type PrismaTimeSlot = PrismaNamespace.TimeSlotGetPayload<{
  select: {
    id: true;
    startTime: true;
    endTime: true;
    doorsOpen: true;
    eventDate: {
      select: {
        id: true;
        date: true;
        event: {
          select: {
            id: true;
            title: true;
          };
        };
      };
    };
  };
}>;

export function TimeSlotAutocomplete({
  eventId,
  value,
  onChange,
  ...field
}: TimeSlotAutocompleteProps) {
  const [searchValue, setSearchValue] = useState<string>('');
  const [debouncedQuery] = useDebounce(searchValue, 300);

  const {
    data: { data: timeSlots } = {},
    isLoading,
  } = useSWR<{
    data: PrismaTimeSlot[];
  }>(
    urlSerialize('/api/events/time-slots', {
      eventId,
      query: debouncedQuery,
    })
  );

  const timeSlotOptions = useMemo(() => {
    if (!timeSlots) {
      return [];
    }

    // Map all time slots to options with formatted labels
    return timeSlots.map((slot) => ({
      value: slot.id,
      label: `${formatDate(slot.eventDate.date)} | ${formatTime(slot.startTime)} - ${formatTime(slot.endTime)}`,
    }));
  }, [timeSlots]);

  return (
    <Autocomplete
      selectedValue={value}
      onSelectedValueChange={(v) => {
        onChange(v);
      }}
      searchValue={searchValue}
      onSearchValueChange={setSearchValue}
      items={timeSlotOptions ?? []}
      isLoading={isLoading}
      placeholder={eventId ? 'Select a time slot...' : 'Select an event first'}
      emptyMessage="No time slots found"
      className="w-full"
      disabled={!eventId}
      {...field}
    />
  );
}
