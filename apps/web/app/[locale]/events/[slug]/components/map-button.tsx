'use client';

import type { SerializedEvent } from '@/app/types';
import { Button } from '@repo/design-system/components/ui/button';
import { getMobileOperatingSystem } from '@repo/design-system/lib/utils';
import { MapIcon } from 'lucide-react';

interface MapButtonProps {
  venue: SerializedEvent['venue'];
}

export function MapButton({ venue }: MapButtonProps) {
  const getMapUrl = (): string => {
    const os = getMobileOperatingSystem();
    const query = encodeURIComponent(`${venue.name}, ${venue.address}`);

    switch (os) {
      case 'iOS':
        return `maps://maps.apple.com/?q=${query}`;
      case 'Android':
        return `geo:0,0?q=${query}`;
      default:
        return `https://www.google.com/maps/search/?api=1&query=${query}`;
    }
  };

  const handleMapClick = () => {
    const os = getMobileOperatingSystem();
    const mapUrl = getMapUrl();

    if (os === 'Android') {
      // For Android, try to open in native maps app first
      window.location.href = mapUrl;
    } else {
      // For iOS and desktop, open in new tab
      window.open(mapUrl, '_blank');
    }
  };

  if (!venue.address) {
    return null;
  }

  return (
    <Button variant="default" onClick={handleMapClick} title="Open in Maps">
      See on Map
      <MapIcon className="h-4 w-4" />
    </Button>
  );
}
