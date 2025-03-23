import { auth } from '@repo/auth/server';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { Header } from '../../components/header';
import { getOrganizers } from './actions';
import { OrganizerDialog } from './components/OrganizerDialog';
import { OrganizerTable } from './components/OrganizerTable';

export default async function OrganizersPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // Check if user is a super admin
  if (!session?.user?.role || session.user.role !== 'super-admin') {
    redirect('/');
  }

  const organizers = await getOrganizers();



  return (
    <>
      <Header page="Organizers" />

      <div className="flex items-center justify-between gap-4 px-4">
        <div>
          <h1 className="font-bold text-3xl">Organizers</h1>
          <p className="text-muted-foreground">
            Manage event organizers and their premium status
          </p>
        </div>
        <OrganizerDialog />
      </div>

      <div className="p-4">
        <OrganizerTable initialData={organizers} />
      </div>
    </>
  );
}
