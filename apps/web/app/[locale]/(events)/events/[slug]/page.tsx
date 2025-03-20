import { Separator } from '@repo/design-system/components/ui/separator';
import { redirect } from 'next/navigation';
import type { ReactElement } from 'react';
import { getEvent } from './actions';
import { EventCarousel } from './components/event-carousel';
import { EventDetails } from './components/event-details';
import { EventTabs } from './components/event-tabs';

type PageProps = {
  readonly params: Promise<{
    slug: string;
    locale: string;
  }>;
};

export default async function EventPage({
  params,
}: PageProps): Promise<ReactElement> {
  const { slug } = await params;

  const event = await getEvent(slug);

  if (!event) {
    redirect('/');
  }

  return (
    <div className="w-full">
      <EventCarousel />
      <div className="space-y-6 p-4">
        <EventDetails event={event} />
        <Separator />
        <EventTabs event={event} />
      </div>
    </div>
  );
}
