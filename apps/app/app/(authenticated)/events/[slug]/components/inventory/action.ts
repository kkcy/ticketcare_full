'use server';

import { database, serializePrisma } from '@repo/database';
import { revalidatePath } from 'next/cache';

export async function fetchInventory(ticketTypeId: string) {
  try {
    // Fetch inventory items with related time slot data for context
    const inventoryItems = await database.inventory.findMany({
      where: {
        ticketTypeId,
      },
      include: {
        timeSlot: {
          select: {
            id: true,
            startTime: true,
            endTime: true,
            doorsOpen: true,
            eventDate: {
              select: {
                date: true,
              },
            },
          },
        },
      },
    });

    // Return serialized data
    return {
      success: true,
      data: serializePrisma(inventoryItems),
    };
  } catch (error) {
    console.error('Error fetching inventory:', error);
    return {
      success: false,
      error: 'Failed to fetch inventory',
      data: [],
    };
  }
}

export async function updateInventory(
  slug: string,
  inventoryId: string,
  newQuantity: number
) {
  try {
    // Use a transaction for consistency
    await database.$transaction(async (tx) => {
      // First get the current inventory to check tickets sold
      const inventory = await tx.inventory.findUnique({
        where: { id: inventoryId },
        include: {
          timeSlot: {
            include: {
              _count: {
                select: { tickets: true },
              },
            },
          },
        },
      });

      if (!inventory) {
        throw new Error('Inventory not found');
      }

      // Verify the update doesn't reduce below tickets sold
      const ticketsSold = inventory.timeSlot?._count?.tickets || 0;
      if (newQuantity < ticketsSold) {
        throw new Error(
          `Cannot reduce inventory below tickets sold (${ticketsSold})`
        );
      }

      // If validation passes, perform the update
      return tx.inventory.update({
        where: { id: inventoryId },
        data: { quantity: newQuantity },
      });
    });

    // Revalidate paths
    revalidatePath(`/events/${slug}`);

    return { success: true };
  } catch (error) {
    console.error('Error updating inventory:', error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to update inventory',
    };
  }
}
