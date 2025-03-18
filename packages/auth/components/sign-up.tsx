'use client';

import { LoaderCircle } from '@repo/design-system/components/icons';
import { Button } from '@repo/design-system/components/ui/button';
import { Input } from '@repo/design-system/components/ui/input';
import Link from 'next/link';
import { useState } from 'react';
import { useFormStatus } from 'react-dom';
import { signUp } from '../client';

export const SignUp = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const { pending } = useFormStatus();

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();

        await signUp.email({
          email,
          password,
          name,
        });
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

      <Input
        type="text"
        name="name"
        placeholder="Name"
        required
        disabled={pending}
        onChange={(e) => setName(e.target.value)}
        className="text-sm"
      />

      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? (
          <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
        ) : null}
        Continue
      </Button>

      <div className="mt-4 flex items-center justify-center text-muted-foreground text-sm">
        Already have an account? &nbsp;
        <Button asChild variant="link" className="p-0">
          <Link href="/sign-in">Sign in</Link>
        </Button>
      </div>
    </form>
  );
};
