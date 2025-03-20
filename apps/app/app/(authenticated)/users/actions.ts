import { auth } from '@repo/auth/server';
import { database, serializePrisma } from '@repo/database';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';

export const getUsers = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    notFound();
  }

  const users = await database.user
    .findMany({
      where: {
        orders: {
          some: {
            tickets: {
              some: {
                event: {
                  organizerId: session.user.id,
                },
              },
            },
          },
        },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        _count: {
          select: {
            orders: {
              where: {
                tickets: {
                  some: {
                    event: {
                      organizerId: session.user.id,
                    },
                  },
                },
              },
            },
          },
        },
      },
    })
    .then((users) => serializePrisma(users));

  return users;
};
