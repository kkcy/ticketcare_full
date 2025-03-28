'use server';
import {
  type PrismaNamespace,
  database,
  serializePrisma,
} from '@repo/database';
import { log } from '@repo/observability/log';
import { revalidatePath } from 'next/cache';

/**
 * Create a new time slot for an event date
 */
export async function createTimeSlot(
  eventDateId: string,
  data: PrismaNamespace.TimeSlotUncheckedCreateInput
) {
  try {
    // Find the event date to ensure it exists
    const eventDate = await database.eventDate.findUnique({
      where: { id: eventDateId },
      include: { event: true },
    });

    if (!eventDate) {
      throw new Error('Event date not found');
    }

    // Parse the input dates
    const newStartTime = new Date(data.startTime);
    const newEndTime = new Date(data.endTime);
    const newDoorsOpen = data.doorsOpen
      ? new Date(data.doorsOpen)
      : newStartTime;

    // Validate time slot (end time must be after start time)
    if (newEndTime <= newStartTime) {
      return {
        success: false,
        error: 'End time must be after start time',
      };
    }

    // Check for conflicts with existing time slots
    const existingTimeSlots = await database.timeSlot.findMany({
      where: { eventDateId },
    });

    // Check for overlaps with existing time slots
    const hasConflict = existingTimeSlots.some((slot) => {
      const existingStart = new Date(slot.startTime);
      const existingEnd = new Date(slot.endTime);

      // Check if the new time slot overlaps with an existing one
      // Overlap occurs when:
      // 1. New start time is between existing start and end times
      // 2. New end time is between existing start and end times
      // 3. New time slot completely contains the existing one
      // 4. New time slot is completely contained by the existing one
      return (
        (newStartTime >= existingStart && newStartTime < existingEnd) ||
        (newEndTime > existingStart && newEndTime <= existingEnd) ||
        (newStartTime <= existingStart && newEndTime >= existingEnd) ||
        (newStartTime >= existingStart && newEndTime <= existingEnd)
      );
    });

    if (hasConflict) {
      return {
        success: false,
        error: 'Time slot conflicts with an existing time slot',
      };
    }

    // Create the time slot
    const timeSlot = await database.timeSlot.create({
      data: {
        eventDateId: eventDateId,
        startTime: newStartTime,
        endTime: newEndTime,
        doorsOpen: newDoorsOpen,
      },
    });

    // Revalidate the event page
    revalidatePath(`/events/${eventDate.event.slug}`);

    return {
      success: true,
      data: serializePrisma(timeSlot),
    };
  } catch (error) {
    log.error('Failed to create time slot:', { error });
    throw new Error(
      error instanceof Error ? error.message : 'Failed to create time slot'
    );
  }
}

/**
 * Remove a time slot by ID
 */
export async function removeTimeSlot(timeSlotId: string) {
  try {
    // Find the time slot to get the event slug for revalidation
    const timeSlot = await database.timeSlot.findUnique({
      where: { id: timeSlotId },
      include: {
        eventDate: {
          include: {
            event: true,
          },
        },
      },
    });

    if (!timeSlot) {
      return {
        success: false,
        error: 'Time slot does not exist, please refresh the page',
      };
    }

    // Delete the time slot
    await database.timeSlot.delete({
      where: { id: timeSlotId },
    });

    // Revalidate the event page
    revalidatePath(`/events/${timeSlot.eventDate.event.slug}`);

    return {
      success: true,
    };
  } catch (error) {
    log.error('Failed to remove time slot:', { error });
    throw new Error(
      error instanceof Error ? error.message : 'Failed to create time slot'
    );
  }
}
