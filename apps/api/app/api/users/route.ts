import { withCors } from '@/app/lib/api';
import { database, serializePrisma } from '@repo/database';
import { type NextRequest, NextResponse } from 'next/server';

export const handler = async (request: NextRequest) => {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('query');
  const event = searchParams.get('event');
  const organizerId = searchParams.get('organizerId');
  const numericEvent = Number.parseInt(event ?? '');

  const users = await database.user.findMany({
    where: {
      OR: [
        {
          firstName: {
            contains: query ?? '',
            mode: 'insensitive',
          },
        },
        {
          lastName: {
            contains: query ?? '',
            mode: 'insensitive',
          },
        },
        {
          email: {
            contains: query ?? '',
            mode: 'insensitive',
          },
        },
        {
          phone: {
            contains: query ?? '',
            mode: 'insensitive',
          },
        },
      ],
      AND: [
        {
          orders: {
            some: {
              tickets: {
                some: {
                  eventId:
                    event && !Number.isNaN(numericEvent)
                      ? String(numericEvent)
                      : undefined,
                  event: {
                    organizerId: organizerId ?? undefined,
                  },
                },
              },
            },
          },
        },
      ],
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      _count: {
        select: {
          orders: {
            where: {
              tickets: {
                some: {
                  event: {
                    organizerId: organizerId ?? '',
                  },
                },
              },
            },
          },
        },
      },
      orders: {
        include: {
          tickets: {
            include: {
              event: true,
              ticketType: true,
            },
          },
        },
      },
    },
  });

  return NextResponse.json(
    { data: serializePrisma(users) },
    {
      status: 200,
    }
  );
};

export const OPTIONS = withCors(handler);
export const GET = withCors(handler);
