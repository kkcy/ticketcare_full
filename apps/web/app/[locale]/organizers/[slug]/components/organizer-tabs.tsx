'use client';

import type { SerializedOrganizer } from '@/app/types';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@repo/design-system/components/ui/tabs';
import { useSearchParams } from 'next/navigation';
import { OrganizerAbout } from './organizer-about';
import { OrganizerEvents } from './organizer-events';

interface OrganizerTabsProps {
  organizer: SerializedOrganizer;
}

export function OrganizerTabs({ organizer }: OrganizerTabsProps) {
  const searchParams = useSearchParams();
  const currentTab = (searchParams.get('tab') as string) || 'events';

  return (
    <Tabs
      value={currentTab}
      className="w-full"
      onValueChange={(value) => {
        const url = new URL(window.location.href);
        url.searchParams.set('tab', value);
        window.history.replaceState(null, '', url);
      }}
    >
      <div className="sticky top-16 right-0 left-0 z-10 bg-background">
        <TabsList className="flex">
          {['Events', 'About'].map((label) => (
            <TabsTrigger
              key={label}
              value={label.toLowerCase()}
              className="flex-1"
            >
              {label}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>
      <TabsContent value="events" className="mt-4 min-h-[calc(100vh-208px)]">
        <OrganizerEvents organizer={organizer} />
      </TabsContent>
      <TabsContent value="about" className="mt-4 min-h-[calc(100vh-208px)]">
        <OrganizerAbout organizer={organizer} />
      </TabsContent>
    </Tabs>
  );
}
