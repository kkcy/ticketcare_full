// Config CORS
// ========================================================
/**
 *
 * @param origin
 * @returns
 */

import { env } from '@/env';
import type {} from 'next';
import { type NextRequest, NextResponse } from 'next/server';

const allowedMethods = 'GET, POST, PUT, DELETE, OPTIONS';
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3002',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3001',
  'http://127.0.0.1:3002',
  env.NEXT_PUBLIC_APP_URL,
  env.NEXT_PUBLIC_WEB_URL,
];

export const getCorsHeaders = (origin: string) => {
  // Define the headers type to include the CORS headers
  const headers = {
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Methods': allowedMethods,
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, Accept',
    'Access-Control-Allow-Origin': '',
  };

  // If no origin provided, use a safe default
  if (!origin) {
    return headers;
  }

  // Set the origin header to the requesting origin if it's allowed
  if (allowedOrigins.includes(origin)) {
    headers['Access-Control-Allow-Origin'] = origin;
  }

  // Return result
  return headers;
};

export const withCors = (
  handler: (req: NextRequest) => Promise<NextResponse>
) => {
  return async (req: NextRequest) => {
    const origin = req.headers.get('origin') ?? '';
    const corsHeaders = getCorsHeaders(origin);

    if (req.method === 'OPTIONS') {
      return new NextResponse(null, {
        status: 204,
        headers: corsHeaders,
      });
    }

    const response = await handler(req);
    for (const [key, value] of Object.entries(corsHeaders)) {
      response.headers.set(key, value);
    }

    return response;
  };
};
