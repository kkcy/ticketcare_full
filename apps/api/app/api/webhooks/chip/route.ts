import { env } from '@/env';
import { analytics } from '@repo/analytics/posthog/server';
import { database } from '@repo/database';
import { parseError } from '@repo/observability/error';
import { log } from '@repo/observability/log';
import { chip } from '@repo/payments';
import type { ChipPaymentResponse } from '@repo/payments/chip';
import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';

/**
 * Handle payment completed event
 * @param data Payment data from webhook
 */
const handlePaymentCompleted = async (data: ChipPaymentResponse) => {
  if (!data.id) {
    log.warn('Payment completed event missing ID');
    return;
  }

  const product = data.purchase?.products?.[0];

  // Check if this is a premium tier upgrade payment
  if (product?.category === 'event_premium_tier') {
    await handlePremiumUpgradePayment(data);
    return;
  }

  // Handle regular order payment
  const order = await getOrderFromPaymentId(data.id);

  if (!order) {
    log.warn(`Order not found for payment ID: ${data.id}`);
    return;
  }

  // Convert amount from cents to actual currency
  const amount = data.purchase?.total ? data.purchase.total / 100 : 0;

  const paymentAttempt = data.transaction_data?.attempts?.at(-1);

  // Update order status
  await database.order.update({
    where: {
      id: order.id,
    },
    data: {
      paymentStatus: 'paid',
      paymentMethod: `chip-${paymentAttempt?.payment_method}`,
      // Note: We're using only the available fields in the schema
      // Additional payment info is logged for analytics
    },
  });

  // Calculate total tickets in this order
  // TODO: This is a temporary fix, need to handle quantity
  const totalTickets = order.tickets?.length || 0;

  // Check if this is a premium event purchase
  if (order.event?.isPremiumEvent) {
    log.info(
      `Processing premium event ticket sales for event ${order.event.id}`
    );

    // For premium events, we track ticket sales separately and have higher limits
    await database.event.update({
      where: {
        id: order.event.id,
      },
      data: {
        ticketsSold: {
          increment: totalTickets,
        },
      },
    });
  } else {
    // For free users, we still need to track ticket sales to enforce the limit of 20 tickets per event
    log.info(
      `Processing standard event ticket sales for event ${order.event?.id}`
    );

    if (order.event) {
      await database.event.update({
        where: {
          id: order.event.id,
        },
        data: {
          ticketsSold: {
            increment: totalTickets,
          },
        },
      });
    }
  }

  analytics.capture({
    event: 'Payment Completed',
    distinctId: order.user.id,
    properties: {
      paymentId: data.id,
      orderId: order.id,
      eventId: order.event?.id,
      amount: amount,
      paymentMethod: `chip-${paymentAttempt?.payment_method}`,
      currency: data.purchase?.currency || 'MYR',
      isPremiumEvent: order.event?.isPremiumEvent || false,
    },
  });

  log.info(`Payment completed for order ${order.id}, payment ID: ${data.id}`);
};

/**
 * Handle payment failed event
 * @param data Payment data from webhook
 */
const handlePaymentFailed = async (data: ChipPaymentResponse) => {
  if (!data.id) {
    log.warn('Payment failed event missing ID');
    return;
  }

  const order = await getOrderFromPaymentId(data.id);

  if (!order) {
    log.warn(`Order not found for failed payment ID: ${data.id}`);
    return;
  }

  // Update order status
  await database.order.update({
    where: {
      id: order.id,
    },
    data: {
      paymentStatus: 'failed',
      // Note: We're using only the available fields in the schema
      // Error details are logged for analytics
    },
  });

  const paymentAttempt = data.transaction_data?.attempts?.at(-1);

  analytics.capture({
    event: 'Payment Failed',
    distinctId: order.user.id,
    properties: {
      paymentId: data.id,
      orderId: order.id,
      eventId: order.event?.id,
      amount: data.purchase?.total ? data.purchase.total / 100 : 0,
      paymentMethod: `chip-${paymentAttempt?.payment_method}`,
      // errorCode: data.error_code,
      // errorMessage: data.error_message,
      isPremiumEvent: order.event?.isPremiumEvent || false,
    },
  });

  log.warn(`Payment failed for order ${order.id}, payment ID: ${data.id}`);
};

const handlePaymentCanceled = async (data: ChipPaymentResponse) => {
  if (!data.id) {
    log.warn('Payment canceled event missing ID');
    return;
  }

  const order = await getOrderFromPaymentId(data.id);

  if (!order) {
    log.warn(`Order not found for canceled payment ID: ${data.id}`);
    return;
  }

  // Update order status
  await database.order.update({
    where: {
      id: order.id,
    },
    data: {
      paymentStatus: 'canceled',
      // Note: We're using only the available fields in the schema
    },
  });

  const paymentAttempt = data.transaction_data?.attempts?.at(-1);

  analytics.capture({
    event: 'Payment Canceled',
    distinctId: order.user.id,
    properties: {
      paymentId: data.id,
      orderId: order.id,
      eventId: order.event?.id,
      amount: data.purchase?.total ? data.purchase.total / 100 : 0,
      paymentMethod: `chip-${paymentAttempt?.payment_method}`,
      isPremiumEvent: order.event?.isPremiumEvent || false,
    },
  });

  log.info(`Payment canceled for order ${order.id}, payment ID: ${data.id}`);
};

/**
 * Get order from payment ID
 * @param paymentId Chip payment ID
 * @returns Order associated with the payment or undefined
 */
