import { auth } from '@repo/auth/server';
import {} from '@repo/design-system/components/ui/breadcrumb';
import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import type { ReactElement } from 'react';
import { Header } from '../components/header';
import { getUsers } from './actions';
import { columns } from './components/UserColumn';
import { UserTable } from './components/UserTable';

const title = 'TicketCare - Users';
const description = 'TicketCare - Users';

export const metadata: Metadata = {
  title,
  description,
};

const UsersPage = async (): Promise<ReactElement> => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user || !session?.session.organizerId) {
    return notFound();
  }

  const users = await getUsers();

  return (
    <>
      <Header page="Users" />

      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div>
          <div className="flex items-center justify-end" />
        </div>
        <div className="min-h-[100vh] flex-1 rounded-xl md:min-h-min">
          <UserTable
            organizerId={session.session.organizerId}
            columns={columns}
            initialData={users}
          />
        </div>
      </div>
    </>
  );
};

export default UsersPage;
