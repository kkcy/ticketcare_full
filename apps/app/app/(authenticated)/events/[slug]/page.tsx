import type { SerializedEvent } from '@/types';
import { StarIcon } from '@repo/design-system/components/icons';
import { Badge } from '@repo/design-system/components/ui/badge';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@repo/design-system/components/ui/tabs';
import { notFound } from 'next/navigation';
import type { ReactElement } from 'react';
import { Header } from '../../components/header';
import { EventDialog } from '../components/EventDialog';
import { getEvent } from './actions';
import { EventReports } from './components/EventReports';
import { EventStatus } from './components/EventStatus';
import { EventSummary } from './components/EventSummary';
import { EventTickets } from './components/EventTickets';

type PageProps = {
  readonly params: Promise<{
    slug: string;
  }>;
};

export default async function EventDetailPage({
  params,
}: PageProps): Promise<ReactElement> {
  const { slug } = await params;

  // Get event by slug
  let event: SerializedEvent;
  try {
    event = await getEvent(slug);
  } catch (_error) {
    notFound();
  }

  return (
    <>
      <Header pages={['Events']} page={event.title} />

      <main className="flex-1 space-y-4 p-4 pt-6 md:p-8">
        <div className="flex items-center justify-start space-y-2">
          <h2 className="font-bold text-3xl tracking-tight">{event.title}</h2>
          {event.isPremiumEvent && (
            <Badge
              variant="secondary"
              className="premium-badge"
              style={{
                backgroundColor: '#fef3c7',
                marginLeft: '0.75rem',
                color: '#92400e',
                display: 'flex',
                gap: '0.25rem',
                alignItems: 'center',
              }}
            >
              <StarIcon className="h-3 w-3" />
              Premium Event
            </Badge>
          )}
        </div>
        <Tabs defaultValue="summary">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="summary">Summary</TabsTrigger>
              <TabsTrigger value="reports">Reports</TabsTrigger>
              <TabsTrigger value="tickets">Tickets</TabsTrigger>
            </TabsList>
            <div className="flex items-center gap-2">
              <EventStatus event={event} />
              <EventDialog mode="edit" event={event} />
            </div>
          </div>
          <TabsContent value="summary" className="mt-6">
            <EventSummary event={event} />
          </TabsContent>
          <TabsContent value="reports" className="mt-6">
            <EventReports event={event} />
          </TabsContent>
          <TabsContent value="tickets" className="mt-6">
            <EventTickets event={event} />
          </TabsContent>
        </Tabs>
      </main>
    </>
  );
}
