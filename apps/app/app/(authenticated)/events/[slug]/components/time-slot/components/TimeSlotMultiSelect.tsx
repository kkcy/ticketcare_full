import { formatDate, formatTime } from '@/app/util';
import type { PrismaNamespace } from '@repo/database';
import {
  MultiSelector,
  MultiSelectorContent,
  MultiSelectorInput,
  MultiSelectorItem,
  MultiSelectorList,
  MultiSelectorTrigger,
} from '@repo/design-system/components/ui/multi-select';
import { urlSerialize } from '@repo/design-system/lib/utils';
import { useMemo } from 'react';
import useSWR from 'swr';

interface TimeSlotMultiSelectProps {
  values: string[];
  onChange: (value: string[]) => void;
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

export function TimeSlotMultiSelect({
  eventId,
  values,
  onChange,
  placeholder = 'Select time slots',
}: TimeSlotMultiSelectProps) {
  const {
    data: { data: timeSlots } = {},
  } = useSWR<{
    data: PrismaTimeSlot[];
  }>(
    urlSerialize('/api/events/time-slots', {
      eventId,
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

  // NOTE: Create a map of value to label to display label instead of id
  const valueToLabelMap = useMemo(() => {
    const map: Record<string, string> = {};
    for (const option of timeSlotOptions) {
      map[option.value] = option.label;
    }
    return map;
  }, [timeSlotOptions]);

  return (
    <MultiSelector
      values={values}
      onValuesChange={onChange}
      loop
      className="w-full"
    >
      <MultiSelectorTrigger className="flex-col" labelsRecord={valueToLabelMap}>
        <MultiSelectorInput placeholder={placeholder} />
      </MultiSelectorTrigger>
      <MultiSelectorContent>
        <MultiSelectorList>
          {timeSlotOptions.map((option) => (
            <MultiSelectorItem key={option.value} value={option.value}>
              {option.label}
            </MultiSelectorItem>
          ))}
        </MultiSelectorList>
      </MultiSelectorContent>
    </MultiSelector>
  );
}
