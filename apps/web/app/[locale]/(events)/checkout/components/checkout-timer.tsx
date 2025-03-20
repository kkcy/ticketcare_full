'use client';

import type { SerializedCart } from '@/app/types';
import { calculateTimeLeft } from '@repo/design-system/lib/format';
import { useEffect, useState } from 'react';

interface CheckoutTimerProps {
  cart: SerializedCart;
}

export function CheckoutTimer({ cart }: CheckoutTimerProps) {
  const [timeLeft, setTimeLeft] = useState<string>('');

  useEffect(() => {
    // Update timer every second
    const interval = setInterval(() => {
      const timeLeft = calculateTimeLeft(new Date(cart.expiresAt));
      setTimeLeft(
        `${timeLeft.minutes}:${timeLeft.seconds < 10 ? '0' : ''}${timeLeft.seconds}`
      );

      if (timeLeft.minutes === 0 && timeLeft.seconds === 0) {
        clearInterval(interval);
        // router.push(`/events/${slug}`)
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [cart.expiresAt]);

  return (
    <div className="fixed top-16 right-0 left-0 bg-red-500 py-2 text-center text-white">
      Your tickets are held for {timeLeft}
    </div>
  );
}
