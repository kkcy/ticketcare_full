'use client';

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  useFormContext,
} from '@repo/design-system/components/ui/form';
import { Input } from '@repo/design-system/components/ui/input';
import { PhoneInput } from '@repo/design-system/components/ui/phone-input';
import type { FC } from 'react';

export const ContactInformation: FC = () => {
  const form = useFormContext();

  return (
    <div className="space-y-[24px]">
      <h2 className="font-semibold text-lg">Contact Information</h2>
      <div className="space-y-[16px]">
        <FormField
          control={form.control}
          name="fullName"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-500 text-sm">Full Name</FormLabel>
              <FormControl>
                <Input
                  placeholder="Michella Barkin"
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
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-500 text-sm">
                Email Address
              </FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="michellabarkin@email.com"
                  className="w-full p-2"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-2">
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel className="text-gray-500 text-sm">
                  Mobile Number
                </FormLabel>
                <FormControl>
                  <PhoneInput {...field} international defaultCountry="MY" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
    </div>
  );
};
