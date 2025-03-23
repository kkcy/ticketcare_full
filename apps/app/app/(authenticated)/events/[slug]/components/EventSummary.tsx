'use client';

import type { SerializedEvent } from '@/types';
import {
  Activity,
  CalendarDays,
  Image as ImageIcon,
  Images,
  Info,
  MapPin,
  TicketIcon,
} from '@repo/design-system/components/icons';
import Image from 'next/image';
import { title } from 'radash';
import { CarouselImagesDialog } from '../../../components/CarouselImagesDialog';
import { updateEvent } from '../../actions';
import { HeroImageDialog } from '../../components/HeroImageDialog';
import { ShareButtons } from './ShareButtons';

interface EventSummaryProps {
  event: SerializedEvent;
}

export function EventSummary({ event }: EventSummaryProps) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border p-4">
          <div className="flex items-center gap-2">
            <Info className="h-4 w-4 text-muted-foreground" />
            <h3 className="font-semibold">Event Details</h3>
          </div>
          <p className="mt-2 text-muted-foreground text-sm">
            {event.description}
          </p>
        </div>
        <div className="rounded-lg border p-4">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <h3 className="font-semibold">Venue</h3>
          </div>
          <p className="mt-2 text-muted-foreground text-sm">
            {event.venue.name}
          </p>
        </div>
        <div className="rounded-lg border p-4">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
            <h3 className="font-semibold">Date & Time</h3>
          </div>
          <p className="mt-2 text-muted-foreground text-sm">
            {new Date(event.startTime).toLocaleString()}
          </p>
        </div>
        <div className="rounded-lg border p-4">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-muted-foreground" />
            <h3 className="font-semibold">Status</h3>
          </div>
          <p className="mt-2 text-muted-foreground text-sm">
            {title(event.status)}
          </p>
        </div>
        <div className="rounded-lg border p-4">
          <div className="flex items-center gap-2">
            <TicketIcon className="h-4 w-4 text-muted-foreground" />
            <h3 className="font-semibold">Ticket Capacity</h3>
          </div>
          <p className="mt-2 text-muted-foreground text-sm">
            {event.maxTicketsPerEvent} tickets
            {!event.isPremiumEvent && (
              <span className="ml-1 text-yellow-600">(Free tier limit)</span>
            )}
          </p>
        </div>
      </div>

      <div className="rounded-lg border p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ImageIcon className="h-4 w-4 text-muted-foreground" />
            <h3 className="font-semibold">Hero Image</h3>
          </div>
          <HeroImageDialog event={event} />
        </div>
        <div className="mt-4">
          {event.heroImageUrl ? (
            <div className="relative h-60 w-full overflow-hidden rounded-md">
              <Image
                src={event.heroImageUrl}
                alt={event.title}
                fill
                className="object-cover"
              />
            </div>
          ) : (
            <div className="flex h-60 w-full items-center justify-center rounded-md border border-dashed">
              <p className="text-muted-foreground text-sm">
                No hero image available
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="rounded-lg border p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Images className="h-4 w-4 text-muted-foreground" />
            <h3 className="font-semibold">Carousel Images</h3>
          </div>
          <CarouselImagesDialog
            images={event.carouselImageUrls}
            onSubmit={async (values) => {
              await updateEvent(event.id, {
                carouselImageUrls: values.images,
              });
            }}
          />
        </div>
        <div className="mt-4">
          {event.carouselImageUrls && event.carouselImageUrls.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
              {event.carouselImageUrls.map((imageUrl, index) => (
                <div
                  key={index}
                  className="relative h-40 overflow-hidden rounded-md"
                >
                  <Image
                    src={imageUrl}
                    alt={`${event.title} carousel image ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex h-40 w-full items-center justify-center rounded-md border border-dashed">
              <p className="text-muted-foreground text-sm">
                No carousel images available
              </p>
            </div>
          )}
        </div>
      </div>

      <ShareButtons event={event} />
    </div>
  );
}
