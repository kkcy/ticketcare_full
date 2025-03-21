import { getCorsHeaders } from '@/app/lib/api';
import { database, serializePrisma } from '@repo/database';
import { type NextRequest, NextResponse } from 'next/server';

/**
 * Basic OPTIONS Request to simuluate OPTIONS preflight request for mutative requests
 */
export const OPTIONS = async (request: NextRequest) => {
  // Return Response
  return NextResponse.json(
    {},
    {
      status: 200,
      headers: getCorsHeaders(request.headers.get('origin') || ''),
    }
  );
};

/**
 * Basic GET Request
 * @param request
 * @returns
 */
export const GET = async (request: NextRequest) => {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('query');
  const event = searchParams.get('event');
  const organizerId = searchParams.get('organizerId');
  const numericEvent = Number.parseInt(event ?? '');

  const customers = await database.customer.findMany({
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
                    event && !isNaN(numericEvent) ? numericEvent : undefined,
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
      type: true,
      firstName: true,
      lastName: true,
      email: true,
      eventTypes: true,
      lastLogin: true,
      balance: true,
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
    { data: serializePrisma(customers) },
    {
      status: 200,
      headers: getCorsHeaders(request.headers.get('origin') || ''),
    }
  );
};
