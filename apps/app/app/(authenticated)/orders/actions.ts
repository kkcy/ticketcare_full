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
import type { OrderFormValues } from './form';

interface SearchOrdersParams {
  search?: string;
  page?: number;
  pageSize?: number;
}

export async function getOrders() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user || !session.session.organizerId) {
    return notFound();
  }

  const orders = await database.order
    .findMany({
      where: {
        tickets: {
          every: {
            event: {
              organizerId: session.session.organizerId,
            },
          },
        },
      },
      select: {
        id: true,
        userId: true,
        eventId: true,
        status: true,
        totalAmount: true,
        paymentMethod: true,
        transactionId: true,
        paymentStatus: true,
        orderedAt: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            firstName: true,
            email: true,
            phone: true,
          },
        },
        event: true,
        tickets: {
          select: {
            id: true,
            timeSlotId: true,
            ticketTypeId: true,
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
  // fetch ticket type
  const ticketType = await database.ticketType.findUnique({
    where: { id: data.ticketTypeId },
  });
  if (!ticketType) {
    throw new Error('Ticket type not found');
  }

  // Validate quantity against min/max per order
  if (
    data.quantity < ticketType.minPerOrder ||
    data.quantity > ticketType.maxPerOrder
  ) {
    throw new Error(
      `Quantity must be between ${ticketType.minPerOrder} and ${ticketType.maxPerOrder}`
    );
  }

  // Validate time slot exists
  const timeSlot = await database.timeSlot.findUnique({
    where: { id: data.timeSlotId },
  });
  if (!timeSlot) {
    throw new Error('Time slot not found');
  }

  // Check inventory availability
  const inventory = await database.inventory.findFirst({
    where: {
      ticketTypeId: data.ticketTypeId,
      timeSlotId: data.timeSlotId,
    },
  });
  if (!inventory || inventory.quantity < data.quantity) {
    throw new Error('Not enough tickets available for this time slot');
  }

  let user: Partial<
    PrismaNamespace.UserGetPayload<{
      select: {
        id: true;
        firstName: true;
        lastName: true;
        email: true;
        phone: true;
      };
    }>
  > | null;

  if (data.userId === '-1') {
    // if userId === '-1', create new user else get user by id
    if (!data.customerName || !data.customerEmail) {
      throw new Error('Missing customer name/email');
    }

    const [firstName, ...lastNameParts] = data.customerName.split(' ');
    const lastName = lastNameParts.join(' ');

    // First, try to find an existing user by email
    user = await database.user.findFirst({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
      },
      where: {
        email: data.customerEmail,
      },
    });

    // If no user exists, create one
    if (!user && data.customerEmail && data.customerName) {
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

    if (!user) {
      throw new Error('Failed to create user');
    }
  } else {
    user = await database.user.findUnique({
      where: { id: data.userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
      },
    });

    if (!user) {
      throw new Error('User does not exist');
    }
  }

  // Start a transaction to create order and tickets
  const result = await database.$transaction(async (tx) => {
    // Create the order
    const order = await tx.order.create({
      data: {
        userId: user.id ?? data.userId,
        status: 'pending',
        totalAmount: data.quantity * ticketType.price.toNumber(),
        paymentMethod: data.paymentMethod,
        transactionId: randomUUID(), // TODO
        paymentStatus: data.paymentStatus,
        orderedAt: new Date(),
      },
    });

    // Create tickets in bulk using createMany
    await tx.ticket.createMany({
      data: Array.from({ length: data.quantity }).map(() => ({
        eventId: data.eventId,
        ticketTypeId: data.ticketTypeId,
        timeSlotId: data.timeSlotId,
        orderId: order.id,
        status: 'purchased',
        purchaseDate: new Date(),
        ownerName:
          user.firstName && user.lastName
            ? `${user.firstName} ${user.lastName}`
            : data.customerName || '',
        ownerEmail: user.email || data.customerEmail || '',
        ownerPhone: user.phone || data.customerPhone || '',
        qrCode: randomUUID(), // Generate a unique QR code
      })),
    });

    // Fetch the created tickets to return them
    const createdTickets = await tx.ticket.findMany({
      where: {
        orderId: order.id,
      },
    });

    // Update inventory quantity after creating tickets
    await tx.inventory.update({
      where: {
        id: inventory.id,
      },
      data: {
        quantity: {
          decrement: data.quantity,
        },
      },
    });

    return { order, tickets: createdTickets };
  });

  revalidatePath('/orders');

  return {
    success: true,
    data: {
      order: serializePrisma(result.order),
      tickets: result.tickets.map((ticket) => serializePrisma(ticket)),
    },
  };
}
