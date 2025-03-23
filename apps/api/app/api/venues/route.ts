import { withCors } from '@/app/lib/api';
import { database, serializePrisma } from '@repo/database';
import { type NextRequest, NextResponse } from 'next/server';

export const handler = async (request: NextRequest) => {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('query');

  const venues = await database.venue.findMany({
    where: {
      name: {
        contains: query ?? '',
        mode: 'insensitive',
      },
    },
    select: {
      id: true,
      name: true,
    },
  });

  return NextResponse.json(
    { data: serializePrisma(venues) },
    {
      status: 200,
    }
  );
};

export const OPTIONS = withCors(handler);
export const GET = withCors(handler);
