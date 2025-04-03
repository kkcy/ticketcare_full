import { formatDateTime } from '@/app/util';
import type { SerializedEvent } from '@/types';
import { Info } from '@repo/design-system/components/icons';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@repo/design-system/components/ui/tooltip';
import { InventoryDialog } from './inventory/components/inventoryDialog';
import { TicketTypeDialog } from './ticket-type/components/TicketTypeDialog';

interface EventTicketsProps {
  event: SerializedEvent;
}

export function EventTickets({ event }: EventTicketsProps) {
  return (
    <div className="space-y-6">
      <div className="rounded-lg border p-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex flex-col gap-1">
            <h2 className="font-semibold text-lg">Ticket Types</h2>
            <p className="text-muted-foreground text-sm">
              Manage ticket types and view orders for this event.
            </p>
          </div>

          <TicketTypeDialog
            eventId={event.id}
            slug={event.slug}
            startTime={event.startTime}
            endTime={event.endTime}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {event.ticketTypes.map((ticketType) => (
          <TicketTypeView
            key={ticketType.id}
            eventId={event.id}
            slug={event.slug}
            ticketType={ticketType}
          />
        ))}
      </div>
    </div>
  );
}

function TicketTypeView({
  eventId,
  slug,
  ticketType,
}: {
  eventId: string;
  slug: string;
  ticketType: SerializedEvent['ticketTypes'][number];
}) {
  const quantity = ticketType.inventory.reduce(
    (acc, inv) => acc + inv.quantity,
    0
  );

  return (
    <div key={ticketType.id} className="space-y-3 rounded-lg border p-4">
      <div className="flex items-start justify-between">
        <h3 className="font-semibold text-md">{ticketType.name}</h3>

        <TicketTypeDialog
          mode="edit"
          ticketType={ticketType}
          eventId={eventId}
          slug={slug}
        />
      </div>

      {ticketType.description && (
        <p className="text-muted-foreground text-sm">
          {ticketType.description}
        </p>
      )}

      <div className="flex items-center">
        <span className="mr-2 text-muted-foreground text-sm">Price:</span>
        <span className="rounded-full bg-primary/10 px-2 py-1 font-medium text-primary text-sm">
          ${ticketType.price}
        </span>
      </div>

      <div className="border-t pt-2">
        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col">
            <div className="flex flex-row">
              <span className="text-muted-foreground text-xs">
                Tickets Sold
              </span>
              <Tooltip>
                <TooltipTrigger className="flex items-center">
                  <Info className="ml-1 h-4 w-4" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Amount of tickets sold across all time slots</p>
                </TooltipContent>
              </Tooltip>
            </div>

            <span className="font-medium">{ticketType._count.tickets}</span>
          </div>
          <div className="flex flex-col">
            <div className="flex flex-row">
              <span className="text-muted-foreground text-xs">
                Tickets Remaining
              </span>
              <Tooltip>
                <TooltipTrigger className="flex items-center">
                  <Info className="ml-1 h-4 w-4" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Amount of tickets remaining across all time slots</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <span className="font-medium">
              {quantity - ticketType._count.tickets}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-muted-foreground text-xs">Min Per Order</span>
            <span className="font-medium">{ticketType.minPerOrder}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-muted-foreground text-xs">Max Per Order</span>
            <span className="font-medium">{ticketType.maxPerOrder}</span>
          </div>
        </div>
      </div>

      <div className="border-t pt-2 text-xs">
        <div className="flex flex-col gap-1">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Sale Start:</span>
            <span>{formatDateTime(ticketType.saleStartTime)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Sale End:</span>
            <span>{formatDateTime(ticketType.saleEndTime)}</span>
          </div>
        </div>
      </div>

      {/* to manage ticket type inventory */}
      <InventoryDialog ticketType={ticketType} />

      {/* delete ticket type */}
      {/* <Button variant="outline" size="sm" className="w-full">
        <Trash color="red" className="mr-2" />
        Remove Ticket Type
      </Button> */}
    </div>
  );
}
