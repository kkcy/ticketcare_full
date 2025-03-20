'use client';

import type { SerializedOrder } from '@/types';
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
// import { searchOrders } from './actions'
import { urlSerialize } from '@repo/design-system/lib/utils';
import {
  type ColumnDef,
  // ColumnFiltersState,
  type SortingState,
  flexRender,
  getCoreRowModel,
  // getFilteredRowModel,
  getPaginationRowModel,
  // getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { useRouter } from 'next/navigation';
import React from 'react';
import useSWR from 'swr';

interface OrderTableProps {
  organizerId: string;
  columns: ColumnDef<SerializedOrder, unknown>[];
  initialData: SerializedOrder[];
}

export function OrderTable({
  organizerId,
  columns,
  initialData,
}: OrderTableProps) {
  const router = useRouter();
  const [search, setSearch] = React.useState('');
  const debouncedSearch = useDebounce(search, 500);

  const [sorting, setSorting] = React.useState<SortingState>([]);
  // const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
  //   []
  // )

  const { data } = useSWR(
    urlSerialize('/api/orders', {
      organizerId: organizerId,
      query: debouncedSearch,
    })
  );

  const table = useReactTable({
    data: data?.data ?? initialData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    // onColumnFiltersChange: setColumnFilters,
    // getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      // columnFilters,
    },
  });

  return (
    <>
      <div className="flex items-center py-4">
        <Input
          placeholder="Filter name, email, or transaction ID..."
          // value={(table.getColumn("event")?.getFilterValue() as string) ?? ""}
          // onChange={(event) =>
          //   table.getColumn("event")?.setFilterValue(event.target.value)
          // }
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
                  data-state={row.getIsSelected() && 'selected'}
                  className="cursor-pointer"
                  onClick={() => router.push(`/orders/${row.original.id}`)}
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
