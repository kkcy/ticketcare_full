import { getCorsHeaders } from '@/app/lib/api';
import { database, serializePrisma } from '@repo/database';
import { type NextRequest, NextResponse } from 'next/server';

/**
 * Basic OPTIONS Request to simuluate OPTIONS preflight request for mutative requests
 */
export const OPTIONS = async (request: NextRequest) => {
  // Return Response
  return NextResponse.json(
    {},
    {
      status: 200,
      headers: getCorsHeaders(request.headers.get('origin') || ''),
    }
  );
};

/**
 * Basic GET Request
 * @param request
 * @returns
 */
export const GET = async (request: NextRequest) => {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('query');
  const eventId = searchParams.get('eventId');

  const ticketTypes = await database.ticketType.findMany({
    where: {
      name: {
        contains: query ?? '',
        mode: 'insensitive',
      },
      eventId: eventId ? BigInt(eventId) : undefined,
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
      headers: getCorsHeaders(request.headers.get('origin') || ''),
    }
  );
};
