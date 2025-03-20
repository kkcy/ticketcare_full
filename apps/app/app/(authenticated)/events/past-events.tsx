import { auth } from '@repo/auth/server';
import { database } from '@repo/database';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@repo/design-system/components/ui/card';
import { CalendarIcon, ClockIcon, MapPinIcon } from 'lucide-react';
import { headers } from 'next/headers';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export const PastEvents = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect('/');
  }

  const events = await database.event.findMany({
    where: {
      startTime: {
        lt: new Date(),
      },
      organizerId: session.user.id,
    },
    include: {
      venue: true,
    },
  });

  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <p className="font-medium text-gray-600 text-lg">No past events</p>
        <p className="text-gray-500 text-sm">Past events will appear here</p>
      </div>
    );
  }

  return (
    <div className="grid min-h-[100vh] flex-1 auto-rows-min gap-4 md:min-h-min lg:grid-cols-3">
      {events.map((event) => (
        <Link key={event.id} href={`/events/${event.slug}`}>
          <Card className="transition-shadow hover:shadow-md">
            <CardHeader className="font-semibold text-lg">
              <CardTitle>{event.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-gray-600 text-sm">
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
                {event.venue.name}
              </p>
            </CardContent>
            <CardFooter>
              <CardDescription className="text-foreground">
                {event.description}
              </CardDescription>
            </CardFooter>
          </Card>
        </Link>
      ))}
    </div>
  );
};
