'use client';

import { env } from '@/env';
import type { ReactNode } from 'react';
import { SWRConfig } from 'swr';

export const fetcher = (resource: string, init?: RequestInit) => {
  return fetch(env.NEXT_PUBLIC_API_URL + resource, init).then((res) =>
    res.json()
  );
};

export function SWRProvider({ children }: { children: ReactNode }) {
  return (
    <SWRConfig
      value={{
        fetcher,
      }}
    >
      {children}
    </SWRConfig>
  );
}
