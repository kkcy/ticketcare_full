import type { SerializedVenue } from '@/types';
import { MapPinIcon, UsersIcon } from '@repo/design-system/components/icons';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@repo/design-system/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@repo/design-system/components/ui/tooltip';
import Link from 'next/link';

export function VenueCard({ venue }: { venue: SerializedVenue }) {
  return (
    <Link href={`/admin/venues/${venue.slug}`} className="block h-full">
      <Card className="flex h-full flex-col transition-shadow hover:shadow-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{venue.name}</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="flex-grow space-y-1 text-sm">
          {venue.address && (
            <Tooltip>
              <TooltipTrigger className="flex items-center">
                <MapPinIcon className="mr-2 h-4 w-4" />
                {venue.city ? `${venue.address}, ${venue.city}` : venue.address}
              </TooltipTrigger>
              <TooltipContent>
                <p>Location</p>
              </TooltipContent>
            </Tooltip>
          )}

          {venue.totalCapacity ? (
            <Tooltip>
              <TooltipTrigger className="flex items-center">
                <UsersIcon className="mr-2 h-4 w-4" />
                {venue.totalCapacity} capacity
              </TooltipTrigger>
              <TooltipContent>
                <p>Total capacity</p>
              </TooltipContent>
            </Tooltip>
          ) : null}

          {/* Venue features section removed as these fields are no longer in the schema */}
        </CardContent>
        <CardFooter>
          <CardDescription className="line-clamp-2">
            {venue.description}
          </CardDescription>
        </CardFooter>
      </Card>
    </Link>
  );
}
