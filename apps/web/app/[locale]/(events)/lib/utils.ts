import type { SerializedEvent } from '@/app/types';

export function isExpired(event: SerializedEvent) {
  return new Date(event.endTime) < new Date();
}
