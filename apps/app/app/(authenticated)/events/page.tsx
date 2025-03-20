import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from '@repo/design-system/components/ui/breadcrumb';
import { Separator } from '@repo/design-system/components/ui/separator';
import { SidebarTrigger } from '@repo/design-system/components/ui/sidebar';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@repo/design-system/components/ui/tabs';
import type { Metadata } from 'next';
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
      <header className="flex h-16 shrink-0 items-center gap-2">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbPage>Events</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
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
