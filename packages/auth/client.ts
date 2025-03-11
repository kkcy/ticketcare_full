import { stripeClient } from '@better-auth/stripe/client';
import { adminClient, organizationClient } from 'better-auth/client/plugins';
import { createAuthClient } from 'better-auth/react';

type AuthClient = ReturnType<
  typeof createAuthClient<{
    plugins: [
      ReturnType<typeof adminClient>,
      ReturnType<typeof stripeClient>,
      //   ReturnType<typeof organizationClient>,
    ];
  }>
>;

const authClient: AuthClient = createAuthClient({
  plugins: [stripeClient(), adminClient(), organizationClient()],
});

export const {
  signIn,
  signOut,
  signUp,
  useSession,
  admin,
  // @ts-expect-error pending updates from better-auth for types
  useActiveOrganization,
  // @ts-expect-error pending updates from better-auth for types
  organization,
} = authClient;
