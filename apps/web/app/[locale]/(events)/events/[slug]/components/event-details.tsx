import type { SerializedEvent } from '@/app/types';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@repo/design-system/components/ui/accordion';
import { formatDateRange } from '@repo/design-system/lib/utils';
import { format } from 'date-fns';
import { CalendarDays, MapPin } from 'lucide-react';
import AddToCalendarButton from './add-to-calendar-button';
import { MapButton } from './map-button';

interface EventDetailsProps {
  event: SerializedEvent;
}

export function EventDetails({ event }: EventDetailsProps) {
  return (
    <div className="space-y-[20px]">
      <h1 className="font-bold text-2xl">{event.title}</h1>

      <div className="flex flex-col gap-4 md:flex-row">
        <div className="flex items-start gap-4 md:w-1/2">
          <div className="flex items-center justify-center rounded-full bg-emerald-100 p-3">
            <CalendarDays size={20} className="text-emerald-600" />
          </div>
          {event.eventDates && event.eventDates.length > 0 && (
            <div className="flex flex-1 flex-col space-y-4">
              <Accordion type="single" collapsible>
                <AccordionItem value="date" className="border-0">
                  <AccordionTrigger className="pt-0 pb-2 font-normal text-md hover:no-underline">
                    {formatDateRange(
                      new Date(event.eventDates[0].date),
                      new Date(event.eventDates.at(-1)?.date ?? '')
                    )}
                  </AccordionTrigger>
                  <AccordionContent className="space-y-4 pb-0">
                    {event.eventDates.map((date) => (
                      <div key={date.id} className="flex items-start">
                        <div className="w-32 shrink-0 pt-2">
                          <span className="font-medium text-muted-foreground text-sm">
                            {format(new Date(date.date), 'EEE, MMM d')}
                          </span>
                        </div>
                        <div className="flex w-full flex-wrap gap-3">
                          {date.timeSlots.map((slot) => (
                            <AddToCalendarButton
                              key={slot.id}
                              event={event}
                              timeSlot={slot}
                            >
                              <span className="text-muted-foreground text-sm">
                                {format(new Date(slot.startTime), 'h:mm a')}
                              </span>
                            </AddToCalendarButton>
                          ))}
                        </div>
                      </div>
                    ))}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          )}
        </div>

        <div className="flex items-start gap-4 md:w-1/2">
          <div className="flex items-center justify-center rounded-full bg-emerald-100 p-3">
            <MapPin size={20} className="text-emerald-600" />
          </div>
          <div className="flex flex-1 flex-col space-y-4">
            <div className="space-y-2">
              <p className="text-md">{event.venue?.name}</p>
              <p className="text-secondary-foreground text-sm">
                {event.venue?.address}
              </p>
            </div>

            <MapButton venue={event.venue} />
          </div>
        </div>
      </div>
    </div>
  );
}
