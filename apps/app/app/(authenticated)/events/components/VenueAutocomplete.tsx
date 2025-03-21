import type { PrismaNamespace } from '@repo/database';
import { Autocomplete } from '@repo/design-system/components/ui/autocomplete';
import { useDebounce } from '@repo/design-system/hooks/use-debounce';
import { urlSerialize } from '@repo/design-system/lib/utils';
import { useMemo, useState } from 'react';
import useSWR from 'swr';

interface VenueAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
}

type PrismaVenue = PrismaNamespace.VenueGetPayload<{
  select: {
    id: true;
    name: true;
  };
}>;

export function VenueAutocomplete({
  value,
  onChange,
  ...field
}: VenueAutocompleteProps) {
  const [searchValue, setSearchValue] = useState<string>('');
  const [debouncedQuery] = useDebounce(searchValue, 300);
  const {
    data: { data: venues } = {},
    isLoading,
  } = useSWR<{
    data: PrismaVenue[];
  }>(urlSerialize('/api/venues', { query: debouncedQuery }));

  const venuesOptions = useMemo(() => {
    return venues?.map((venue) => ({
      value: String(venue.id),
      label: venue.name,
    }));
  }, [venues]);

  return (
    <Autocomplete
      selectedValue={value}
      onSelectedValueChange={(v) => {
        onChange(v);
      }}
      searchValue={searchValue}
      onSearchValueChange={setSearchValue}
      items={venuesOptions ?? []}
      isLoading={isLoading}
      placeholder="Select a venue"
      emptyMessage="No venue found"
      className="w-full"
      {...field}
    />
  );
}
