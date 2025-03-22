import { env } from '@/env';
import { auth } from '@repo/auth/server';
import { CommandIcon } from '@repo/design-system/components/icons';
import { ModeToggle } from '@repo/design-system/components/mode-toggle';
import { headers } from 'next/headers';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';

type AuthLayoutProps = {
  readonly children: ReactNode;
};

const AuthLayout = async ({ children }: AuthLayoutProps) => {
  // Check if user is already authenticated
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session?.user) {
    // If user is already authenticated, redirect to home page
    return redirect('/');
  }

  return (
    <div className="container relative grid h-dvh flex-col items-center justify-center lg:max-w-none lg:grid-cols-2 lg:px-0">
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
        <div className="absolute inset-0 bg-zinc-900" />
        <div className="relative z-20 flex items-center font-medium text-lg">
          <CommandIcon className="mr-2 h-6 w-6" />
          TicketCare
        </div>
      </div>
      <div className="lg:p-8">
        <div className="mx-auto flex w-full max-w-[400px] flex-col justify-center space-y-6">
          {children}
          <p className="px-8 text-center text-muted-foreground text-sm">
            By clicking continue, you agree to our{' '}
            <Link
              href={new URL('/legal/terms', env.NEXT_PUBLIC_WEB_URL).toString()}
              className="underline underline-offset-4 hover:text-primary"
            >
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link
              href={new URL(
                '/legal/privacy',
                env.NEXT_PUBLIC_WEB_URL
              ).toString()}
              className="underline underline-offset-4 hover:text-primary"
            >
              Privacy Policy
            </Link>
            .
          </p>
        </div>
        <div className="absolute top-4 right-4">
          <ModeToggle />
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
