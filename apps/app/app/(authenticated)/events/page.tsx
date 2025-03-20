import {} from '@repo/design-system/components/ui/breadcrumb';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@repo/design-system/components/ui/tabs';
import type { Metadata } from 'next';
import { Header } from '../components/header';
import { EventDialog } from './components/EventDialog';
import { PastEvents } from './past-events';
import { UpcomingEvents } from './upcoming-events';

const title = 'TicketCare - Events';
const description = 'TicketCare - Events';

export const metadata: Metadata = {
  title,
  description,
};

const EventPage = () => {
  return (
    <>
      <Header page="Events" />

      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div>
          <Tabs defaultValue="upcoming">
            <div className="flex items-center justify-between">
              <TabsList>
                <TabsTrigger value="upcoming">Upcoming Events</TabsTrigger>
                <TabsTrigger value="past">Past Events</TabsTrigger>
              </TabsList>
              <EventDialog />
            </div>
            <TabsContent value="upcoming">
              <UpcomingEvents />
            </TabsContent>
            <TabsContent value="past">
              <PastEvents />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
};

export default EventPage;
