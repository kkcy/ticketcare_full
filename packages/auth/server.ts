import { stripe as stripePlugin } from '@better-auth/stripe';
import { database } from '@repo/database';
import { stripe } from '@repo/payments';
import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { nextCookies } from 'better-auth/next-js';
import { admin } from 'better-auth/plugins';
import { keys } from '../payments/keys';

export const auth: ReturnType<typeof betterAuth> = betterAuth({
  database: prismaAdapter(database, {
    provider: 'postgresql',
  }),
  plugins: [
    nextCookies(),
    stripePlugin({
      stripeClient: stripe,
      stripeWebhookSecret: keys().STRIPE_WEBHOOK_SECRET ?? '',
      createCustomerOnSignUp: true,
      // TODO: test auto create customer
      // onCustomerCreate: async ({ customer, stripeCustomer, user }, request) => {
      //   console.log(
      //     `Customer ${customer.id}, Stripe Customer ${stripeCustomer.id} created for user ${user.id}`
      //   );

      //   // TODO: create ticket, etc
      // },
      // getCustomerCreateParams: async ({ user, session }, request) => {
      //   // Customize the Stripe customer creation parameters
      //   return {
      //     metadata: {
      //       referralSource: user.metadata?.referralSource,
      //     },
      //   };
      // },
    }),
    admin(),
  ],
  // databaseHooks: {
  //   session: {
  //     create: {
  //       before: async (session) => {
  //         const organization = await getActiveOrganization(session.userId);

  //         return {
  //           data: {
  //             ...session,
  //             activeOrganizationId: organization.id,
  //           },
  //         };
  //       },
  //     },
  //   },
  // },
});
