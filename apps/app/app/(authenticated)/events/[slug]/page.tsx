import {} from '@repo/design-system/components/ui/breadcrumb';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@repo/design-system/components/ui/tabs';
import type { Metadata } from 'next';
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

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const event = await getEvent(slug);
  return {
    title: `${event.title} - TicketCare`,
    description: event.description || `Details for ${event.title}`,
  };
}

export default async function EventDetailPage({
  params,
}: PageProps): Promise<ReactElement> {
  const { slug } = await params;
  const event = await getEvent(slug);

  return (
    <>
      <Header pages={['Events']} page={event.title} />

      <main className="flex-1 space-y-4 p-4 pt-6 md:p-8">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="font-bold text-3xl tracking-tight">{event.title}</h2>
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
