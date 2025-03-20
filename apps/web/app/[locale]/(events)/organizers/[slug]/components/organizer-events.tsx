'use client';

import type { SerializedOrganizer } from '@/app/types';
import { Badge } from '@repo/design-system/components/ui/badge';
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
      <div className="group/card w-full">
        <div
          className={cn(
            'card backgroundImage relative mx-auto flex h-96 cursor-pointer flex-col justify-between overflow-hidden rounded-lg p-4 shadow-xl',
            'bg-[url(/event-placeholder-1.png)] bg-cover'
          )}
        >
          <div className="absolute top-0 left-0 h-full w-full opacity-60 transition duration-300 group-hover/card:bg-black" />
          <div className="z-10 flex flex-row items-center space-x-4">
            <div className="flex flex-col gap-1">
              <p className="relative z-10 font-normal text-base text-gray-50">
                <Badge>{formatDate(new Date(event.startTime))}</Badge>
              </p>
            </div>
          </div>
          <div className="text content mb-2 space-y-2">
            <div className="flex gap-1">
              {event.category.map((category) => (
                <Badge key={category} variant="secondary">
                  {category}
                </Badge>
              ))}
            </div>
            <div>
              <h1 className="relative z-10 font-bold text-gray-50 text-md md:text-2xl">
                {event.title}
              </h1>
              <p className="relative z-10 font-normal text-gray-50 text-sm">
                {event.venue.name}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
