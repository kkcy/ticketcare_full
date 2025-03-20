'use server';

import { auth } from '@repo/auth/server';
import { CartStatus, database, serializePrisma } from '@repo/database';
import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import { z } from 'zod';

const createCartSchema = z.object({
  timeSlotId: z.string(),
  ticketTypeId: z.string(),
  quantity: z.number().min(1),
});

export type CreateCartInput = z.infer<typeof createCartSchema>;

export async function getEvent(slug: string) {
  const event = await database.event.findUnique({
    where: {
      slug,
    },
    select: {
      id: true,
      slug: true,
      title: true,
      description: true,
      startTime: true,
      endTime: true,
      eventDates: {
        select: {
          id: true,
          date: true,
          timeSlots: {
            select: {
              id: true,
              startTime: true,
              endTime: true,
              doorsOpen: true,
              inventory: {
                select: {
                  id: true,
                  quantity: true,
                  ticketType: {
                    select: {
                      id: true,
                      name: true,
                      description: true,
                      price: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
      venue: {
        select: {
          name: true,
          address: true,
        },
      },
      organizer: {
        select: {
          logo: true,
          name: true,
          slug: true,
        },
      },
    },
  });

  if (!event) {
    return notFound();
  }

  return serializePrisma(event);
}

export async function createCart(input: CreateCartInput) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const userId = session?.user?.id || null;

  try {
    const { timeSlotId, ticketTypeId, quantity } =
      createCartSchema.parse(input);

    // Find existing active cart based on userId or session
    let cart = await database.cart.findFirst({
      where: {
        userId: userId,
        status: CartStatus.active,
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    if (cart) {
      // Update expiry of existing cart
      cart = await database.cart.update({
        where: { id: cart.id },
        data: {
          expiresAt: new Date(Date.now() + 15 * 60 * 1000), // Extend expiry
        },
      });
    } else {
      // Create new cart
      cart = await database.cart.create({
        data: {
          userId: userId,
          status: CartStatus.active,
          expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes from now
        },
      });
    }

    // Check if cart item already exists
    const existingCartItem = await database.cartItem.findFirst({
      where: {
        cartId: cart.id,
        timeSlotId: BigInt(timeSlotId),
        ticketTypeId: BigInt(ticketTypeId),
      },
    });

    if (existingCartItem) {
      // Update quantity if item exists
      await database.cartItem.update({
        where: { id: existingCartItem.id },
        data: { quantity },
      });
    } else {
      // Create new cart item
      await database.cartItem.create({
        data: {
          cartId: cart.id,
          timeSlotId: BigInt(timeSlotId),
          ticketTypeId: BigInt(ticketTypeId),
          quantity,
        },
      });
    }

    revalidatePath('/events/[slug]');

    return { cartId: cart.id };
  } catch (error) {
    console.error('Failed to create cart:', error);

    if (error instanceof z.ZodError) {
      throw new Error(`Invalid input: ${error.errors[0].message}`);
    }

    throw new Error('Failed to create cart');
  }
}
