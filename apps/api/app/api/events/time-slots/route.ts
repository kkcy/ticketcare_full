import { withCors } from '@/app/lib/api';
import { database, serializePrisma } from '@repo/database';
import { type NextRequest, NextResponse } from 'next/server';

export const handler = async (request: NextRequest) => {
  const searchParams = request.nextUrl.searchParams;
  const eventId = searchParams.get('eventId');

  // If eventId is provided, find all time slots for that event
  // This requires joining through eventDates since time slots are linked to event dates
  const timeSlots = await database.timeSlot.findMany({
    where: {
      eventDate: eventId
        ? {
            eventId: eventId,
          }
        : undefined,
    },
    select: {
      id: true,
      startTime: true,
      endTime: true,
      doorsOpen: true,
      eventDate: {
        select: {
          id: true,
          date: true,
          event: {
            select: {
              id: true,
              title: true,
            },
          },
        },
      },
    },
    orderBy: [
      {
        eventDate: {
          date: 'asc',
        },
      },
      {
        startTime: 'asc',
      },
    ],
  });

  return NextResponse.json(
    { data: serializePrisma(timeSlots) },
    {
      status: 200,
    }
  );
};

export const OPTIONS = withCors(handler);
export const GET = withCors(handler);
