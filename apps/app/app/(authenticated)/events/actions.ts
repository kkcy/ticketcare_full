'use server';

import { auth } from '@repo/auth/server';
import { database, serializePrisma } from '@repo/database';
import type { PrismaNamespace } from '@repo/database';
import { slugify } from '@repo/design-system/lib/utils';
import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';

// Helper function to get dates between two dates
function getDatesInRange(startDate: Date, endDate: Date): Date[] {
  const dates: Date[] = [];
  const currentDate = new Date(startDate);

  // Strip time part for date comparison
  const endDateWithoutTime = new Date(endDate);
  endDateWithoutTime.setHours(0, 0, 0, 0);

  // Set time to beginning of day for comparison
  currentDate.setHours(0, 0, 0, 0);

  // Add each date in the range
  while (currentDate <= endDateWithoutTime) {
    dates.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return dates;
}

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

  // Get the organizer
  const organizer = await database.organizer.findUnique({
    where: { id: session.session.organizerId },
  });

  if (!organizer) {
    throw new Error('Organizer not found');
  }

  // Handle premium event creation
  if (values.isPremiumEvent && !values.premiumTierId) {
    throw new Error('Premium tier must be specified for premium events');
  }

  // For premium events, we'll create the event first, then handle the premium upgrade separately
  // The EventPremiumUpgrade model will track the premium status

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

  // Create the event first
  const newEvent = await database.event.create({
    data: {
      ...values,
      slug: finalSlug,
      organizerId: session.session.organizerId,
      maxTicketsPerEvent: maxTickets,
      isPremiumEvent: !!values.isPremiumEvent,
    },
  });

  // Get the dates between startTime and endTime
  if (values.startTime && values.endTime) {
    const startTime = new Date(values.startTime);
    const endTime = new Date(values.endTime);

    // Get all dates between start and end
    const dates = getDatesInRange(startTime, endTime);

    // Create an EventDate for each day with a TimeSlot
    for (const date of dates) {
      // For each date, create a time slot with the same time part as the original event
      const dateStartTime = new Date(date);
      dateStartTime.setHours(
        startTime.getHours(),
        startTime.getMinutes(),
        startTime.getSeconds()
      );

      const dateEndTime = new Date(date);
      dateEndTime.setHours(
        endTime.getHours(),
        endTime.getMinutes(),
        endTime.getSeconds()
      );

      // Create the EventDate with TimeSlot
      await database.eventDate.create({
        data: {
          eventId: newEvent.id,
          date: date,
          // Just use the same time as event on default
          timeSlots: {
            create: [
              {
                startTime: dateStartTime,
                endTime: dateEndTime,
                doorsOpen: dateStartTime,
              },
            ],
          },
        },
      });
    }
  }

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
  // Get the current event to check premium status change && time changes
  const currentEvent = await database.event.findUnique({
    where: { id },
    select: {
      isPremiumEvent: true,
      organizerId: true,
      startTime: true,
      endTime: true,
    },
  });

  if (!currentEvent) {
    throw new Error('Event not found');
  }

  // Check if upgrading to premium event
  if (
    !currentEvent.isPremiumEvent &&
    values.isPremiumEvent &&
    !values.premiumTierId
  ) {
    throw new Error('Premium tier must be specified for premium events');
  }

  // For premium events, the EventPremiumUpgrade model will track the premium status
  // No need to check organizer status as we're using the premium upgrade model

  // Enforce ticket limits for free events
  let maxTickets = values.maxTicketsPerEvent as number;
  if (maxTickets && !values.isPremiumEvent && maxTickets > 20) {
    maxTickets = 20; // Enforce 20 ticket limit for free events
  }

  let finalSlug: string | undefined;

  // Get the new start and end times
  const oldStartTime = new Date(currentEvent.startTime);
  const oldEndTime = new Date(currentEvent.endTime);
  const newStartTime = new Date(values.startTime as string);
  const newEndTime = new Date(values.endTime as string);

  // Check if start or end time has changed by comparing timestamps
  const startTimeChanged = oldStartTime.getTime() !== newStartTime.getTime();
  const endTimeChanged = oldEndTime.getTime() !== newEndTime.getTime();

  // Update event dates if start or end time has changed
  if (
    (startTimeChanged || endTimeChanged) &&
    values.startTime &&
    values.endTime
  ) {
    // First, delete all existing event dates for this event
    await database.eventDate.deleteMany({
      where: {
        eventId: id,
      },
    });

    // Get all dates between new start and end
    const dates = getDatesInRange(newStartTime, newEndTime);

    // Create new event dates with time slots
    for (const date of dates) {
      // For each date, create a time slot with the same time part as the updated event
      const dateStartTime = new Date(date);
      dateStartTime.setHours(
        newStartTime.getHours(),
        newStartTime.getMinutes(),
        newStartTime.getSeconds()
      );
      const dateEndTime = new Date(date);
      dateEndTime.setHours(
        newEndTime.getHours(),
        newEndTime.getMinutes(),
        newEndTime.getSeconds()
      );
      // Create the EventDate with TimeSlot
      await database.eventDate.create({
        data: {
          eventId: id,
          date: date,
          timeSlots: {
            create: [
              {
                startTime: dateStartTime,
                endTime: dateEndTime,
                doorsOpen: dateStartTime,
              },
            ],
          },
        },
      });
    }
  }

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
