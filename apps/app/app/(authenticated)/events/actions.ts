'use server';

import { auth } from '@repo/auth/server';
import { database, serializePrisma } from '@repo/database';
import type { PrismaNamespace } from '@repo/database';
import { slugify } from '@repo/design-system/lib/utils';
import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';

// TODO: start/end date should be > today
export async function createEvent(
  values: Omit<
    PrismaNamespace.EventCreateInput,
    'slug' | 'organizer' | 'venue'
  > & {
    venueId: bigint;
  }
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error('Unauthorized');
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
      organizerId: session.user.id,
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
  values: Omit<
    PrismaNamespace.EventUpdateInput,
    'slug' | 'organizer' | 'venue'
  > & {
    venueId: bigint;
  }
) {
  let finalSlug: string | undefined;

  const updatedEvent = await database.event.update({
    where: { id: BigInt(id) },
    data: {
      ...values,
      ...(finalSlug && { slug: finalSlug }),
    },
  });

  revalidatePath('/events');
  revalidatePath(`/events/${updatedEvent.slug}`);

  return {
    success: true,
    data: serializePrisma(updatedEvent),
  };
}
