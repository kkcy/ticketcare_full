'use client';

import type { SerializedCart } from '@/app/types';
import { Button } from '@repo/design-system/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { useFormContext } from 'react-hook-form';

interface CheckoutFooterProps {
  cart: SerializedCart;
}

export function CheckoutFooter({ cart }: CheckoutFooterProps) {
  const {
    formState: { isLoading, isSubmitting },
  } = useFormContext();

  const totalPrice = cart.cartItems.reduce(
    (acc, item) => acc + item.ticketType.price * item.quantity,
    0
  );

  // TODO: + booking fee

  return (
    <div className="fixed right-0 bottom-0 left-0 h-16 border-t">
      <div className="mx-auto flex w-full max-w-4xl items-center justify-between gap-4 bg-background px-4 py-3">
        <span className="font-bold text-xl">RM {totalPrice.toFixed(2)}</span>

        <Button size="lg" type="submit" disabled={isSubmitting}>
          {isLoading || isSubmitting ? 'Processing...' : 'Checkout'}
          <ArrowRight size={20} />
        </Button>
      </div>
    </div>
  );
}
