'use server';

import type { Organization } from '@repo/database';
import { cookies as getCookies } from 'next/headers';

export async function setActiveOrganization(organization: Organization) {
  const cookies = await getCookies();
  // store to cookie for persistent
  // TODO: sign this for security, iron-session
  cookies.set('activeOrganization', JSON.stringify(organization), {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    path: '/',
  });
}

export async function clearActiveOrganization() {
  const cookies = await getCookies();
  cookies.delete('activeOrganization');
}
