'use client';

import logo from '@/public/logo.png';
import { ModeToggle } from '@repo/design-system/components/mode-toggle';
import Image from 'next/image';

export const Header = () => {
  return (
    <header className="fixed top-0 right-0 left-0 z-40 w-full bg-background">
      <div className="mx-auto flex min-h-16 max-w-4xl flex-row items-center justify-between max-lg:px-4">
        <Image src={logo} alt="Logo" width={124} height={24} />
        <ModeToggle />
      </div>
    </header>
  );
};
