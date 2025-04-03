import type { SerializedEvent } from '@/app/types';
import { Alert } from '@repo/design-system/components/ui/alert';
import { Button } from '@repo/design-system/components/ui/button';
import {
  type Control,
  useController,
} from '@repo/design-system/components/ui/form';
import {
  ToggleGroup,
  ToggleGroupItem,
} from '@repo/design-system/components/ui/toggle-group';
import { cn } from '@repo/design-system/lib/utils';
import { Minus, Plus } from 'lucide-react';
import { AlertCircle } from 'lucide-react';
import type { TicketFormValues } from './event-pricing';

interface StepProps {
  event: SerializedEvent;
}

interface DateStepProps extends StepProps {
  control: Control<TicketFormValues>;
}

export function DateStep({ control, event }: DateStepProps) {
  const { field } = useController({
    name: 'date',
    control,
  });

  return (
    <>
      <h2 className="font-semibold">Select Date</h2>
      {event.eventDates && (
        <div className="overflow-x-auto">
          <ToggleGroup
            type="single"
            value={field.value ?? undefined}
            onValueChange={field.onChange}
            className="flex h-[120px] min-w-max gap-4"
          >
            {event.eventDates.map((eventDate) => {
              const date = new Date(eventDate.date);
              return (
                <ToggleGroupItem
                  key={eventDate.id}
                  value={eventDate.id.toString()}
                  aria-label={date.toLocaleDateString('en-US', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                  })}
                  className="flex aspect-square h-full flex-col gap-1 border p-4 data-[state=on]:border-red-500 data-[state=on]:bg-background"
                >
                  <span className="text-sm">
                    {date.toLocaleDateString('en-US', { weekday: 'long' })}
                  </span>
                  <span className="font-bold text-2xl">{date.getDate()}</span>
                  <span className="text-sm">
                    {date.toLocaleDateString('en-US', { month: 'long' })}
                  </span>
                </ToggleGroupItem>
              );
            })}
          </ToggleGroup>
        </div>
      )}
    </>
  );
}

interface TimeStepProps extends StepProps {
  control: Control<TicketFormValues>;
}

export function TimeStep({ control, event }: TimeStepProps) {
  const { field: dateField } = useController({
    name: 'date',
    control,
  });

  const { field: timeField } = useController({
    name: 'timeSlot',
    control,
  });

  const { field: ticketTypeIdField } = useController({
    name: 'ticketTypeId',
    control,
  });

  const selectedDate = dateField.value;
  const timeSlots = event.eventDates
    .find((ed) => ed.id.toString() === selectedDate)
    ?.timeSlots.sort((a, b) => {
      return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
    });

  if (!selectedDate) {
    return (
      <>
        <h2 className="font-semibold">Select Time</h2>
        <Alert variant="default">
          <AlertCircle className="h-4 w-4" />
          <p>Please select a date first</p>
        </Alert>
      </>
    );
  }

  return (
    <>
      <h2 className="font-semibold">Select Time</h2>
      <div className="overflow-x-auto">
        <ToggleGroup
          type="single"
          value={timeField.value}
          onValueChange={(value) => {
            timeField.onChange(value);
            // Reset ticket type when time changes
            ticketTypeIdField.onChange('');
          }}
          className="flex min-w-max gap-4"
        >
          {timeSlots?.map((timeSlot) => {
            const startTime = new Date(timeSlot.startTime);
            return (
              <ToggleGroupItem
                key={timeSlot.id}
                value={timeSlot.id.toString()}
                aria-label={startTime.toLocaleTimeString('en-US', {
                  hour: 'numeric',
                  minute: '2-digit',
                })}
                className="flex aspect-square h-full flex-col gap-1 border p-4 data-[state=on]:border-red-500 data-[state=on]:bg-background"
              >
                <span className="font-bold text-xl">
                  {startTime.toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: false,
                  })}
                </span>
                <span className="text-sm">
                  {
                    startTime
                      .toLocaleTimeString('en-US', {
                        hour12: true,
                      })
                      .split(' ')[1]
                  }
                </span>
              </ToggleGroupItem>
            );
          })}
        </ToggleGroup>
      </div>
    </>
  );
}

