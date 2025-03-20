import type { SerializedCart } from '@/app/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@repo/design-system/components/ui/card';
import {
  formatCurrency,
  formatDate,
  formatTime,
} from '@repo/design-system/lib/format';
import { Info } from 'lucide-react';
import Image from 'next/image';
import type { FC } from 'react';

type OrderSummaryProps = {
  cart: SerializedCart;
};

export const OrderSummary: FC<OrderSummaryProps> = ({ cart }) => {
  const subtotal = cart.cartItems.reduce((acc, item) => {
    return acc + item.ticketType.price * item.quantity;
  }, 0);

  const bookingFee = cart.cartItems.reduce((acc, item) => {
    return acc + 1 * item.quantity; // TODO: RM1 per ticket
  }, 0);

  const total = subtotal + bookingFee;

  return (
    <div className="space-y-[24px]">
      <h2 className="font-semibold text-lg">Order Summary</h2>

      {/* supposed to be able to purchase single event only */}
      <Card className="flex">
        <CardHeader>
          <Image
            src={
              // cart.cartItems[0]?.ticketType.event.image ||
              '/event-placeholder-1.png'
            }
            alt={cart.cartItems[0]?.ticketType.event.title}
            width={80}
            height={80}
            className="rounded-lg object-cover"
          />
        </CardHeader>
        <div className="flex-1">
          <CardHeader>
            <CardTitle>{cart.cartItems[0]?.ticketType.event.title}</CardTitle>
          </CardHeader>
          <CardContent>
            {cart.cartItems[0]?.timeSlot && (
              <>
                <CardDescription>
                  {formatDate(new Date(cart.cartItems[0].timeSlot.startTime))}
                </CardDescription>
                <CardDescription>
                  {formatTime(new Date(cart.cartItems[0].timeSlot.startTime))}
                </CardDescription>
              </>
            )}
          </CardContent>
        </div>
      </Card>

      <div className="space-y-2 text-sm">
        {cart.cartItems.map((item) => (
          <div key={item.id} className="flex justify-between">
            <span>
              {item.ticketType.name} x {item.quantity}
            </span>
            <span>{formatCurrency(item.ticketType.price * item.quantity)}</span>
          </div>
        ))}
        <div className="flex justify-between text-gray-500">
          <span>Subtotal</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>
        <div className="flex justify-between text-gray-500">
          <span className="flex items-center gap-1">
            Booking Fee
            <Info size={14} />
          </span>
          <span>{formatCurrency(bookingFee)}</span>
        </div>
        <div className="flex justify-between border-t pt-2 font-medium">
          <span>Total</span>
          <span>{formatCurrency(total)}</span>
        </div>
      </div>
    </div>
  );
};
