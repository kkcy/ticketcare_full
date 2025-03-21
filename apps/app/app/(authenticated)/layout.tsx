import { env } from '@/env';
import { auth } from '@repo/auth/server';
import type { User } from '@repo/database';
import { SidebarProvider } from '@repo/design-system/components/ui/sidebar';
import { showBetaFeature } from '@repo/feature-flags';
import { NotificationsProvider } from '@repo/notifications/components/provider';
import { secure } from '@repo/security';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';
import { PostHogIdentifier } from './components/posthog-identifier';
import { GlobalSidebar } from './components/sidebar';
import { SWRProvider } from './components/swr';

type AppLayoutProperties = {
  readonly children: ReactNode;
};

const AppLayout = async ({ children }: AppLayoutProperties) => {
  if (env.ARCJET_KEY) {
    await secure(['CATEGORY:PREVIEW']);
  }

  // Check if user is already authenticated
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    // If user is not authenticated, redirect to sign-in page
    return redirect('/sign-in');
  }

  const betaFeature = await showBetaFeature();

  const user = session.user;
  const activeOrganizationName = session.session.activeOrganizationName;

  return (
    <SWRProvider>
      <NotificationsProvider userId={user.id}>
        <SidebarProvider>
          <GlobalSidebar
            user={user as User}
            activeOrganizationName={activeOrganizationName ?? undefined}
          >
            {betaFeature && (
              <div className="m-4 rounded-full bg-blue-500 p-1.5 text-center text-sm text-white">
                Beta feature now available
              </div>
            )}
            {children}
          </GlobalSidebar>
          <PostHogIdentifier />
        </SidebarProvider>
      </NotificationsProvider>
    </SWRProvider>
  );
};

export default AppLayout;
