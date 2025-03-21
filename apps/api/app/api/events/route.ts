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

  const events = await database.event.findMany({
    where: {
      status: 'published',
      title: {
        contains: query ?? '',
        mode: 'insensitive',
      },
    },
    select: {
      id: true,
      title: true,
    },
    orderBy: {
      startTime: 'asc',
    },
  });

  return NextResponse.json(
    { data: serializePrisma(events) },
    {
      status: 200,
      headers: getCorsHeaders(request.headers.get('origin') || ''),
    }
  );
};
