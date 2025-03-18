'use client';

import type { SerializedCart } from '@/app/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { Checkbox } from '@repo/design-system/components/ui/checkbox';
import { Separator } from '@repo/design-system/components/ui/separator';
import { toast } from '@repo/design-system/components/ui/sonner';
import Link from 'next/link';
import { FormProvider, useForm } from 'react-hook-form';
import * as z from 'zod';
import { checkout } from '../actions';
import { CheckoutFooter } from './checkout-footer';
import { ContactInformation } from './contact-information';
import { OrderSummary } from './order-summary';
import { PaymentDetails } from './payment-details';

interface CheckoutFormProps {
  cart: SerializedCart;
}

export const checkoutFormSchema = z.object({
  fullName: z.string().min(1, 'Please enter your full name'),
  email: z.string().email('Please enter a valid email'),
  phone: z.string().min(1, 'Please enter phone number'),
  cardNumber: z
    .string()
    .regex(/^[\d\s]{19}$/, 'Please enter a valid 16-digit card number')
    .optional()
    .or(z.literal('')),
  expiryDate: z
    .string()
    .regex(
      /^(0[1-9]|1[0-2])\/([0-9]{2})$/,
      'Please enter a valid expiry date (MM/YY)'
    )
    .refine((val) => {
      if (!val) {
        return true;
      }
      const [month, year] = val.split('/');
      const expiry = new Date(
        2000 + Number.parseInt(year),
        Number.parseInt(month) - 1
      );
      return expiry > new Date();
    }, 'Card has expired')
    .optional()
    .or(z.literal('')),
  cvv: z
    .string()
    .regex(/^\d{3,4}$/, 'Please enter a valid CVV')
    .optional()
    .or(z.literal('')),
  // acceptTerms: z.boolean().refine((val) => val === true, {
  //   message: 'You must accept the terms and conditions',
  // }),
  acceptMarketing: z.boolean().optional(),
  paymentMethod: z.enum(['fpx', 'card', 'wallet']),
});

export type CheckoutFormValues = z.infer<typeof checkoutFormSchema>;

export function CheckoutForm({ cart }: CheckoutFormProps) {
  const methods = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      cardNumber: '',
      expiryDate: '',
      cvv: '',
      // acceptTerms: false,
      acceptMarketing: false,
      paymentMethod: 'card',
    },
  });

  const onSubmit = async (data: CheckoutFormValues) => {
    try {
      const result = await checkout(data, cart.id);
      if (result.success) {
        toast.success('Your order has been placed successfully!');
        // router.push(`/events/${slug}/confirmation`)
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('Failed to process your order. Please try again.');
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className="w-full">
        <div className="mt-[106px] mb-16 space-y-8 p-4">
          <OrderSummary cart={cart} />
          <Separator />

          <ContactInformation />
          <Separator />

          <PaymentDetails />
          <Separator />

          <>
            <div className="items-top flex space-x-2">
              <Checkbox
                id="acceptMarketing"
                {...methods.register('acceptMarketing')}
              />
              <div className="grid gap-1.5 leading-none">
                <label
                  htmlFor="acceptMarketing"
                  className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Keep me updated on the latest news, events, and exclusive
                  offers on this event organizer.{' '}
                </label>
              </div>
            </div>

            <p className="text-muted-foreground text-sm">
              By clicking “Checkout”, I accept the{' '}
              <Link
                href="/legal/terms"
                className="text-primary"
                target="_blank"
              >
                Terms of Service
              </Link>{' '}
              and have read{' '}
              <Link
                href="/legal/privacy-policy"
                className="text-primary"
                target="_blank"
              >
                Privacy Policy
              </Link>
              . I agree that TicketCARE may share my information with the event
              organizer.
            </p>

            {/* {methods.formState.errors.acceptTerms && (
              <p className="text-sm text-red-500">
                {methods.formState.errors.acceptTerms.message}
              </p>
            )} */}
          </>

          <CheckoutFooter cart={cart} />
        </div>
      </form>
    </FormProvider>
  );
}
