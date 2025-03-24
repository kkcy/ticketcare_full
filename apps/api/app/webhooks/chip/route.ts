import { env } from '@/env';
import { analytics } from '@repo/analytics/posthog/server';
import { database } from '@repo/database';
import { parseError } from '@repo/observability/error';
import { log } from '@repo/observability/log';
import { chip } from '@repo/payments';
import type { ChipPaymentResponse } from '@repo/payments';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';

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
      orderItems: {
        include: {
          ticketType: true,
        },
      },
    },
  });
};

/**
 * Handle payment completed event
 * @param data Payment data from webhook
 */
const handlePaymentCompleted = async (data: ChipPaymentResponse) => {
  if (!data.id) {
    log.warn('Payment completed event missing ID');
    return;
  }

  const order = await getOrderFromPaymentId(data.id);

  if (!order) {
    log.warn(`Order not found for payment ID: ${data.id}`);
    return;
  }

  // Convert amount from cents to actual currency
  const amount = data.purchase?.amount ? data.purchase.amount / 100 : 0;

  // Update order status
  await database.order.update({
    where: {
      id: order.id,
    },
    data: {
      paymentStatus: 'paid',
      paymentMethod: data.payment_method || 'chip',
      // Note: We're using only the available fields in the schema
      // Additional payment info is logged for analytics
    },
  });

  // Calculate total tickets in this order
  const totalTickets =
    order.orderItems?.reduce(
      (sum: number, item) => sum + (item.quantity || 0),
      0
    ) || 0;

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

    // Get the event organizer to check if they're premium
    const eventWithOrganizer = await database.event.findUnique({
      where: { id: order.event.id },
      include: { organizer: true },
    });

    if (eventWithOrganizer?.organizer?.isPremium) {
      log.info(`Premium organizer detected for event ${order.event.id}`);
      // Premium organizers get additional event credits and higher ticket sales limits
    }
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
      paymentMethod: data.payment_method,
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

  analytics.capture({
    event: 'Payment Failed',
    distinctId: order.user.id,
    properties: {
      paymentId: data.id,
      orderId: order.id,
      eventId: order.event?.id,
      amount: data.purchase?.amount ? data.purchase.amount / 100 : 0,
      paymentMethod: data.payment_method,
      errorCode: data.error_code,
      errorMessage: data.error_message,
      isPremiumEvent: order.event?.isPremiumEvent || false,
    },
  });

  log.warn(`Payment failed for order ${order.id}, payment ID: ${data.id}`);
};

/**
 * Handle payment canceled event
 * @param data Payment data from webhook
 */
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

  analytics.capture({
    event: 'Payment Canceled',
    distinctId: order.user.id,
    properties: {
      paymentId: data.id,
      orderId: order.id,
      eventId: order.event?.id,
      amount: data.purchase?.amount ? data.purchase.amount / 100 : 0,
      paymentMethod: data.payment_method,
      isPremiumEvent: order.event?.isPremiumEvent || false,
    },
  });

  log.info(`Payment canceled for order ${order.id}, payment ID: ${data.id}`);
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
    const isValid = chip.verifyWebhookSignature(signature, body);

    if (!isValid) {
      log.warn('Invalid Chip webhook signature');
      return NextResponse.json(
        { message: 'Invalid signature', ok: false },
        { status: 401 }
      );
    }

    const event = JSON.parse(body) as ChipPaymentResponse;
    log.info(
      `Received Chip webhook event: ${event.status} for payment ID: ${event.id}`
    );

    // Handle different webhook event types
    switch (event.status) {
      case 'paid': {
        await handlePaymentCompleted(event);
        break;
      }
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
