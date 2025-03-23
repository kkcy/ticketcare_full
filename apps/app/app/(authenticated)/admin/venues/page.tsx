import { auth } from '@repo/auth/server';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { Header } from '../../components/header';
import { getVenues } from './actions';
import { VenueCard } from './components/VenueCard';
import { VenueDialog } from './components/VenueDialog';

export default async function VenuesPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // Check if user is a super admin
  if (!session?.user?.role || session.user.role !== 'super-admin') {
    redirect('/');
  }

  const venues = await getVenues();

  return (
    <>
      <Header page="Venues" />

      <div className="flex items-center justify-between gap-4 px-4">
        <div>
          <h1 className="font-bold text-3xl">Venues</h1>
          <p className="text-muted-foreground">Manage venues for events</p>
        </div>
        <VenueDialog />
      </div>

      <div className="grid min-h-[100vh] flex-1 auto-rows-max gap-4 p-4 md:min-h-min lg:grid-cols-3">
        {venues.map((venue) => (
          <VenueCard key={venue.id} venue={venue} />
        ))}

        {venues.length === 0 && (
          <div className="col-span-full flex h-40 items-center justify-center rounded-lg border border-dashed">
            <div className="text-center">
              <p className="text-muted-foreground">No venues found</p>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