interface TicketTypeStepProps extends StepProps {
  control: Control<TicketFormValues>;
  availableTicketTypes: Record<
    string,
    {
      id: string | number;
      name: string;
      description: string;
      price: number;
      availableQuantity: number;
    }
  >;
}

export function TicketTypeStep({
  control,
  event,
  availableTicketTypes,
}: TicketTypeStepProps) {
  const { field: timeField } = useController({
    name: 'timeSlot',
    control,
  });

  const { field: ticketField } = useController({
    name: 'ticketTypeId',
    control,
  });

  if (!timeField.value) {
    return (
      <>
        <h2 className="font-semibold">Select Ticket Type</h2>
        <Alert variant="default">
          <AlertCircle className="h-4 w-4" />
          <p>Please select a time slot first</p>
        </Alert>
      </>
    );
  }

  const ticketTypes = Object.entries(availableTicketTypes);

  if (ticketTypes.length === 0) {
    return (
      <>
        <h2 className="font-semibold">Select Ticket Type</h2>
        <Alert variant="default">
          <AlertCircle className="h-4 w-4" />
          <p>No tickets available for this time slot</p>
        </Alert>
      </>
    );
  }

  return (
    <>
      <h2 className="font-semibold">Select Ticket Type</h2>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {ticketTypes.map(([id, ticket]) => (
          <button
            key={id}
            type="button"
            onClick={() => ticketField.onChange(id)}
            className={cn(
              'flex min-h-[280px] cursor-pointer flex-col rounded-2xl border p-6',
              { 'border-red-500': ticketField.value === id }
            )}
          >
            <div className="flex-grow space-y-2 ">
              <h3 className="font-medium text-secondary-foreground text-xl leading-tight">
                {ticket.name}
              </h3>
              <p className="min-h-[100px] text-muted-foreground text-sm leading-tight">
                {ticket.description}
              </p>
            </div>

            <div className="mt-auto">
              <div
                className={cn('relative border-t border-dashed', {
                  'border-red-500': ticketField.value === id,
                })}
              >
                <div
                  className={cn(
                    '-left-6 -ml-[1px] -mt-[10px] absolute h-6 w-3 rounded-tr-full rounded-br-full border-t border-r border-b bg-background',
                    { 'border-red-500': ticketField.value === id }
                  )}
                />
                <div
                  className={cn(
                    '-right-6 -mr-[1px] -mt-[10px] absolute h-6 w-3 rounded-tl-full rounded-bl-full border-t border-b border-l bg-background',
                    { 'border-red-500': ticketField.value === id }
                  )}
                />
              </div>
              <div className="pt-4">
                <p className="font-bold text-secondary-foreground text-xl">
                  RM {Number(ticket.price).toFixed(2)}
                  <span className="ml-1 font-normal text-muted-foreground text-sm">
                    /pax
                  </span>
                </p>
                <p className="text-muted-foreground text-sm">
                  {ticket.availableQuantity} tickets available
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </>
  );
}

interface QuantityStepProps {
  control: Control<TicketFormValues>;
}

export function QuantityStep({ control }: QuantityStepProps) {
  const { field: ticketField } = useController({
    name: 'ticketTypeId',
    control,
  });

  const { field: quantityField } = useController({
    name: 'quantity',
    control,
  });

  if (!ticketField.value) {
    return (
      <>
        <h2 className="font-semibold">Select Quantity</h2>
        <Alert variant="default">
          <AlertCircle className="h-4 w-4" />
          <p>Please select a ticket type first</p>
        </Alert>
      </>
    );
  }

  return (
    <>
      <h2 className="font-semibold">Select Quantity</h2>
      <div className="flex flex-col items-center gap-4 py-4">
        <div className="flex items-center gap-4">
          <Button
            type="button"
            size="icon"
            onClick={() =>
              quantityField.onChange(Math.max(1, quantityField.value - 1))
            }
            className="rounded-full"
            variant="outline"
          >
            <Minus />
          </Button>
          <span className="w-8 text-center font-medium text-xl">
            {quantityField.value}
          </span>
          <Button
            type="button"
            size="icon"
            onClick={() => quantityField.onChange(quantityField.value + 1)}
            className="rounded-full"
            variant="outline"
          >
            <Plus />
          </Button>
        </div>
      </div>
    </>
  );
}
