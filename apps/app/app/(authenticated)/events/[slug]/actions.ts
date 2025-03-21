'use server';

import { database, serializePrisma } from '@repo/database';
import { revalidatePath } from 'next/cache';
import { notFound } from 'next/navigation';

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
      doorsOpen: true,
      status: true,
      isPublic: true,
      requiresApproval: true,
      waitingListEnabled: true,
      refundPolicy: true,
      category: true,
      venueId: true,
      heroImageUrl: true,
      carouselImageUrls: true,
      venue: { select: { name: true } },
      ticketTypes: {
        select: {
          id: true,
          name: true,
          description: true,
          price: true,
          inventory: true,
          _count: {
            select: {
              tickets: true,
            },
          },
        },
      },
    },
  });

  if (!event) {
    return notFound();
  }

  return serializePrisma(event);
}

export async function updateEventStatus(
  slug: string,
  status: 'draft' | 'published' | 'cancelled' | 'sold_out'
) {
  const updatedEvent = await database.event.update({
    where: { slug },
    data: { status },
  });

  // Create a promise that resolves after revalidation
  await Promise.all([
    new Promise((resolve) => {
      revalidatePath('/events');
      revalidatePath(`/events/${updatedEvent.slug}`);
      resolve(true);
    }),
  ]);

  return {
    success: true,
    data: serializePrisma(updatedEvent),
  };
}

export async function createTicket(
  eventId: bigint,
  values: {
    ownerName: string;
    ownerEmail: string;
    ownerPhone?: string;
    ticketType: string;
  }
) {
  // TODO: pass timeslot id
  // const ticket = await database.ticket.create({
  //   data: {
  //     eventId,
  //     ticketTypeId: 1, // You might want to make this dynamic based on your ticket types
  //     orderId: 1, // This should be linked to an actual order
  //     status: 'reserved',
  //     purchaseDate: new Date(),
  //     ownerName: values.ownerName,
  //     ownerEmail: values.ownerEmail,
  //     ownerPhone: values.ownerPhone,
  //     qrCode: nanoid(), // Generate a unique QR code
  //   },
  // })

  revalidatePath('/events');
  revalidatePath(`/events/${eventId}`);

  return {
    success: true,
    data: {},
    // data: serializePrisma(ticket),
  };
}

export async function createTicketType(
  eventId: string,
  slug: string,
  ticketTypeData: {
    name: string;
    description?: string;
    price: number;
    quantity: number;
    maxPerOrder: number;
    minPerOrder: number;
    saleStartTime: Date;
    saleEndTime: Date;
  }
) {
  try {
    const ticketType = await database.ticketType.create({
      data: {
        eventId: BigInt(eventId),
        ...ticketTypeData,
      },
    });

    // Optionally revalidate paths or perform additional actions
    revalidatePath(`/events/${slug}`);

    return {
      success: true,
      ticketType: serializePrisma(ticketType),
    };
  } catch (error) {
    console.error('Failed to create ticket type:', error);
    throw new Error('Could not create ticket type');
  }
}
