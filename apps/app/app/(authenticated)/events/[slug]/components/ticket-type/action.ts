import { database, serializePrisma } from '@repo/database';
import { log } from '@repo/observability/log';
import { revalidatePath } from 'next/cache';

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
    timeSlotIds: string[];
  }
) {
  try {
    // Use a transaction to ensure both operations succeed or fail together
    const result = await database.$transaction(async (tx) => {
      // Create ticket type
      const ticketType = await tx.ticketType.create({
        data: {
          eventId: eventId,
          name: ticketTypeData.name,
          description: ticketTypeData.description,
          price: ticketTypeData.price,
          maxPerOrder: ticketTypeData.maxPerOrder,
          minPerOrder: ticketTypeData.minPerOrder,
          saleStartTime: ticketTypeData.saleStartTime,
          saleEndTime: ticketTypeData.saleEndTime,
        },
      });

      // Create inventories using time slot ids
      await tx.inventory.createMany({
        data: ticketTypeData.timeSlotIds.map((timeSlotId) => ({
          ticketTypeId: ticketType.id,
          quantity: ticketTypeData.quantity,
          timeSlotId: timeSlotId,
        })),
      });

      return ticketType;
    });

    // Optionally revalidate paths or perform additional actions
    revalidatePath(`/events/${slug}`);

    return {
      success: true,
      ticketType: serializePrisma(result),
    };
  } catch (error) {
    log.error('Failed to create ticket type or inventory:', { error });

    throw new Error(
      `Could not create ticket type: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

// Update an existing ticket type without modifying inventory
export async function updateTicketType(
  ticketTypeId: string,
  eventId: string,
  slug: string,
  ticketTypeData: {
    name: string;
    description?: string;
    price: number;
    maxPerOrder: number;
    minPerOrder: number;
    saleStartTime: Date;
    saleEndTime: Date;
  }
) {
  try {
    // Validate that the ticket type belongs to the event
    const existingTicketType = await database.ticketType.findFirst({
      where: {
        id: ticketTypeId,
        eventId: eventId,
      },
    });

    if (!existingTicketType) {
      throw new Error('Ticket type not found or does not belong to this event');
    }

    // Update the ticket type
    const updatedTicketType = await database.ticketType.update({
      where: {
        id: ticketTypeId,
      },
      data: {
        name: ticketTypeData.name,
        description: ticketTypeData.description,
        price: ticketTypeData.price,
        maxPerOrder: ticketTypeData.maxPerOrder,
        minPerOrder: ticketTypeData.minPerOrder,
        saleStartTime: ticketTypeData.saleStartTime,
        saleEndTime: ticketTypeData.saleEndTime,
      },
    });

    // Revalidate the path to reflect changes
    revalidatePath(`/events/${slug}`);

    return {
      success: true,
      ticketType: serializePrisma(updatedTicketType),
    };
  } catch (error) {
    log.error('Failed to update ticket type:', { error });

    throw new Error(
      `Could not update ticket type: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}
