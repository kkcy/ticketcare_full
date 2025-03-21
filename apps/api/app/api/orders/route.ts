import { getCorsHeaders } from '@/app/lib/api';
import { type Prisma, database, serializePrisma } from '@repo/database';
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
  const page = Number(searchParams.get('page') ?? '1');
  const limit = Number(searchParams.get('limit') ?? 10);
  const search = searchParams.get('search') ?? '';
  const organizerId = searchParams.get('organizerId');

  const skip = (page - 1) * limit;
  const numericSearch = Number.parseInt(search);
  const whereCondition: Prisma.OrderWhereInput = {
    ...(search
      ? {
          OR: [
            // Search by transaction ID
            ...(isNaN(numericSearch)
              ? []
              : [
                  {
                    id: numericSearch,
                  },
                ]),
            // Search by name
            {
              customer: {
                firstName: {
                  contains: search,
                  mode: 'insensitive',
                },
              },
            },
            // Search by name
            {
              customer: {
                lastName: {
                  contains: search,
                  mode: 'insensitive',
                },
              },
            },
            // Search by email
            {
              customer: {
                email: {
                  contains: search,
                  mode: 'insensitive',
                },
              },
            },
            // Search by event title
            // {
            //   tickets: {
            //     some: {
            //       event: {
            //         title: {
            //           contains: search,
            //           mode: "insensitive",
            //         },
            //       },
            //     },
            //   },
            // },
          ],
        }
      : {}),
    AND: [
      {
        tickets: {
          every: {
            event: {
              organizerId: organizerId ?? undefined,
            },
          },
        },
      },
    ],
  };

  const [orders, total] = await Promise.all([
    database.order.findMany({
      where: whereCondition,
      select: {
        id: true,
        status: true,
        paymentMethod: true,
        orderedAt: true,
        totalAmount: true,
        customer: {
          select: {
            firstName: true,
          },
        },
        tickets: {
          select: {
            id: true,
            eventId: true,
            event: {
              select: {
                title: true,
                startTime: true,
                venue: {
                  select: {
                    name: true,
                  },
                },
              },
            },
            ticketType: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        orderedAt: 'desc',
      },
      skip,
      take: limit,
    }),
    database.order.count({
      where: whereCondition,
    }),
  ]);

  return NextResponse.json(
    { data: serializePrisma(orders) },
    {
      status: 200,
      headers: getCorsHeaders(request.headers.get('origin') || ''),
    }
  );
};
