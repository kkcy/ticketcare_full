import type { SerializedEvent } from '@/types';
import { Activity, CalendarDays, Info, MapPin } from 'lucide-react';
import { title } from 'radash';
import { ShareButtons } from './ShareButtons';

interface EventSummaryProps {
  event: SerializedEvent;
}

export function EventSummary({ event }: EventSummaryProps) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border p-4">
          <div className="flex items-center gap-2">
            <Info className="h-4 w-4 text-muted-foreground" />
            <h3 className="font-semibold">Event Details</h3>
          </div>
          <p className="mt-2 text-muted-foreground text-sm">
            {event.description}
          </p>
        </div>
        <div className="rounded-lg border p-4">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <h3 className="font-semibold">Venue</h3>
          </div>
          <p className="mt-2 text-muted-foreground text-sm">
            {event.venue.name}
          </p>
        </div>
        <div className="rounded-lg border p-4">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
            <h3 className="font-semibold">Date & Time</h3>
          </div>
          <p className="mt-2 text-muted-foreground text-sm">
            {new Date(event.startTime).toLocaleString()}
          </p>
        </div>
        <div className="rounded-lg border p-4">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-muted-foreground" />
            <h3 className="font-semibold">Status</h3>
          </div>
          <p className="mt-2 text-muted-foreground text-sm">
            {title(event.status)}
          </p>
        </div>
      </div>
      <ShareButtons event={event} />
    </div>
  );
}
