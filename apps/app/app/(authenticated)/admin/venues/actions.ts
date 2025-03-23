'use server';

import { auth } from '@repo/auth/server';
import {
  type PrismaNamespace,
  database,
  serializePrisma,
} from '@repo/database';
import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';

// Get all venues
export async function getVenues() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.role || session.user.role !== 'super-admin') {
    throw new Error('Unauthorized: Only super admins can manage venues');
  }

  const venues = await database.venue.findMany({
    orderBy: {
      name: 'asc',
    },
  });

  return serializePrisma(venues);
}

// Create a new venue
export async function createVenue(
  values: PrismaNamespace.VenueUncheckedCreateInput
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.role || session.user.role !== 'super-admin') {
    throw new Error('Unauthorized: Only super admins can manage venues');
  }

  await database.venue.create({
    data: values,
  });

  revalidatePath('/admin/venues');

  return {
    success: true,
  };
}

// Update an existing venue
export async function updateVenue(
  id: string,
  values: PrismaNamespace.VenueUncheckedUpdateInput
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.role || session.user.role !== 'super-admin') {
    throw new Error('Unauthorized: Only super admins can manage venues');
  }

  await database.venue.update({
    where: { id },
    data: values,
  });

  revalidatePath('/admin/venues');
  revalidatePath(`/admin/venues/${id}`);

  return {
    success: true,
  };
}

// Delete a venue
export async function deleteVenue(id: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.role || session.user.role !== 'super-admin') {
    throw new Error('Unauthorized: Only super admins can manage venues');
  }

  // Check if any events are using this venue
  const eventsUsingVenue = await database.event.count({
    where: {
      venueId: id,
    },
  });

  if (eventsUsingVenue > 0) {
    throw new Error(
      `Cannot delete venue: ${eventsUsingVenue} events are using this venue`
    );
  }

  await database.venue.delete({
    where: { id },
  });

  revalidatePath('/admin/venues');
  revalidatePath(`/admin/venues/${id}`);

  return {
    success: true,
  };
}

// Get a specific venue by ID
export async function getVenue(id: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.role || session.user.role !== 'super-admin') {
    throw new Error('Unauthorized: Only super admins can manage venues');
  }

  const venue = await database.venue.findUnique({
    where: { id },
  });

  if (!venue) {
    throw new Error('Venue not found');
  }

  return serializePrisma(venue);
}

// Get a specific venue by slug
export async function getVenueBySlug(slug: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.role || session.user.role !== 'super-admin') {
    throw new Error('Unauthorized: Only super admins can manage venues');
  }

  const venue = await database.venue.findUnique({
    where: { slug },
    include: {
      events: {
        orderBy: {
          startTime: 'desc',
        },
        take: 5,
      },
    },
  });

  if (!venue) {
    throw new Error('Venue not found');
  }

  return serializePrisma(venue);
}
