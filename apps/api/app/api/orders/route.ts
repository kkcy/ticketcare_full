import { withCors } from '@/app/lib/api';
import {
  type PrismaNamespace,
  database,
  serializePrisma,
} from '@repo/database';
import { type NextRequest, NextResponse } from 'next/server';

export const handler = async (request: NextRequest) => {
  const searchParams = request.nextUrl.searchParams;
  const page = Number(searchParams.get('page') ?? '1');
  const limit = Number(searchParams.get('limit') ?? 10);
  const search = searchParams.get('search') ?? '';
  const organizerId = searchParams.get('organizerId');

  const skip = (page - 1) * limit;
  const numericSearch = Number.parseInt(search);
  const whereCondition: PrismaNamespace.OrderWhereInput = {
    ...(search
      ? {
          OR: [
            // Search by transaction ID
            ...(Number.isNaN(numericSearch)
              ? []
              : [
                  {
                    id: String(numericSearch),
                  },
                ]),
            // Search by name
            {
              user: {
                firstName: {
                  contains: search,
                  mode: 'insensitive',
                },
              },
            },
            // Search by name
            {
              user: {
                lastName: {
                  contains: search,
                  mode: 'insensitive',
                },
              },
            },
            // Search by email
            {
              user: {
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
        user: {
          select: {
            name: true,
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
    }
  );
};

export const OPTIONS = withCors(handler);
export const GET = withCors(handler);
