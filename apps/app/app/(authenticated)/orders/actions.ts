'use server';
import { randomUUID } from 'node:crypto';
import { auth } from '@repo/auth/server';
import {
  type PrismaNamespace,
  database,
  serializePrisma,
} from '@repo/database';
import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import type { OrderFormValues } from './components/OrderForm';

interface SearchOrdersParams {
  search?: string;
  page?: number;
  pageSize?: number;
}

export async function getOrders() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return notFound();
  }

  const orders = await database.order
    .findMany({
      where: {
        tickets: {
          every: {
            event: {
              organizerId: session.user.id,
            },
          },
        },
      },
      select: {
        id: true,
        status: true,
        paymentMethod: true,
        orderedAt: true,
        totalAmount: true,
        user: {
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
    })
    .then((orders) => serializePrisma(orders));

  return orders;
}

export async function searchOrders({
  search = '',
  page = 1,
  pageSize = 10,
}: SearchOrdersParams) {
  const skip = (page - 1) * pageSize;
  const numericSearch = Number.parseInt(search);

  const whereCondition: PrismaNamespace.OrderWhereInput = search
    ? {
        OR: [
          // Search by transaction ID
          ...(Number.isNaN(numericSearch)
            ? []
            : [
                {
                  id: numericSearch,
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
    : {};

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
      take: pageSize,
    }),
    database.order.count({
      where: whereCondition,
    }),
  ]);

  return {
    orders: serializePrisma(orders),
    pagination: {
      total,
      pageCount: Math.ceil(total / pageSize),
      currentPage: page,
    },
  };
}

export async function createOrder(data: OrderFormValues) {
  const ticketType = await database.ticketType.findUnique({
    where: { id: BigInt(data.ticketTypeId) },
  });

  if (!ticketType) {
    throw new Error('Ticket type not found');
  }

  let user: Partial<
    PrismaNamespace.UserGetPayload<{
      select: {
        id: true;
        firstName: true;
        lastName: true;
      };
    }>
  > | null;

  if (!data.customerName || !data.customerEmail) {
    throw new Error('Missing customer name/email');
  }

  if (!data.userId) {
    const [firstName, ...lastNameParts] = data.customerName.split(' ');
    const lastName = lastNameParts.join(' ');

    // First, try to find an existing user by email
    user = await database.user.findFirst({
      select: {
        id: true,
        firstName: true,
        lastName: true,
      },
      where: {
        email: data.customerEmail,
      },
    });

    // If no user exists, create one
    if (!user && data.customerEmail) {
      // TODO: create a user in supabase
      user = await database.user.create({
        data: {
          id: randomUUID(), // Generate a UUID for Supabase
          firstName,
          lastName: lastName || firstName, // Use firstName as lastName if no lastName provided
          name: data.customerName,
          email: data.customerEmail,
          emailVerified: false,
          phone: data.customerPhone,
          dob: new Date('2000-01-01'), // TODO
        },
      });
    }
  }

  // Start a transaction to create order and tickets
  const result = await database.$transaction(async (tx) => {
    // Create the order
    const order = await tx.order.create({
      data: {
        userId: data.userId ?? user?.id ?? '', // TODO
        status: data.status,
        totalAmount: data.quantity * ticketType.price.toNumber(),
        paymentMethod: data.paymentMethod,
        transactionId: randomUUID(), // TODO
        paymentStatus: data.paymentStatus,
        orderedAt: data.orderedAt,
      },
    });

    // Validate quantity against min/max per order
    if (
      data.quantity < ticketType.minPerOrder ||
      data.quantity > ticketType.maxPerOrder
    ) {
      throw new Error(
        `Quantity must be between ${ticketType.minPerOrder} and ${ticketType.maxPerOrder}`
      );
    }

    // TODO: timeslot
    // Create tickets
    // const tickets = await Promise.all(
    //   Array.from({ length: data.quantity }).map(async () => {
    //     return tx.ticket.create({
    //       data: {
    //         eventId: BigInt(data.eventId),
    //         ticketTypeId: BigInt(data.ticketTypeId),
    //         orderId: order.id,
    //         status: 'purchased',
    //         purchaseDate: new Date(),
    //         ownerName: data.customerName,
    //         ownerEmail: data.customerEmail,
    //         ownerPhone: data.customerPhone,
    //         qrCode: randomUUID(), // Generate a unique QR code
    //       },
    //     })
    //   })
    // )

    return { order, tickets: [] };
  });

  console.log(result);

  revalidatePath('/orders');

  return {
    success: true,
    data: serializePrisma(result.order),
  };
}
