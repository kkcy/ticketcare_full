import type { PrismaNamespace } from '@repo/database';
import { Autocomplete } from '@repo/design-system/components/ui/autocomplete';
import { useDebounce } from '@repo/design-system/hooks/use-debounce';
import { urlSerialize } from '@repo/design-system/lib/utils';
import { useMemo, useState } from 'react';
import useSWR from 'swr';

interface UserAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
}

type PrismaUser = PrismaNamespace.UserGetPayload<{
  select: {
    id: true;
    firstName: true;
    lastName: true;
  };
}>;

export function UserAutocomplete({
  value,
  onChange,
  ...field
}: UserAutocompleteProps) {
  const [searchValue, setSearchValue] = useState<string>('');
  const [debouncedQuery] = useDebounce(searchValue, 300);
  const {
    data: { data: users } = {},
    isLoading,
  } = useSWR<{
    data: PrismaUser[];
  }>(urlSerialize('/api/users', { query: debouncedQuery }));

  const usersOptions = useMemo(() => {
    return [
      ...(users?.map((user) => ({
        value: user.id,
        label: `${user.firstName} ${user.lastName}`,
      })) ?? []),
      {
        value: '-1',
        label: 'Create a new user',
      },
    ];
  }, [users]);

  return (
    <Autocomplete
      selectedValue={value}
      onSelectedValueChange={(v) => {
        onChange(v);
      }}
      searchValue={searchValue}
      onSearchValueChange={setSearchValue}
      items={usersOptions ?? []}
      isLoading={isLoading}
      className="w-full"
      {...field}
    />
  );
}
