'use client';

import type { SerializedEvent } from '@/app/types';
import { Button } from '@repo/design-system/components/ui/button';
import { getMobileOperatingSystem } from '@repo/design-system/lib/utils';
import { Calendar, X } from 'lucide-react';
import type React from 'react';
import { useEffect, useRef, useState } from 'react';

interface AddToCalendarButtonProps {
  event: SerializedEvent;
  timeSlot: SerializedEvent['eventDates'][number]['timeSlots'][number];
  children?: React.ReactNode;
}

export function AddToCalendarButton({
  event,
  timeSlot,
  children,
}: AddToCalendarButtonProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatDate = (date: string): string => {
    return new Date(date).toISOString().replace(/-|:|\.\d+/g, '');
  };

  const getGoogleCalendarUrl = (): string => {
    const startTime = formatDate(timeSlot.startTime);
    const endTime = formatDate(timeSlot.endTime);
    const locationString = event.venue.address
      ? `${event.venue.name}, ${event.venue.address}`
      : event.venue.name;

    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: event.title,
      details: `${event.description}\n\nDoors open: ${new Date(timeSlot.doorsOpen).toLocaleTimeString()}`,
      location: locationString,
      dates: `${startTime}/${endTime}`,
    });

    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  };

  // const getiOSCalendarUrl = (): string => {
  //   const startTime = formatDate(timeSlot.startTime);
  //   const endTime = formatDate(timeSlot.endTime);
  //   const locationString = event.venue.address
  //     ? `${event.venue.name}, ${event.venue.address}`
  //     : event.venue.name;

  //   const params = new URLSearchParams({
  //     title: event.title,
  //     startdt: startTime,
  //     enddt: endTime,
  //     location: locationString,
  //     description: `${event.description}\nDoors open: ${new Date(timeSlot.doorsOpen).toLocaleTimeString()}`,
  //   });

  //   return `webcal://p162-caldav.icloud.com/published/2/${params.toString()}`;
  // };

  const getICalUrl = (): string => {
    const startTime = formatDate(timeSlot.startTime);
    const endTime = formatDate(timeSlot.endTime);
    const locationString = event.venue.address
      ? `${event.venue.name}, ${event.venue.address}`
      : event.venue.name;

    const content = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'BEGIN:VEVENT',
      `DTSTART:${startTime}`,
      `DTEND:${endTime}`,
      `SUMMARY:${event.title}`,
      `DESCRIPTION:${event.description}\\n\\nDoors open: ${new Date(timeSlot.doorsOpen).toLocaleTimeString()}`,
      `LOCATION:${locationString}`,
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\n');

    const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
    return URL.createObjectURL(blob);
  };

  const handleCalendarClick = (): void => {
    const os = getMobileOperatingSystem();

    if (os === 'iOS') {
      // For iOS, create and trigger download of .ics file
      const url = getICalUrl();
      window.location.href = url;
    } else if (os === 'Android') {
      // For Android, open Google Calendar
      window.open(getGoogleCalendarUrl(), '_blank');
    } else {
      // For desktop, show dropdown with options
      setIsOpen(!isOpen);
    }
  };

  return (
    <div className="relative inline-block md:w-full" ref={dropdownRef}>
      <Button
        variant="outline"
        onClick={handleCalendarClick}
        title="Add to calendar"
        className="md:w-full"
      >
        {children}
        <Calendar className="h-4 w-4" />
      </Button>

      {isOpen && getMobileOperatingSystem() === 'desktop' && (
        <div className="absolute z-10 mt-2 w-56 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5">
          <div className="p-1">
            <div className="flex items-center justify-between px-3 py-2">
              <span className="font-medium text-gray-700 text-sm">
                Add to Calendar
              </span>
              <Button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="py-1">
              <a
                href={getGoogleCalendarUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="block px-4 py-2 text-gray-700 text-sm hover:bg-gray-100 hover:text-gray-900"
                onClick={() => setIsOpen(false)}
              >
                Google Calendar
              </a>
              <a
                href={getICalUrl()}
                download="event.ics"
                className="block px-4 py-2 text-gray-700 text-sm hover:bg-gray-100 hover:text-gray-900"
                onClick={() => setIsOpen(false)}
              >
                iCal / Outlook
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // return (
  //   <Button
  //     variant="outline"
  //     onClick={() => {}}
  //     className="w-full"
  //     title="Add to calendar"
  //   >
  //     {children}
  //     <Calendar className="h-4 w-4" />
  //   </Button>
  // );

  // return (
  //   <div className="relative z-20 inline-block text-left">
  //     <button
  //       onClick={() => setIsOpen(!isOpen)}
  //       className="flex items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 font-medium text-gray-700 text-sm hover:bg-gray-50"
  //     >
  //       <Calendar className="h-4 w-4" />
  //       Add to Calendar
  //     </button>

  //     {isOpen && (
  //       <div className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5">
  //         <div className="p-1">
  //           <div className="flex items-center justify-between px-3 py-2">
  //             <span className="font-medium text-gray-700 text-sm">
  //               Add to Calendar
  //             </span>
  //             <button
  //               onClick={() => setIsOpen(false)}
  //               className="text-gray-400 hover:text-gray-500"
  //             >
  //               <X className="h-4 w-4" />
  //             </button>
  //           </div>
  //           <div className="py-1">
  //             <a
  //               href={getGoogleCalendarUrl()}
  //               target="_blank"
  //               rel="noopener noreferrer"
  //               className="block px-4 py-2 text-gray-700 text-sm hover:bg-gray-100 hover:text-gray-900"
  //               onClick={() => setIsOpen(false)}
  //             >
  //               Google Calendar
  //             </a>
  //             <a
  //               href={getICalUrl()}
  //               download="event.ics"
  //               className="block px-4 py-2 text-gray-700 text-sm hover:bg-gray-100 hover:text-gray-900"
  //               onClick={() => setIsOpen(false)}
  //             >
  //               iCal / Outlook
  //             </a>
  //           </div>
  //         </div>
  //       </div>
  //     )}
  //   </div>
  // );
}

export default AddToCalendarButton;
