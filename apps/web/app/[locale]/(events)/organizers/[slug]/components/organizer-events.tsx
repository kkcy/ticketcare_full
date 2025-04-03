'use client';

import type { SerializedOrganizer } from '@/app/types';
import { Badge } from '@repo/design-system/components/ui/badge';
import {
  Card,
  CardFooter,
  CardHeader,
} from '@repo/design-system/components/ui/card';
import { formatDate } from '@repo/design-system/lib/format';
import { cn } from '@repo/design-system/lib/utils';
import Link from 'next/link';

interface OrganizerEventsProps {
  organizer: SerializedOrganizer;
}

export function OrganizerEvents({ organizer }: OrganizerEventsProps) {
  return (
    <div className="space-y-6">
      <h2 className="font-semibold text-md">
        Events ({organizer._count.events})
      </h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {organizer.events.map((event) => (
          <EventCard key={event.slug} event={event} />
        ))}
      </div>
    </div>
  );
}

function EventCard({
  event,
}: {
  event: SerializedOrganizer['events'][number];
}) {
  return (
    <Link href={`/events/${event.slug}`}>
      <Card
        className={cn(
          'relative h-96 w-full overflow-hidden',
          'bg-[url(/event-placeholder-1.png)] bg-center bg-cover', // TODO: replace with event image
          'z-10 flex flex-col justify-between'
        )}
      >
        <CardHeader>
          <div className="flex flex-row items-center space-x-4">
            <div className="flex flex-col gap-1">
              <Badge>{formatDate(new Date(event.startTime))}</Badge>
            </div>
          </div>
        </CardHeader>

        <CardFooter className="space-y-2">
          <div className="w-full space-y-2">
            <div className="flex gap-1">
              {event.category.map((category) => (
                <Badge key={category} variant="secondary">
                  {category}
                </Badge>
              ))}
            </div>
            <div className="flex flex-col">
              <h1 className="font-bold text-md md:text-xl">{event.title}</h1>
              <p className="text-sm">{event.venue.name}</p>
            </div>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
