'use client';

import { CardInput } from '@repo/design-system/components/ui/card-input';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@repo/design-system/components/ui/form';
import { useFormContext } from '@repo/design-system/components/ui/form';
import {
  ToggleGroup,
  ToggleGroupItem,
} from '@repo/design-system/components/ui/toggle-group';
import Image from 'next/image';
import type { FC } from 'react';

export const PaymentDetails: FC = () => {
  const form = useFormContext();

  return (
    <div className="space-y-[24px]">
      <h2 className="font-semibold text-lg">Payment Details</h2>
      <ToggleGroup
        type="single"
        value={form.watch('paymentMethod')}
        onValueChange={(value) =>
          value && form.setValue('paymentMethod', value)
        }
        className="flex flex-col gap-[16px] space-y-3"
      >
        <ToggleGroupItem
          value="fpx"
          className="flex h-[64px] w-full items-center justify-between rounded-md border p-[16px] data-[state=on]:bg-orange-500 data-[state=on]:text-white"
        >
          <span>FPX</span>
          <Image src="/fpx.png" alt="FPX" width={60} height={48} />
        </ToggleGroupItem>
        <ToggleGroupItem
          value="card"
          className="flex h-[64px] w-full items-center justify-between rounded-md border p-[16px] data-[state=on]:bg-orange-500 data-[state=on]:text-white"
        >
          <span>Credit/Debit Card</span>
          <Image src="/visa.png" alt="Visa" width={100} height={24} />
        </ToggleGroupItem>
        <ToggleGroupItem
          value="wallet"
          className="flex h-[64px] w-full items-center justify-between rounded-md border p-[16px] data-[state=on]:bg-orange-500 data-[state=on]:text-white"
        >
          <span>E-Wallet</span>
          <Image src="/wallet.png" alt="E-Wallet" width={80} height={24} />
        </ToggleGroupItem>
        <ToggleGroupItem
          value="chip"
          className="flex h-[64px] w-full items-center justify-between rounded-md border p-[16px] data-[state=on]:bg-orange-500 data-[state=on]:text-white"
        >
          <span>Chip-In Asia</span>
          <div className="flex items-center space-x-2">
            <span className="font-medium text-sm">
              Multiple payment methods
            </span>
          </div>
        </ToggleGroupItem>
      </ToggleGroup>

      {form.watch('paymentMethod') === 'card' && (
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="cardNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-muted-foreground text-sm">
                  Card Number
                </FormLabel>
                <FormControl>
                  <CardInput
                    type="card"
                    placeholder="4111 1111 1111 1111"
                    className="w-full p-2"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex gap-4">
            <FormField
              control={form.control}
              name="expiryDate"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel className="text-muted-foreground text-sm">
                    Expiry Date
                  </FormLabel>
                  <FormControl>
                    <CardInput
                      type="expiry"
                      placeholder="MM/YY"
                      className="w-full p-2"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="cvv"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel className="text-muted-foreground text-sm">
                    CVV
                  </FormLabel>
                  <FormControl>
                    <CardInput
                      type="cvv"
                      placeholder="123"
                      className="w-full p-2"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
      )}
    </div>
  );
};
