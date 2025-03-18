import { getSessionCookie } from 'better-auth/cookies';
import type { NextFetchEvent, NextMiddleware, NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export const authMiddleware = (next?: NextMiddleware) => {
  const action = (request: NextRequest, event: NextFetchEvent) => {
    const pathname = request.nextUrl.pathname;

    // Only check auth for dashboard routes
    if (pathname.startsWith('/dashboard')) {
      const sessionCookie = getSessionCookie(request);
      if (!sessionCookie) {
        return NextResponse.redirect(new URL('/sign-in', request.url));
      }
    }

    return next?.(request, event) ?? NextResponse.next();
  };

  return action;
};

export const config = {
  matcher: ['/dashboard/:path*'], // Match dashboard and all its subroutes
};
