'use server';

import { auth } from '@repo/auth/server';
import {
  type PrismaNamespace,
  database,
  serializePrisma,
} from '@repo/database';
import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';

// Get all organizers
export async function getOrganizers() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.role || session.user.role !== 'super-admin') {
    throw new Error('Unauthorized: Only super admins can manage organizers');
  }

  const organizers = await database.organizer.findMany({
    include: {
      user: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return serializePrisma(organizers);
}

// Create a new organizer
export async function createOrganizer(
  values: PrismaNamespace.OrganizerUncheckedCreateInput
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.role || session.user.role !== 'super-admin') {
    throw new Error('Unauthorized: Only super admins can manage organizers');
  }

  await database.organizer.create({
    data: values,
  });

  revalidatePath('/admin/organizers');

  return {
    success: true,
  };
}

// Update an existing organizer
export async function updateOrganizer(
  id: string,
  values: PrismaNamespace.OrganizerUncheckedUpdateInput
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.role || session.user.role !== 'super-admin') {
    throw new Error('Unauthorized: Only super admins can manage organizers');
  }

  await database.organizer.update({
    where: { id },
    data: values,
  });

  revalidatePath('/admin/organizers');
  revalidatePath(`/admin/organizers/${id}`);

  return {
    success: true,
  };
}

// Delete an organizer
export async function deleteOrganizer(id: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.role || session.user.role !== 'super-admin') {
    throw new Error('Unauthorized: Only super admins can manage organizers');
  }

  // Check if any events are associated with this organizer
  const eventsCount = await database.event.count({
    where: {
      organizerId: id,
    },
  });

  if (eventsCount > 0) {
    throw new Error(
      `Cannot delete organizer: ${eventsCount} events are associated with this organizer`
    );
  }

  await database.organizer.delete({
    where: { id },
  });

  revalidatePath('/admin/organizers');

  return {
    success: true,
  };
}

// Get a specific organizer by ID
export async function getOrganizer(id: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.role || session.user.role !== 'super-admin') {
    throw new Error('Unauthorized: Only super admins can manage organizers');
  }

  const organizer = await database.organizer.findUnique({
    where: { id },
    include: {
      user: true,
    },
  });

  if (!organizer) {
    throw new Error('Organizer not found');
  }

  return serializePrisma(organizer);
}

// Toggle premium status for an organizer
export async function toggleOrganizerPremiumStatus(
  id: string,
  isPremium: boolean
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.role || session.user.role !== 'super-admin') {
    throw new Error('Unauthorized: Only super admins can manage organizers');
  }

  await database.organizer.update({
    where: { id },
    data: {
      isPremium,
      // Reset event credits if downgrading from premium
      eventCredits: isPremium ? undefined : 0,
    },
  });

  revalidatePath('/admin/organizers');
  revalidatePath(`/admin/organizers/${id}`);

  return {
    success: true,
  };
}

// Update organizer event credits
export async function updateOrganizerEventCredits(
  id: string,
  eventCredits: number
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.role || session.user.role !== 'super-admin') {
    throw new Error('Unauthorized: Only super admins can manage organizers');
  }

  const organizer = await database.organizer.findUnique({
    where: { id },
  });

  if (!organizer) {
    throw new Error('Organizer not found');
  }

  if (!organizer.isPremium) {
    throw new Error('Cannot update event credits for non-premium organizers');
  }

  await database.organizer.update({
    where: { id },
    data: {
      eventCredits,
    },
  });

  revalidatePath('/admin/organizers');
  revalidatePath(`/admin/organizers/${id}`);

  return {
    success: true,
  };
}
