import { Skeleton } from '@repo/design-system/components/ui/skeleton';
import type { ReactElement } from 'react';
import { getCart } from './actions';
import { CartError } from './components/cart-error';
import { CheckoutForm } from './components/checkout-form';
import { CheckoutTimer } from './components/checkout-timer';

type PageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function CheckoutPage({
  searchParams,
}: PageProps): Promise<ReactElement> {
  const { cartId } = await searchParams;

  if (!cartId) {
    return <CartError error="Invalid cart" />;
  }

  const { data: cart, error } = await getCart(cartId as string);

  if (error) {
    return <CartError error={error ?? 'Something went wrong'} />;
  }

  if (!cart) {
    return (
      <div className="flex min-h-[500px] w-full flex-col items-center justify-start gap-8 bg-white p-4">
        <div className="w-full max-w-md space-y-8">
          <Skeleton className="h-8 w-48" />

          <div className="flex items-start space-x-4 rounded-lg bg-gray-50 p-4">
            <Skeleton className="h-24 w-24 flex-shrink-0 rounded-lg" />
            <div className="flex-1 space-y-4">
              <Skeleton className="h-6 w-3/4" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-6">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-24" />
            </div>

            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-24" />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-4 rounded-full" />
              </div>
              <Skeleton className="h-4 w-24" />
            </div>

            <div className="flex items-center justify-between pt-4">
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-6 w-28" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <CheckoutTimer cart={cart} />
      <CheckoutForm cart={cart} />
    </>
  );
}
