'use client';

import { CarouselImagesDialog } from '@/app/(authenticated)/components/CarouselImagesDialog';
import type { SerializedVenueWithEvents } from '@/types';
import { Images } from '@repo/design-system/components/icons';
import Image from 'next/image';
import { updateVenue } from '../actions';

export function VenueMedia({ venue }: { venue: SerializedVenueWithEvents }) {
  return (
    <div className="rounded-lg border p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Images className="h-4 w-4 text-muted-foreground" />
          <h3 className="font-semibold">Images</h3>
        </div>
        <CarouselImagesDialog
          id={venue.id}
          images={venue.images}
          onSubmit={async (values) => {
            await updateVenue(venue.id, {
              images: values.images,
            });
          }}
        />
      </div>
      <div className="mt-4">
        {venue.images && venue.images.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {venue.images.map((imageUrl, index) => (
              <div
                key={index}
                className="relative h-40 overflow-hidden rounded-md"
              >
                <Image
                  src={imageUrl}
                  alt={`${venue.name} carousel image ${index + 1}`}
                  fill
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex h-40 w-full items-center justify-center rounded-md border border-dashed">
            <p className="text-muted-foreground text-sm">No images available</p>
          </div>
        )}
      </div>
    </div>
  );
}
