import type { SerializedOrganizer } from '@/app/types';
import { InstagramLogoIcon } from '@radix-ui/react-icons';
import { Button } from '@repo/design-system/components/ui/button';
import { Separator } from '@repo/design-system/components/ui/separator';
import { FacebookIcon, GlobeIcon, X } from 'lucide-react';
import Link from 'next/link';

interface OrganizerAboutProps {
  organizer: SerializedOrganizer;
}

export function OrganizerAbout({ organizer }: OrganizerAboutProps) {
  return (
    <div className="space-y-[24px]">
      <h2 className="font-semibold">About {organizer.name}</h2>

      {/* TODO: replace with markdown */}
      <p className="text-secondary-foreground">{organizer.description}</p>

      <Separator />

      <div className="flex gap-2">
        {organizer.website && (
          <Link href={organizer.website} target="_blank">
            <Button variant="secondary" size="icon">
              <GlobeIcon />
            </Button>
          </Link>
        )}

        {organizer.facebook && (
          <Link href={organizer.facebook} target="_blank">
            <Button variant="secondary" size="icon">
              <FacebookIcon />
            </Button>
          </Link>
        )}

        {organizer.twitter && (
          <Link href={organizer.twitter} target="_blank">
            <Button variant="secondary" size="icon">
              <X />
            </Button>
          </Link>
        )}

        {organizer.instagram && (
          <Link href={organizer.instagram} target="_blank">
            <Button variant="secondary" size="icon">
              <InstagramLogoIcon />
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}
