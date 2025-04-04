import { auth } from '@repo/auth/server';
import { database } from '@repo/database';
import {
  CalendarIcon,
  ClockIcon,
  MapPinIcon,
  StarIcon,
} from '@repo/design-system/components/icons';
import { Badge } from '@repo/design-system/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@repo/design-system/components/ui/card';
import { headers } from 'next/headers';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export const UpcomingEvents = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.session?.organizerId) {
    // should not happen. all app.ticketcare user is an organizer
    return notFound();
  }

  const events = await database.event.findMany({
    where: {
      startTime: {
        gte: new Date(),
      },
      organizerId: session.session.organizerId,
    },
    select: {
      id: true,
      slug: true,
      title: true,
      description: true,
      startTime: true,
      venueName: true,
      // venue: {
      //   select: {
      //     name: true,
      //   },
      // },
      isPremiumEvent: true,
      maxTicketsPerEvent: true,
    },
    orderBy: {
      startTime: 'desc',
    },
  });

  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <p className="font-medium text-gray-600 text-lg">No upcoming events</p>
        <p className="text-gray-500 text-sm">
          Create a new event to get started
        </p>
      </div>
    );
  }

  return (
    <div className="grid min-h-[100vh] flex-1 auto-rows-max gap-4 md:min-h-min lg:grid-cols-3">
      {events.map((event) => (
        <Link key={event.id} href={`/events/${event.slug}`}>
          <Card className="transition-shadow hover:shadow-md">
            <CardHeader className="font-semibold text-lg">
              <div className="flex items-center justify-between">
                <CardTitle>{event.title}</CardTitle>
                {event.isPremiumEvent && (
                  <Badge
                    variant="secondary"
                    className="premium-badge"
                    style={{
                      backgroundColor: '#fef3c7',
                      marginLeft: '0.5rem',
                      color: '#92400e',
                      display: 'flex',
                      gap: '0.25rem',
                      alignItems: 'center',
                    }}
                  >
                    <StarIcon className="h-3 w-3" />
                    Premium
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-1 text-sm">
              <p className="flex items-center">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {event.startTime.toISOString().split('T')[0]}
              </p>
              <p className="flex items-center">
                <ClockIcon className="mr-2 h-4 w-4" />
                {event.startTime.toISOString().split('T')[1]}
              </p>
              <p className="flex items-center">
                <MapPinIcon className="mr-2 h-4 w-4" />
                {event.venueName}
                {/* {event.venue.name} */}
              </p>
            </CardContent>
            <CardFooter>
              <CardDescription>{event.description}</CardDescription>
            </CardFooter>
          </Card>
        </Link>
      ))}
    </div>
  );
};
