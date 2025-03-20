import { auth } from '@repo/auth/server';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from '@repo/design-system/components/ui/breadcrumb';
import { Separator } from '@repo/design-system/components/ui/separator';
import { SidebarTrigger } from '@repo/design-system/components/ui/sidebar';
import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import type { ReactElement } from 'react';
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

  if (!session?.user) {
    notFound();
  }

  const users = await getUsers();

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbPage>Users</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div>
          <div className="flex items-center justify-end" />
        </div>
        <div className="min-h-[100vh] flex-1 rounded-xl md:min-h-min">
          <UserTable
            organizerId={session.user.id}
            columns={columns}
            initialData={users}
          />
        </div>
      </div>
    </>
  );
};

export default UsersPage;
