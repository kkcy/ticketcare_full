import type { SerializedEvent } from '@/app/types';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@repo/design-system/components/ui/avatar';
import { Button } from '@repo/design-system/components/ui/button';
import { Separator } from '@repo/design-system/components/ui/separator';
import Link from 'next/link';

interface EventAboutProps {
  event: SerializedEvent;
}

export function EventAbout({ event }: EventAboutProps) {
  return (
    <div className="space-y-[24px]">
      <h2 className="font-semibold">About Event</h2>

      {/* TODO: replace with markdown */}
      <p className="text-muted-foreground">{event.description}</p>

      <Separator />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href={`/organizers/${event.organizer?.slug}`}>
            <Avatar>
              <AvatarImage src={event.organizer?.logo ?? ''} />
              <AvatarFallback>
                {event.organizer?.name?.charAt(0)}
              </AvatarFallback>
            </Avatar>
          </Link>
          <div>
            <Link href={`/organizers/${event.organizer?.slug}`}>
              <p className="font-medium">{event.organizer?.name}</p>
            </Link>
            <p className="text-muted-foreground text-sm">Organizer</p>
          </div>
        </div>
        <Button>Follow</Button>
      </div>

      <Separator />
    </div>
  );
}
