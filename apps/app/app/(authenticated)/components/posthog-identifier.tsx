'use client';

import { useAnalytics } from '@repo/analytics/posthog/client';
import { useSession } from '@repo/auth/client';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useRef } from 'react';

export const PostHogIdentifier = () => {
  const { data: session } = useSession();
  const user = session?.user;
  const identified = useRef(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const analytics = useAnalytics();

  useEffect(() => {
    // Track pageviews
    if (pathname && analytics) {
      let url = window.origin + pathname;
      if (searchParams.toString()) {
        url = `${url}?${searchParams.toString()}`;
      }
      analytics.capture('$pageview', {
        $current_url: url,
      });
    }
  }, [pathname, searchParams, analytics]);

  useEffect(() => {
    if (!user || identified.current) {
      return;
    }

    analytics.identify(user.id, {
      email: user.email,
      name: user.name,
      // firstName: user.firstName,
      // lastName: user.lastName,
      createdAt: user.createdAt,
      // avatar: user.avatar,
      // phoneNumber: user.phoneNumbers.at(0)?.phoneNumber,
    });

    identified.current = true;
  }, [user, analytics]);

  return null;
};
