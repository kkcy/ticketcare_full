import type { SerializedOrganizer } from '@/app/types';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@repo/design-system/components/ui/avatar';
import { Button } from '@repo/design-system/components/ui/button';

interface OrganizerDetailsProps {
  organizer: SerializedOrganizer;
}

export function OrganizerDetails({ organizer }: OrganizerDetailsProps) {
  return (
    <div className="space-y-5 px-4">
      <div className="flex flex-col items-center justify-center space-y-1">
        <Avatar>
          <AvatarImage src={organizer.logo ?? ''} />
          <AvatarFallback>{organizer.name.charAt(0)}</AvatarFallback>
        </Avatar>

        <h1 className="font-bold text-2xl">{organizer.name}</h1>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex-1 text-center">
          <p className="font-medium text-md">0</p>
          <p className="text-sm">Followers</p>
        </div>

        <div className="flex-1 text-center">
          <p className="font-medium text-md">{organizer._count.events}</p>
          <p className="text-sm">Events</p>
        </div>
      </div>

      <div className="flex items-center justify-center gap-2">
        <div className="flex w-full items-center">
          <Button className="mx-auto w-full max-w-[200px]">Follow</Button>
        </div>

        <div className="flex w-full items-center">
          <Button className="mx-auto w-full max-w-[200px]">Contact</Button>
        </div>
      </div>
    </div>
  );
}
