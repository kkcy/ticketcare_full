'use client';

import { LoaderCircle } from '@repo/design-system/components/icons';
import { Button } from '@repo/design-system/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
  useForm,
} from '@repo/design-system/components/ui/form';
import { Input } from '@repo/design-system/components/ui/input';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { signUp } from '../client';

export const SignUp = () => {
  const [pending, setPending] = useState(false);
  const router = useRouter();
  const form = useForm<{
    email: string;
    password: string;
    name: string;
  }>({
    defaultValues: {
      email: '',
      password: '',
      name: '',
    },
  });

  async function onSubmit(values: {
    email: string;
    password: string;
    name: string;
  }) {
    setPending(true);

    try {
      // const response = await signIn.magicLink({
      //   email,
      // });

      const { error } = await signUp.email(values, {
        onSuccess: () => {
          router.push('/');
        },
      });

      if (error) {
        throw error;
      }
    } catch (error) {
      setPending(false);
      console.error(error);
      form.setError('root', { message: 'Failed to sign up' });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  type="email"
                  placeholder="Email"
                  disabled={pending}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  type="password"
                  placeholder="Password"
                  disabled={pending}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  type="text"
                  placeholder="Name"
                  disabled={pending}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? (
            <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
          ) : null}
          Continue
        </Button>

        {form.formState.errors.root && (
          <p
            data-slot="form-message"
            className="text-destructive-foreground text-sm"
          >
            {form.formState.errors.root?.message}
          </p>
        )}

        <div className="mt-4 flex items-center justify-center text-muted-foreground text-sm">
          Already have an account? &nbsp;
          <Button type="button" asChild variant="link" className="p-0">
            <Link href="/sign-in">Sign in</Link>
          </Button>
        </div>
      </form>
    </Form>
  );
};
