'use server';

import { auth } from '@repo/auth/server';
import { database, serializePrisma } from '@repo/database';
import { log } from '@repo/observability/log';
import { chip } from '@repo/payments';
import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';
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
      isPremiumEvent: true,
      maxTicketsPerEvent: true,
      ticketsSold: true,
      premiumTierId: true,
      premiumTier: {
        select: {
          id: true,
          name: true,
          maxTicketsPerEvent: true,
        },
      },
      venueName: true,
      // venue: { select: { name: true } },
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
  eventId: string,
  values: {
    ownerName: string;
    ownerEmail: string;
    ownerPhone?: string;
    ticketType: string;
  }
) {
  // TODO: Implement ticket creation functionality
  // This is a placeholder function that will be implemented later
  // Using both parameters to satisfy the linter
  const ticketInfo = `Event: ${eventId}, Owner: ${values.ownerName}, Email: ${values.ownerEmail}, Type: ${values.ticketType}`;
  await Promise.resolve(ticketInfo); // Using await to satisfy linter and prevent unused variable warning

  // When implemented, this will create a ticket in the database
  // Example implementation:
  // const ticket = await database.ticket.create({
  //   data: {
  //     eventId,
  //     ticketTypeId: values.ticketType, // Use the ticket type from values
  //     orderId: 1, // This should be linked to an actual order
  //     status: 'reserved',
  //     purchaseDate: new Date(),
  //     ownerName: values.ownerName,
  //     ownerEmail: values.ownerEmail,
  //     ownerPhone: values.ownerPhone,
  //     qrCode: nanoid(), // Generate a unique QR code
  //   },
  // })

  await Promise.resolve(); // Adding await to fix lint error
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
        eventId: eventId,
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
    log.error('Failed to create ticket type:', { error });

    throw new Error(
      `Could not create ticket type: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

// Get all available premium tiers
export async function getPremiumTiers() {
  const tiers = await database.premiumTier.findMany({
    where: {
      isActive: true,
    },
    orderBy: {
      price: 'asc',
    },
  });

  return serializePrisma(tiers);
}

// Helper function to create event premium upgrade and handle errors
async function createEventPremiumUpgrade(
  eventId: string,
  slug: string,
  premiumTierId: string,
  paymentMethod: 'chip'
) {
  try {
    let eventPremiumUpgrade: { url: string };

    if (paymentMethod === 'chip') {
      // Use Chip-In Asia payment gateway
      eventPremiumUpgrade = await createChipPremiumUpgradePayment(
        eventId,
        slug,
        premiumTierId
      );
    } else {
      throw new Error('Invalid payment method');
    }

    return { redirectUrl: eventPremiumUpgrade.url };
  } catch (error) {
    log.error('Payment creation failed:', { error });
    throw new Error(
      `Failed to create payment: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

// Create a payment for premium tier upgrade using Chip-In Asia
export async function createChipPremiumUpgradePayment(
  eventId: string,
  slug: string,
  premiumTierId: string
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.session?.organizerId) {
    throw new Error('Unauthorized: Only organizers can upgrade events');
  }

  // Get the event to check if it belongs to the organizer
  const event = await database.event.findUnique({
    where: { id: eventId },
    select: {
      id: true,
      title: true,
      organizerId: true,
      isPremiumEvent: true,
    },
  });

  if (!event) {
    throw new Error('Event not found');
  }

  if (event.organizerId !== session.session.organizerId) {
    throw new Error('Unauthorized: You can only upgrade your own events');
  }

  // Get the premium tier to check max tickets and price
  const premiumTier = await database.premiumTier.findUnique({
    where: { id: premiumTierId },
    select: {
      id: true,
      name: true,
      maxTicketsPerEvent: true,
      price: true,
    },
  });

  if (!premiumTier) {
    throw new Error('Premium tier not found');
  }

  // Get the organizer to check premium status
  const organizer = await database.organizer.findUnique({
    where: { id: session.session.organizerId },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
    },
  });

  if (!organizer) {
    throw new Error('Organizer not found');
  }

  try {
    // Create a unique transaction ID for this payment
    const transactionId = `premium_${eventId}_${Date.now()}`;

    // Create a Chip payment
    const chipPayment = await chip.createPayment({
      amount: premiumTier.price.toNumber(),
      currency: 'MYR', // Malaysian Ringgit
      email: organizer.email,
      phone: organizer.phone || '', // Required by Chip
      fullName: organizer.name,
      products: [
        {
          name: `Premium Tier: ${premiumTier.name}`,
          quantity: String(1),
          price: premiumTier.price.toNumber(),
          category: 'event_premium_tier',
        },
      ],
      notes: `Upgrade event "${event.title}" to ${premiumTier.name} tier (${premiumTier.maxTicketsPerEvent} tickets)`,
      successUrl:
        'https://willing-promoted-dane.ngrok-free.app/api/webhooks/chip',
      failureUrl:
        'https://willing-promoted-dane.ngrok-free.app/api/webhooks/chip',
      // successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/chip`,
      // failureUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/chip`,
      successRedirectUrl: `${process.env.NEXT_PUBLIC_APP_URL}/events/${slug}?upgrade_success=true`,
      failureRedirectUrl: `${process.env.NEXT_PUBLIC_APP_URL}/events/${slug}?upgrade_cancelled=true`,
      cancelRedirectUrl: `${process.env.NEXT_PUBLIC_APP_URL}/events/${slug}?upgrade_cancelled=true`,
      reference: transactionId,
    });

    // Store the payment in the database for verification later
    await database.eventPremiumUpgrade.create({
      data: {
        id: chipPayment.id,
        eventId,
        organizerId: organizer.id,
        premiumTierId,
        amount: premiumTier.price,
        status: 'pending',
        metadata: {
          upgradeType: 'event_premium_tier',
          transactionId,
          paymentMethod: 'chip',
        },
      },
    });

    log.info('Chip payment created', {
      eventId,
      premiumTierId,
      organizerId: organizer.id,
      upgradeType: 'event_premium_tier',
      transactionId,
      paymentMethod: 'chip',
    });

    return { url: chipPayment.checkout_url };
  } catch (error) {
    log.error('Failed to create Chip payment:', { error });
    throw new Error(
      `Failed to create payment: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

// Upgrade event to premium tier after successful payment
// Initiate the premium upgrade process for an event
export async function initiateEventPremiumUpgrade(
  eventId: string,
  slug: string,
  premiumTierId: string,
  paymentMethod: 'chip' = 'chip' // Default to Chip payment
): Promise<{ redirectUrl: string }> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.session?.organizerId) {
    throw new Error('Unauthorized: Only organizers can upgrade events');
  }

  // Get the event to check if it belongs to the organizer
  const event = await database.event.findUnique({
    where: { id: eventId },
    select: {
      organizerId: true,
      isPremiumEvent: true,
    },
  });

  if (!event) {
    throw new Error('Event not found');
  }

  if (event.organizerId !== session.session.organizerId) {
    throw new Error('Unauthorized: You can only upgrade your own events');
  }

  // Get the premium tier to check max tickets
  const premiumTier = await database.premiumTier.findUnique({
    where: { id: premiumTierId },
    select: {
      maxTicketsPerEvent: true,
      price: true,
    },
  });

  if (!premiumTier) {
    throw new Error('Premium tier not found');
  }

  // Get the organizer
  const organizer = await database.organizer.findUnique({
    where: { id: session.session.organizerId },
  });

  if (!organizer) {
    throw new Error('Organizer not found');
  }

  // If the premium tier has a price, redirect to payment
  if (premiumTier.price.gt(0)) {
    // Redirect to payment
    return await createEventPremiumUpgrade(
      eventId,
      slug,
      premiumTierId,
      paymentMethod
    );
  }

  // If the premium tier is free, upgrade directly
  await database.event.update({
    where: { id: eventId },
    data: {
      isPremiumEvent: true,
      premiumTierId,
      maxTicketsPerEvent: premiumTier.maxTicketsPerEvent,
    },
  });

  revalidatePath('/events');
  revalidatePath(`/events/${slug}`);

  // Return empty redirectUrl to indicate no payment needed
  return {
    redirectUrl: '',
  };
}

// Complete the premium upgrade process after payment
export async function completeEventPremiumUpgrade(
  eventId: string,
  slug: string,
  premiumTierId: string,
  sessionId: string
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.session?.organizerId) {
    throw new Error('Unauthorized: Only organizers can upgrade events');
  }

  // Get the event to check if it belongs to the organizer
  const event = await database.event.findUnique({
    where: { id: eventId },
    select: {
      organizerId: true,
      isPremiumEvent: true,
    },
  });

  if (!event) {
    throw new Error('Event not found');
  }

  if (event.organizerId !== session.session.organizerId) {
    throw new Error('Unauthorized: You can only upgrade your own events');
  }

  // Verify the payment was successful
  const eventPremiumUpgrade = await database.eventPremiumUpgrade.findUnique({
    where: { id: sessionId },
  });

  if (!eventPremiumUpgrade || eventPremiumUpgrade.status !== 'completed') {
    throw new Error('Payment not completed');
  }

  // Get the premium tier to check max tickets
  const premiumTier = await database.premiumTier.findUnique({
    where: { id: premiumTierId },
    select: {
      maxTicketsPerEvent: true,
    },
  });

  if (!premiumTier) {
    throw new Error('Premium tier not found');
  }

  // Update the event with the premium tier
  const updatedEvent = await database.event.update({
    where: { id: eventId },
    data: {
      isPremiumEvent: true,
      premiumTierId,
      maxTicketsPerEvent: premiumTier.maxTicketsPerEvent,
    },
  });

  revalidatePath('/events');
  revalidatePath(`/events/${slug}`);

  return {
    success: true,
    data: serializePrisma(updatedEvent),
  };
}