const getOrderFromPaymentId = (paymentId: string) => {
  return database.order.findFirst({
    where: {
      transactionId: paymentId,
    },
    include: {
      user: true,
      event: {
        include: {
          organizer: true,
        },
      },
      tickets: {
        include: {
          ticketType: true,
        },
      },
    },
  });
};

/**
 * Get event premium upgrade from payment ID
 * @param paymentId Chip payment ID
 * @returns Event premium upgrade associated with the payment or undefined
 */
const getEventPremiumUpgradeFromPaymentId = (paymentId: string) => {
  return database.eventPremiumUpgrade.findUnique({
    where: {
      id: paymentId,
    },
    include: {
      event: true,
      organizer: true,
    },
  });
};

/**
 * Handle payment canceled event
 * @param data Payment data from webhook
 */
/**
 * Handle premium tier upgrade payment
 * @param data Payment data from webhook
 */
const handlePremiumUpgradePayment = async (data: ChipPaymentResponse) => {
  if (!data.id) {
    log.warn('Premium upgrade payment event missing ID');
    return;
  }

  const eventPremiumUpgrade = await getEventPremiumUpgradeFromPaymentId(
    data.id
  );

  if (!eventPremiumUpgrade) {
    log.warn(`Event premium upgrade not found for payment ID: ${data.id}`);
    return;
  }

  try {
    // Update event premium upgrade status to completed
    await database.eventPremiumUpgrade.update({
      where: { id: data.id },
      data: { status: 'completed' },
    });

    const product = data.purchase?.products?.[0];

    // If this is an event premium upgrade, update the event
    if (
      eventPremiumUpgrade.event &&
      eventPremiumUpgrade.premiumTierId &&
      product?.category === 'event_premium_tier'
    ) {
      // Get the premium tier details
      const premiumTier = await database.premiumTier.findUnique({
        where: { id: eventPremiumUpgrade.premiumTierId },
        select: { maxTicketsPerEvent: true },
      });

      if (!premiumTier) {
        log.warn(
          `Premium tier not found: ${eventPremiumUpgrade.premiumTierId}`
        );
        return;
      }

      // Update the event with premium status
      await database.event.update({
        where: { id: eventPremiumUpgrade.eventId },
        data: {
          isPremiumEvent: true,
          premiumTierId: eventPremiumUpgrade.premiumTierId,
          maxTicketsPerEvent: premiumTier.maxTicketsPerEvent,
        },
      });

      // Premium status is now tracked at the event level through EventPremiumUpgrade
      // No need to check organizer premium status or update event credits

      // Revalidate event pages to reflect the changes
      if (eventPremiumUpgrade.event.slug) {
        revalidatePath('/events');
        revalidatePath(`/events/${eventPremiumUpgrade.event.slug}`);
      }

      log.info(
        `Event ${eventPremiumUpgrade.eventId} successfully upgraded to premium tier ${eventPremiumUpgrade.premiumTierId}`
      );

      // Track the event in analytics
      await analytics.capture({
        event: 'event_upgraded_to_premium',
        distinctId: eventPremiumUpgrade.organizerId,
        properties: {
          eventId: eventPremiumUpgrade.eventId,
          premiumTierId: eventPremiumUpgrade.premiumTierId,
          paymentMethod: 'chip',
          amount: eventPremiumUpgrade.amount,
        },
      });
    }
  } catch (error) {
    const message = parseError(error);
    log.error(`Error processing premium upgrade payment: ${message}`);
  }
};

export const POST = async (request: Request): Promise<Response> => {
  if (!env.CHIP_WEBHOOK_SECRET) {
    return NextResponse.json({ message: 'Not configured', ok: false });
  }

  try {
    const body = await request.text();
    const headerPayload = await headers();
    const signature = headerPayload.get('x-signature');

    if (!signature) {
      log.warn('Missing x-signature header in Chip webhook');
      throw new Error('Missing x-signature header');
    }

    // Verify webhook signature
    const isValid = chip.verifyWebhookSignature(body, signature);

    if (!isValid) {
      log.warn('Invalid Chip webhook signature');
      return NextResponse.json(
        { message: 'Invalid signature', ok: false },
        { status: 401 }
      );
    }

    const event = JSON.parse(body) as ChipPaymentResponse;
    log.info(
      `Received Chip webhook event: '${event.status}' for payment ID: ${event.id}`
    );

    log.debug('debug', { event });

    // Handle different webhook event types
    switch (event.status) {
      case 'paid': {
        await handlePaymentCompleted(event);
        break;
      }
      case 'error':
      case 'failed': {
        await handlePaymentFailed(event);
        break;
      }
      case 'canceled': {
        await handlePaymentCanceled(event);
        break;
      }
      case 'created':
      case 'pending': {
        // These statuses don't require any action
        log.info(
          `Received Chip event with status: ${event.status} for payment ID: ${event.id}`
        );
        break;
      }
      case 'viewed': {
        // send analytic?
        break;
      }
      default: {
        log.warn(
          `Unhandled Chip event status ${event.status} for payment ID: ${event.id}`
        );
      }
    }

    await analytics.shutdown();

    return NextResponse.json({ result: event, ok: true });
  } catch (error) {
    const message = parseError(error);
    log.error(`Error processing Chip webhook: ${message}`);

    return NextResponse.json(
      {
        message: 'Something went wrong processing the webhook',
        ok: false,
      },
      { status: 500 }
    );
  }
};
