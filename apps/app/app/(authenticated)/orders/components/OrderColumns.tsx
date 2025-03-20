'use client';

import type { SerializedOrder } from '@/types';
import type { OrderStatus } from '@repo/database';
import { Badge } from '@repo/design-system/components/ui/badge';
import { Button } from '@repo/design-system/components/ui/button';
import type { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import Decimal from 'decimal.js';
import { ArrowUpDown } from 'lucide-react';
import { first, title } from 'radash';

export const columns: ColumnDef<SerializedOrder>[] = [
  {
    accessorKey: 'id',
    header: ({ column }) => {
      return (
        <Button
          variant="transparent"
          size="table"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Order ID
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: 'status',
    header: ({ column }) => {
      return (
        <Button
          variant="transparent"
          size="table"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Status
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ getValue }) => {
      const status = getValue() as OrderStatus;

      return <Badge variant={status}>{title(status)}</Badge>;
    },
  },
  {
    accessorKey: 'user.firstName',
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
  {
    accessorKey: 'orderedAt',
    header: ({ column }) => {
      return (
        <Button
          variant="transparent"
          size="table"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ getValue }) => {
      const date = getValue() as Date;
      return format(date, 'PPpp');
    },
  },
  {
    accessorKey: 'event',
    header: 'Event',
    cell: (props) => {
      // assume only one ticket per order
      const title = first(props.row.original.tickets)?.event?.title;
      const venue = first(props.row.original.tickets)?.event?.venue?.name;
      const date = first(props.row.original.tickets)?.event?.startTime;
      const ticketType = first(props.row.original.tickets)?.ticketType?.name;

      return (
        <div className="flex flex-col items-start">
          <div>{title}</div>
          <div className="text-secondary-foreground text-sm">{venue}</div>
          {date && (
            <div className="text-secondary-foreground text-sm">
              {format(date, 'PPpp')}
            </div>
          )}
          {ticketType && (
            <div className="font-semibold text-sm">{ticketType}</div>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: 'totalAmount',
    header: ({ column }) => {
      return (
        <div className="text-right">
          <Button
            variant="transparent"
            size="table"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Value
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        </div>
      );
    },
    cell: ({ getValue }) => {
      const value = getValue() as number;
      return <p className="text-right">{new Decimal(value).toFixed(2)}</p>;
    },
  },
];
