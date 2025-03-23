import { withCors } from '@/app/lib/api';
import { database, serializePrisma } from '@repo/database';
import { type NextRequest, NextResponse } from 'next/server';

export const handler = async (request: NextRequest) => {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('query');
  const eventId = searchParams.get('eventId');

  const ticketTypes = await database.ticketType.findMany({
    where: {
      name: {
        contains: query ?? '',
        mode: 'insensitive',
      },
      eventId: eventId ? eventId : undefined,
    },
    select: {
      id: true,
      name: true,
    },
  });

  return NextResponse.json(
    { data: serializePrisma(ticketTypes) },
    {
      status: 200,
    }
  );
};

export const OPTIONS = withCors(handler);
export const GET = withCors(handler);
