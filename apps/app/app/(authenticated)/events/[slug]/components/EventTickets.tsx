import type { SerializedEvent } from '@/types';
import { TicketTypeDialog } from './TicketTypeDialog';

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

          <TicketTypeDialog event={event} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {event.ticketTypes.map((ticketType) => (
          <TicketTypeView key={ticketType.id} ticketType={ticketType} />
        ))}
      </div>
    </div>
  );
}

function TicketTypeView({
  ticketType,
}: {
  ticketType: SerializedEvent['ticketTypes'][number];
}) {
  const quantity = ticketType.inventory.reduce(
    (acc, inv) => acc + inv.quantity,
    0
  );

  return (
    <div key={ticketType.id} className="rounded-lg border p-4">
      <h3 className="mb-2 font-semibold text-md">{ticketType.name}</h3>
      <p className="text-muted-foreground">{ticketType.description}</p>
      <p className="text-muted-foreground">Price: ${ticketType.price}</p>
      <p className="text-muted-foreground">
        Tickets Sold: {ticketType._count.tickets}
      </p>
      <p className="text-muted-foreground">
        Tickets Remaining: {quantity - ticketType._count.tickets}
      </p>
    </div>
  );
}
