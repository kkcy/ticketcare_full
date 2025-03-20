'use client';

import type { SerializedUser } from '@/types';
import { Button } from '@repo/design-system/components/ui/button';
import type { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown } from 'lucide-react';

export const columns: ColumnDef<SerializedUser>[] = [
  {
    accessorKey: 'id',
    header: ({ column }) => {
      return (
        <Button
          variant="transparent"
          size="table"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          ID
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: 'name',
    header: ({ column }) => {
      return (
        <Button
          variant="transparent"
          size="table"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  // {
  //   accessorKey: 'lastName',
  //   header: ({ column }) => {
  //     return (
  //       <Button
  //         variant="transparent"
  //         size="table"
  //         onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
  //       >
  //         Last Name
  //         <ArrowUpDown className="ml-2 h-4 w-4" />
  //       </Button>
  //     );
  //   },
  // },
  {
    accessorKey: 'email',
    header: ({ column }) => {
      return (
        <Button
          variant="transparent"
          size="table"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Email
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: 'type',
    header: ({ column }) => {
      return (
        <Button
          variant="transparent"
          size="table"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Type
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  // {
  //   accessorKey: 'eventTypes',
  //   header: ({ column }) => {
  //     return (
  //       <Button
  //         variant="transparent"
  //         size="table"
  //         onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
  //       >
  //         Event Types
  //         <ArrowUpDown className="ml-2 h-4 w-4" />
  //       </Button>
  //     );
  //   },
  //   cell: ({ row }) => {
  //     return (
  //       <div className="flex items-center gap-2">
  //         {row.original.eventTypes.map((eventType: string, index: number) => (
  //           <span
  //             key={index}
  //             className="rounded-full border border-white px-2 py-1 text-xs"
  //           >
  //             {eventType}
  //           </span>
  //         ))}
  //       </div>
  //     );
  //   },
  // },
  {
    accessorKey: '_count.orders',
    header: ({ column }) => {
      return (
        <Button
          variant="transparent"
          size="table"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Orders
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      return <span>{row.original._count?.orders ?? 0}</span>;
    },
  },
  // {
  //   accessorKey: 'balance',
  //   header: ({ column }) => {
  //     return (
  //       <Button
  //         variant="transparent"
  //         size="table"
  //         onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
  //       >
  //         Balance
  //         <ArrowUpDown className="ml-2 h-4 w-4" />
  //       </Button>
  //     );
  //   },
  // },
  // {
  //   accessorKey: 'lastLogin',
  //   header: ({ column }) => {
  //     return (
  //       <Button
  //         variant="transparent"
  //         size="table"
  //         onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
  //       >
  //         Last Login
  //         <ArrowUpDown className="ml-2 h-4 w-4" />
  //       </Button>
  //     );
  //   },
  // },
];
