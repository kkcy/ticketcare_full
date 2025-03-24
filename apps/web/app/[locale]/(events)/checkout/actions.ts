'use server';
import { auth } from '@repo/auth/server';
import { database, serializePrisma } from '@repo/database';
import { chip } from '@repo/payments';
import { cookies } from 'next/headers';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import type { CheckoutFormValues } from './components/checkout-form';

// const checkoutFormSchema = z.object({
//   fullName: z.string().min(1, 'Please enter your full name'),
//   email: z.string().email('Please enter a valid email'),
//   phone: z.string().min(1, 'Please enter phone number'),
//   cardNumber: z.string().min(1, 'Please enter card number'),
//   expiryDate: z.string().min(1, 'Please enter expiry date'),
//   cvv: z.string().min(1, 'Please enter CVV'),
//   acceptTerms: z.boolean().refine((val) => val === true, {
//     message: 'You must accept the terms and conditions',
//   }),
//   acceptMarketing: z.boolean().optional(),
// })

// type CheckoutFormValues = z.infer<typeof checkoutFormSchema>

export async function checkout(formData: CheckoutFormValues, cartId: string) {
  if (!cartId) {
    throw new Error('Invalid cart');
  }

  // Get cart details
  const cart = await database.cart.findUnique({
    where: { id: cartId },
    include: {
      cartItems: {
        include: {
          timeSlot: true,
          ticketType: {
            include: {
              event: true,
            },
          },
        },
      },
    },
  });

  if (!cart) {
    throw new Error('Cart not found');
  }

  if (cart.expiresAt < new Date()) {
    throw new Error('Cart has expired');
  }

  // Calculate total amount
  const totalAmount = cart.cartItems.reduce((sum, item) => {
    // Convert Decimal to number for calculation
    const price = item.ticketType?.price
      ? Number.parseFloat(item.ticketType.price.toString())
      : 0;
    return sum + price * item.quantity;
  }, 0);

  // Get logged in user or use form data
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const userId = session?.user?.id;
  const userEmail = session?.user?.email || formData.email;
  const userName = session?.user?.name || formData.fullName;
  const userPhone = formData.phone;

  // Get the event ID from the first cart item
  const eventId = cart.cartItems[0]?.ticketType?.eventId;

  // Create order in database
  const order = await database.order.create({
    data: {
      userId: userId || '',
      eventId: eventId,
      totalAmount,
      status: 'pending',
      paymentMethod: formData.paymentMethod,
      transactionId: '',
      paymentStatus: 'pending',
      orderedAt: new Date(),
    },
  });

  // Handle different payment methods
  if (formData.paymentMethod === 'chip') {
    try {
      // Check if the event is premium (important for ticket sales limits)
      const isPremiumEvent =
        cart.cartItems[0]?.ticketType?.event?.isPremiumEvent || false;

      // Prepare products for Chip-In
      const products = cart.cartItems.map((item) => ({
        name: item.ticketType?.name || 'Ticket',
        quantity: item.quantity,
        price: item.ticketType?.price
          ? Number.parseFloat(item.ticketType.price.toString())
          : 0,
        description: `${item.ticketType?.event?.title || 'Event'} - ${item.ticketType?.name || 'Ticket'}`,
      }));

      // Create payment with Chip-In
      const payment = await chip.createPayment({
        amount: totalAmount,
        currency: 'MYR',
        products,
        email: userEmail,
        fullName: userName,
        phone: userPhone,
        reference: `Order #${order.id}`,
        successUrl: `${process.env.NEXT_PUBLIC_API_URL}/webhooks/chip/success`,
        failureUrl: `${process.env.NEXT_PUBLIC_API_URL}/webhooks/chip/failure`,
        successRedirectUrl: `${process.env.NEXT_PUBLIC_APP_URL}/confirmation/${order.id}?status=success`,
        failureRedirectUrl: `${process.env.NEXT_PUBLIC_APP_URL}/confirmation/${order.id}?status=failure`,
        metadata: {
          orderId: order.id,
          isPremiumEvent: isPremiumEvent.toString(),
        },
      });

      // Update order with payment ID
      await database.order.update({
        where: { id: order.id },
        data: {
          transactionId: payment.id,
        },
      });

      // Clear cart
      await database.cart.delete({
        where: { id: cartId },
      });

      // Redirect to Chip-In checkout page
      if (payment.checkout_url) {
        redirect(payment.checkout_url);
      }
    } catch (error) {
      console.error('Chip payment error:', error);
      throw new Error('Failed to process payment with Chip-In');
    }
  } else {
    // Handle other payment methods here
    // For now, just return success
    return {
      success: true,
      orderId: order.id,
    };
  }
}

export async function setCartCookie(cartId: string) {
  const cookieStore = await cookies();
  // Set cookie to expire in 30 minutes
  cookieStore.set('cartId', cartId, {
    expires: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  });
}

export async function getCart(cartId: string) {
  try {
    const cart = await database.cart.findUnique({
      where: { id: cartId },
      include: {
        cartItems: {
          include: {
            timeSlot: true,
            ticketType: {
              include: {
                event: true,
              },
            },
          },
        },
      },
    });

    if (!cart) {
      return {
        error: 'Cart not found',
      };
    }

    if (cart.expiresAt < new Date()) {
      return {
        error: 'Cart has expired',
      };
    }

    return { data: serializePrisma(cart) };
  } catch (error) {
    console.error('Failed to get cart:', error);

    return {
      error: error instanceof Error ? error.message : 'Failed to get cart',
    };
  }
}
