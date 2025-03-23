'use server';

import { auth } from '@repo/auth/server';
import { database, serializePrisma } from '@repo/database';
import type { PrismaNamespace } from '@repo/database';
import { slugify } from '@repo/design-system/lib/utils';
import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';

// TODO: start/end date should be > today
export async function createEvent(
  values: PrismaNamespace.EventUncheckedCreateInput
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error('Unauthorized');
  }

  if (!session.session?.organizerId) {
    throw new Error('Not an organizer');
  }

  // Get the organizer to check premium status
  const organizer = await database.organizer.findUnique({
    where: { id: session.session.organizerId },
    select: {
      isPremium: true,
      eventCredits: true,
      eventCreditsUsed: true,
    },
  });

  if (!organizer) {
    throw new Error('Organizer not found');
  }

  // Handle premium event creation
  if (values.isPremiumEvent) {
    // Check if organizer is premium or has event credits
    if (
      !organizer.isPremium &&
      organizer.eventCredits <= organizer.eventCreditsUsed
    ) {
      throw new Error(
        'You need to upgrade to premium or purchase more event credits to create a premium event'
      );
    }

    // Increment event credits used if not a premium user
    if (!organizer.isPremium) {
      await database.organizer.update({
        where: { id: session.session.organizerId },
        data: { eventCreditsUsed: { increment: 1 } },
      });
    }
  }

  // Enforce ticket limits for free users
  let maxTickets = values.maxTicketsPerEvent || 20;
  if (!values.isPremiumEvent && maxTickets > 20) {
    maxTickets = 20; // Enforce 20 ticket limit for free events
  }

  const slug = slugify(values.title);

  // Check if slug exists and append number if needed
  let finalSlug = slug;
  let counter = 1;
  while (await database.event.findUnique({ where: { slug: finalSlug } })) {
    finalSlug = `${slug}-${counter}`;
    counter++;
  }

  const newEvent = await database.event.create({
    data: {
      ...values,
      slug: finalSlug,
      organizerId: session.session.organizerId,
      maxTicketsPerEvent: maxTickets,
      isPremiumEvent: !!values.isPremiumEvent,
    },
  });

  revalidatePath('/events');

  return {
    success: true,
    data: serializePrisma(newEvent),
  };
}

export async function updateEvent(
  id: string,
  values: PrismaNamespace.EventUncheckedUpdateInput
) {
  // Get the current event to check premium status change
  const currentEvent = await database.event.findUnique({
    where: { id },
    select: {
      isPremiumEvent: true,
      organizerId: true,
    },
  });

  if (!currentEvent) {
    throw new Error('Event not found');
  }

  // Check if upgrading to premium event
  if (!currentEvent.isPremiumEvent && values.isPremiumEvent) {
    // Get the organizer to check premium status
    const organizer = await database.organizer.findUnique({
      where: { id: currentEvent.organizerId },
      select: {
        isPremium: true,
        eventCredits: true,
        eventCreditsUsed: true,
      },
    });

    if (!organizer) {
      throw new Error('Organizer not found');
    }

    // Check if organizer is premium or has event credits
    if (
      !organizer.isPremium &&
      organizer.eventCredits <= organizer.eventCreditsUsed
    ) {
      throw new Error(
        'You need to upgrade to premium or purchase more event credits to upgrade to a premium event'
      );
    }

    // Increment event credits used if not a premium user
    if (!organizer.isPremium) {
      await database.organizer.update({
        where: { id: currentEvent.organizerId },
        data: { eventCreditsUsed: { increment: 1 } },
      });
    }
  }

  // Enforce ticket limits for free events
  let maxTickets = values.maxTicketsPerEvent as number;
  if (maxTickets && !values.isPremiumEvent && maxTickets > 20) {
    maxTickets = 20; // Enforce 20 ticket limit for free events
  }

  let finalSlug: string | undefined;

  const updatedEvent = await database.event.update({
    where: { id },
    data: {
      ...values,
      ...(finalSlug && { slug: finalSlug }),
      ...(maxTickets && { maxTicketsPerEvent: maxTickets }),
    },
  });

  revalidatePath('/events');
  revalidatePath(`/events/${updatedEvent.slug}`);

  return {
    success: true,
    data: serializePrisma(updatedEvent),
  };
}
