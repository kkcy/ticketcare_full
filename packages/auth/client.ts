import {
  adminClient,
  magicLinkClient,
  organizationClient,
} from 'better-auth/client/plugins';
import { createAuthClient } from 'better-auth/react';
import {
  adminRole,
  customerRole,
  organizerRole,
  ownerRole,
  superAdminRole,
} from './permissions';
import { ac } from './permissions';

// type AuthClient = ReturnType<
//   typeof createAuthClient<{
//     plugins: [
//       ReturnType<typeof adminClient>,
//       // ReturnType<typeof stripeClient>,
//       ReturnType<typeof magicLinkClient>,
//       // ReturnType<typeof organizationClient>,
//     ];
//   }>
// >;

const authClient = createAuthClient({
  plugins: [
    // stripeClient(),
    // customSessionClient<typeof auth>(),
    adminClient({
      ac,
      roles: {
        superAdmin: superAdminRole,
        admin: adminRole,
        customer: customerRole,
      },
    }),
    organizationClient({
      ac,
      roles: { owner: ownerRole, organizer: organizerRole },
    }),
    magicLinkClient(),
  ],
});

export const {
  signIn,
  signOut,
  signUp,
  useSession,
  admin,
  organization,
  useActiveOrganization,
} = authClient;
export default authClient;
