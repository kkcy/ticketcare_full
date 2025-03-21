import { getCorsHeaders } from '@/app/lib/api';
import { database, serializePrisma } from '@repo/database';
import { type NextRequest, NextResponse } from 'next/server';

/**
 * Basic GET Request
 * @param request
 * @returns
 */
export const GET = async (request: NextRequest) => {
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
      headers: getCorsHeaders(request.headers.get('origin') || ''),
    }
  );
};
