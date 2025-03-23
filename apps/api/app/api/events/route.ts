import { withCors } from '@/app/lib/api';
import { database, serializePrisma } from '@repo/database';
import { type NextRequest, NextResponse } from 'next/server';

export const handler = async (request: NextRequest) => {
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
    }
  );
};

export const OPTIONS = withCors(handler);
export const GET = withCors(handler);
