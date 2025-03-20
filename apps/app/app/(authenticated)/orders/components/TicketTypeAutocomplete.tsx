import type { PrismaNamespace } from '@repo/database';
import { Autocomplete } from '@repo/design-system/components/ui/autocomplete';
import { useDebounce } from '@repo/design-system/hooks/use-debounce';
import { urlSerialize } from '@repo/design-system/lib/utils';
import { useMemo, useState } from 'react';
import useSWR from 'swr';

interface TicketTypeAutocompleteProps {
  eventId: number;
  value: number;
  onChange: (value: number) => void;
}

type PrismaTicketType = PrismaNamespace.TicketTypeGetPayload<{
  select: {
    id: true;
    name: true;
  };
}>;

export function TicketTypeAutocomplete({
  eventId,
  value,
  onChange,
  ...field
}: TicketTypeAutocompleteProps) {
  const [searchValue, setSearchValue] = useState<string>('');
  const [debouncedQuery] = useDebounce(searchValue, 300);
  const {
    data: { data: ticketTypes } = {},
    isLoading,
  } = useSWR<{
    data: PrismaTicketType[];
  }>(urlSerialize('/api/ticket-types', { query: debouncedQuery, eventId }));

  const ticketTypesOptions = useMemo(() => {
    return ticketTypes?.map((ticketType) => ({
      value: Number(ticketType.id),
      label: ticketType.name,
    }));
  }, [ticketTypes]);

  return (
    <Autocomplete
      selectedValue={value}
      onSelectedValueChange={(v) => {
        onChange(v);
      }}
      searchValue={searchValue}
      onSearchValueChange={setSearchValue}
      items={ticketTypesOptions ?? []}
      isLoading={isLoading}
      placeholder={
        eventId ? 'Select a ticket type...' : 'Select an event first'
      }
      emptyMessage="No ticket types found."
      className="w-full"
      disabled={!eventId}
      {...field}
    />
  );
}
