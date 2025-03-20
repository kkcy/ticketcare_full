import type { SerializedEvent } from '@/types';

interface EventReportsProps {
  event: SerializedEvent;
}

export function EventReports(_: EventReportsProps) {
  return (
    <div className="rounded-lg border">
      <div className="flex flex-col gap-1 p-4">
        <h3 className="font-semibold text-lg">Event Reports</h3>
        <p className="text-muted-foreground text-sm">
          View detailed reports and analytics for this event.
        </p>
      </div>
    </div>
  );
}
