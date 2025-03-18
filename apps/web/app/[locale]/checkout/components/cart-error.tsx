'use client';

import { Button } from '@repo/design-system/components/ui/button';
import { ArrowLeft, ShoppingCart } from 'lucide-react';

export function CartError({ error }: { error: string }) {
  return (
    <div className="flex min-h-[500px] w-full flex-col items-center justify-center bg-white p-4 md:p-6">
      <div className="flex w-full max-w-md flex-col items-center space-y-6 text-center">
        <div className="rounded-full bg-red-50 p-6">
          <ShoppingCart className="h-12 w-12 text-red-500" />
        </div>

        <div className="space-y-3">
          <h2 className="font-semibold text-gray-900 text-xl">Error</h2>
          <p className="text-gray-500">{error}</p>
        </div>

        <Button
          onClick={() => {
            window.history.back();
          }}
          className="flex items-center space-x-2"
          variant="default"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Go Back</span>
        </Button>
      </div>
    </div>
  );
}
