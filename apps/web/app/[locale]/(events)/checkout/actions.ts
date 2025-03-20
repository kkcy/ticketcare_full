'use server';
import { auth } from '@repo/auth/server';
import { database, serializePrisma } from '@repo/database';
import { cookies } from 'next/headers';
import { headers } from 'next/headers';
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

  // get logged in user
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const userData: any = null;

  // try {
  //   // if user not logged in
  //   if (!session?.user) {
  //     // check if email exists in users
  //     const existingUser = await database.user.findUnique({
  //       where: {
  //         email: formData.email,
  //       }
  //     })

  //     userData = existingUser
  //   } else {
  //     userData = session.user
  //   }

  //   if (!userData) {
  //     // create new user
  //     const newUser = await auth.api.createUser({
  //       body: {
  //         email: formData.email,
  //         name: formData.fullName,
  //         data: {
  //           phone: formData.phone,
  //         }
  //       }
  //     })

  //     userData = newUser
  //   }

  //   const { firstName, lastName } = parseFullName(formData.fullName)

  //   // Then run all database operations in a transaction
  //   await database.$transaction(async (tx) => {
  //     // Find existing user
  //     const user = await database.user.findUnique({
  //       where: {
  //         id: userData.user.id,
  //         email: formData.email,
  //       },
  //     })

  //     if (!user) {
  //       // Create user
  //       await tx.user.create({
  //         data: {
  //           id: userData.user!.id!,
  //           email: formData.email,
  //           name: firstName,
  //           phone: formData.phone,
  //         },
  //       })
  //     }

  //     // Update cart with user ID
  //     await tx.cart.update({
  //       where: {
  //         id: cartId,
  //       },
  //       data: {
  //         userId: userData.user?.id,
  //         status: CartStatus.converted,
  //       },
  //     })
  //   })

  //   return {
  //     success: true,
  //     userId: userData.user?.id,
  //   }
  // } catch (error) {
  //   // If any error occurs and we created a new user, attempt to delete it
  //   if (userData?.user?.id) {
  //     // await auth.api.deleteUser({
  //     //   userId: userData.user.id,
  //     // })
  //   }

  //   throw error
  // }

  return {
    success: true,
  };
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
