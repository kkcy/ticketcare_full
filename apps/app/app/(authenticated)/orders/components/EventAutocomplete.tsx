import type { PrismaNamespace } from '@repo/database';
import { Autocomplete } from '@repo/design-system/components/ui/autocomplete';
import { useDebounce } from '@repo/design-system/hooks/use-debounce';
import { urlSerialize } from '@repo/design-system/lib/utils';
import { useMemo, useState } from 'react';
import useSWR from 'swr';

interface EventAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
}

type PrismaEvent = PrismaNamespace.EventGetPayload<{
  select: {
    id: true;
    title: true;
  };
}>;

export function EventAutocomplete({
  value,
  onChange,
  ...field
}: EventAutocompleteProps) {
  const [searchValue, setSearchValue] = useState<string>('');
  const [debouncedQuery] = useDebounce(searchValue, 300);
  const {
    data: { data: events } = {},
    isLoading,
  } = useSWR<{
    data: PrismaEvent[];
  }>(urlSerialize('/api/events', { query: debouncedQuery }));

  const eventsOptions = useMemo(() => {
    return events?.map((event) => ({
      value: event.id,
      label: event.title,
    }));
  }, [events]);

  return (
    <Autocomplete
      selectedValue={value}
      onSelectedValueChange={(v) => {
        onChange(v);
      }}
      searchValue={searchValue}
      onSearchValueChange={setSearchValue}
      items={eventsOptions ?? []}
      isLoading={isLoading}
      placeholder="Select an event"
      emptyMessage="No event found"
      className="w-full"
      {...field}
    />
  );
}
