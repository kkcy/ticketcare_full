import { analytics } from '@repo/analytics/posthog/server';
import { auth } from '@repo/auth/server';
import { flag } from 'flags/next';
import { headers } from 'next/headers';

export const createFlag = (key: string) =>
  flag({
    key,
    defaultValue: false,
    async decide() {
      const session = await auth.api.getSession({
        headers: await headers(),
      });

      const userId = session?.user?.id;

      if (!userId) {
        return this.defaultValue as boolean;
      }

      const isEnabled = await analytics.isFeatureEnabled(key, userId);

      return isEnabled ?? (this.defaultValue as boolean);
    },
  });
