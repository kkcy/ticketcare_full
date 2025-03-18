'use server';

import { database, serializePrisma } from '@repo/database';
import { notFound } from 'next/navigation';

export async function getOrganizer(slug: string) {
  const organizer = await database.organizer.findUnique({
    where: {
      slug,
    },
    select: {
      id: true,
      slug: true,
      logo: true,
      name: true,
      description: true,
      website: true,
      facebook: true,
      twitter: true,
      instagram: true,
      events: {
        select: {
          title: true,
          slug: true,
          startTime: true,
          endTime: true,
          doorsOpen: true,
          status: true,
          isPublic: true,
          category: true,
          venue: { select: { name: true } },
        },
      },
      _count: {
        select: {
          events: true,
        },
      },
    },
  });

  if (!organizer) {
    return notFound();
  }

  return serializePrisma(organizer);
}
