'use client';

import { LoaderCircle } from '@repo/design-system/components/icons';
import { Button } from '@repo/design-system/components/ui/button';
import { Input } from '@repo/design-system/components/ui/input';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { signIn } from '../client';

export const SignIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [pending, setPending] = useState(false);
  const router = useRouter();

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();

        setPending(true);

        try {
          // const response = await signIn.magicLink({
          //   email,
          // });

          const { error } = await signIn.email(
            {
              email,
              password,
            },
            {
              onSuccess: () => {
                router.push('/');
              },
            }
          );

          if (error) {
            throw error;
          }
        } catch (error) {
          setPending(false);
          // biome-ignore lint/suspicious/noConsole: <explanation>
          console.error(error);
        }
      }}
      className="space-y-2"
    >
      <Input
        type="email"
        name="email"
        placeholder="Email"
        required
        disabled={pending}
        onChange={(e) => setEmail(e.target.value)}
        className="text-sm"
      />

      <Input
        type="password"
        name="password"
        placeholder="Password"
        required
        disabled={pending}
        onChange={(e) => setPassword(e.target.value)}
        className="text-sm"
      />

      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? (
          <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
        ) : null}
        Continue
      </Button>

      <div className="mt-4 flex items-center justify-center text-muted-foreground text-sm">
        Don't have an account? &nbsp;
        <Button asChild variant="link" className="p-0">
          <Link href="/sign-up">Sign up</Link>
        </Button>
      </div>
    </form>
  );
};
