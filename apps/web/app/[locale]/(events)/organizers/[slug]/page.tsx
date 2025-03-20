import { notFound } from 'next/navigation';
import type { ReactElement } from 'react';
import { getOrganizer } from './action';
import { OrganizerDetails } from './components/organizer-details';
import { OrganizerTabs } from './components/organizer-tabs';

type PageProps = {
  readonly params: Promise<{
    slug: string;
    locale: string;
  }>;
};

export default async function OrganizerPage({
  params,
}: PageProps): Promise<ReactElement> {
  const { slug } = await params;

  const organizer = await getOrganizer(slug);

  if (!organizer) {
    notFound();
  }

  return (
    <div className="w-full">
      <OrganizerDetails organizer={organizer} />
      <div className="space-y-6 p-4">
        <OrganizerTabs organizer={organizer} />
      </div>
    </div>
  );
}
