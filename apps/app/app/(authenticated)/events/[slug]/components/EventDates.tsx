import type { SerializedEvent } from '@/types';
import { CalendarIcon } from '@repo/design-system/components/icons';
import { format } from 'date-fns';
import { TimeSlotCard } from './time-slot/components/TimeSlotCard';
import { TimeSlotDialog } from './time-slot/components/TimeSlotDialog';

interface EventDatesProps {
  event: SerializedEvent;
}

export function EventDates({ event }: EventDatesProps) {
  return (
    <div className="space-y-6">
      <div className="rounded-lg border p-4">
        <div className="flex flex-col gap-1">
          <h2 className="font-semibold text-lg">Event Dates</h2>
          <p className="text-muted-foreground text-sm">
            Manage dates and time slots for this event.
          </p>
        </div>
      </div>

      {event.eventDates.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <h3 className="font-medium text-muted-foreground">
            No dates added yet
          </h3>
          <p className="mt-1 text-muted-foreground text-sm">
            Event dates are automatically synced with the event start time and
            end time.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {event.eventDates.map((eventDate) => (
            <EventDateView key={eventDate.id} eventDate={eventDate} />
          ))}
        </div>
      )}
    </div>
  );
}

function EventDateView({
  eventDate,
}: {
  eventDate: SerializedEvent['eventDates'][number];
}) {
  return (
    <div key={eventDate.id} className="rounded-lg border p-4">
      <div className="mb-3 flex items-center gap-2">
        <CalendarIcon className="h-4 w-4 text-muted-foreground" />
        <h3 className="font-semibold text-md">
          {format(new Date(eventDate.date), 'EEEE, MMMM d, yyyy')}
        </h3>
      </div>

      {eventDate.timeSlots.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          No time slots added for this date.
        </p>
      ) : (
        <div className="space-y-2">
          {eventDate.timeSlots.map((timeSlot) => (
            <TimeSlotCard key={timeSlot.id} timeSlot={timeSlot} />
          ))}
        </div>
      )}

      <div className="mt-3 flex justify-end">
        <TimeSlotDialog eventDate={eventDate} />
      </div>
    </div>
  );
}
