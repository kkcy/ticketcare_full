'use client';

import { Badge } from '@repo/design-system/components/ui/badge';
import { Button } from '@repo/design-system/components/ui/button';
import { Input } from '@repo/design-system/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@repo/design-system/components/ui/table';
import { useDebounce } from '@repo/design-system/hooks/use-debounce';
import { urlSerialize } from '@repo/design-system/lib/utils';
import {
  type ColumnDef,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import React from 'react';
import useSWR from 'swr';
import type { SerializedOrganizer } from '../../../../../types';

interface OrganizerTableProps {
  initialData: SerializedOrganizer[];
}

export function OrganizerTable({ initialData }: OrganizerTableProps) {
  const router = useRouter();
  const [search, setSearch] = React.useState('');
  const debouncedSearch = useDebounce(search, 500);

  const [sorting, setSorting] = React.useState<SortingState>([]);

  const { data } = useSWR(
    urlSerialize('/api/organizers', {
      query: debouncedSearch,
    })
  );

  const columns: ColumnDef<SerializedOrganizer, unknown>[] = [
    {
      accessorKey: 'name',
      header: 'Name',
    },
    {
      accessorKey: 'email',
      header: 'Email',
    },
    {
      accessorKey: 'isPremium',
      header: 'Status',
      cell: ({ row }) => {
        return (
          <Badge variant={row.original.isPremium ? 'success' : 'outline'}>
            {row.original.isPremium ? 'Premium' : 'Free'}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'verificationStatus',
      header: 'Verification',
      cell: ({ row }) => {
        const status = row.original.verificationStatus;
        let variant: 'outline' | 'pending' | 'success' | 'destructive' =
          'outline';

        if (status === 'PENDING') {
          variant = 'pending';
        }
        if (status === 'VERIFIED') {
          variant = 'success';
        }
        if (status === 'REJECTED') {
          variant = 'destructive';
        }

        return (
          <Badge variant={variant}>
            {status.charAt(0) + status.slice(1).toLowerCase()}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'eventCredits',
      header: 'Event Credits',
      cell: ({ row }) => {
        return row.original.isPremium ? row.original.eventCredits : 'N/A';
      },
    },
    {
      accessorKey: 'createdAt',
      header: 'Created',
      cell: ({ row }) => {
        return format(new Date(row.original.createdAt), 'MMM d, yyyy');
      },
    },
  ];

  const table = useReactTable({
    data: data?.data ?? initialData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
    },
  });

  return (
    <>
      <div className="flex items-center gap-4 py-4">
        <Input
          placeholder="Filter name or email"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="max-w-sm"
        />
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() =>
                    router.push(`/admin/organizers/${row.original.id}`)
                  }
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>
    </>
  );
}
