// import { stripe as stripePlugin } from '@better-auth/stripe';
import { database } from '@repo/database';
// import { stripe } from '@repo/payments';
import { type BetterAuthOptions, betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { nextCookies } from 'better-auth/next-js';
import { admin, magicLink, organization } from 'better-auth/plugins';
import {
  ac,
  adminRole,
  customerRole,
  organizerRole,
  ownerRole,
  superAdminRole,
} from './permissions';
// import { keys } from '../payments/keys';

const options = {
  user: {
    additionalFields: {
      firstName: {
        type: 'string',
        required: false,
        defaultValue: null,
        input: true,
      },
      lastName: {
        type: 'string',
        required: false,
        defaultValue: null,
        input: true,
      },
      phone: {
        type: 'string',
        required: false,
        defaultValue: null,
        input: true,
      },
      dob: {
        type: 'date',
        required: false,
        defaultValue: null,
        input: true,
      },
    },
  },
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
  },
  database: prismaAdapter(database, {
    provider: 'postgresql',
  }),
  session: {
    cookieCache: {
      enabled: true,
    },
    additionalFields: {
      activeOrganizationName: {
        type: 'string',
        required: false,
        defaultValue: null,
        input: false,
      },
      organizerId: {
        type: 'string',
        required: false,
        defaultValue: null,
        input: false,
      },
    },
  },
  plugins: [
    magicLink({
      // biome-ignore lint/suspicious/useAwait: <explanation>
      sendMagicLink: async ({ email, token, url }, request) => {
        console.log('sending magic link to', email, token, url);

        // send email to user
        // use resend to send email
      },
    }),
    // stripePlugin({
    //   stripeClient: stripe,
    //   stripeWebhookSecret: keys().STRIPE_WEBHOOK_SECRET ?? '',
    //   createCustomerOnSignUp: false,
    //   // TODO: test auto create customer
    //   // onCustomerCreate: async ({ customer, stripeCustomer, user }, request) => {
    //   //   console.log(
    //   //     `Customer ${customer.id}, Stripe Customer ${stripeCustomer.id} created for user ${user.id}`
    //   //   );

    //   //   // TODO: create ticket, etc
    //   // },
    //   // getCustomerCreateParams: async ({ user, session }, request) => {
    //   //   // Customize the Stripe customer creation parameters
    //   //   return {
    //   //     metadata: {
    //   //       referralSource: user.metadata?.referralSource,
    //   //     },
    //   //   };
    //   // },
    // }),
    admin({
      defaultRole: 'customer',
      ac,
      roles: {
        superAdmin: superAdminRole,
        admin: adminRole,
        customer: customerRole,
      },
      adminRoles: ['super-admin', 'admin'],
    }),
    organization({
      ac,
      roles: { owner: ownerRole, organizer: organizerRole },
    }),
    nextCookies(),
  ],
  databaseHooks: {
    session: {
      create: {
        before: async (context) => {
          try {
            const organizations = await database.organization.findMany({
              where: {
                members: {
                  some: {
                    userId: context.userId,
                  },
                },
              },
            });

            const organizer = await database.organizer.findUnique({
              where: {
                userId: context.userId,
              },
            });

            return {
              data: {
                ...context,
                activeOrganizationId: organizations?.[0]?.id,
                activeOrganizationName: organizations?.[0]?.name,
                organizerId: organizer?.id,
              },
            };
          } catch (error) {
            console.error('Error listing organizations:', error);

            return {
              data: context,
            };
          }
        },
      },
    },
  },
  onAPIError: {
    throw: true,
    onError: (error) => {
      console.error('Auth error:', error);
    },
    errorURL: '/auth/error',
  },
} satisfies BetterAuthOptions;

export const auth: ReturnType<typeof betterAuth<typeof options>> =
  betterAuth(options);
