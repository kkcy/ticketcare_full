import type { SerializedEvent } from '@/app/types';
import { Alert } from '@repo/design-system/components/ui/alert';
import { Button } from '@repo/design-system/components/ui/button';
import {
  ToggleGroup,
  ToggleGroupItem,
} from '@repo/design-system/components/ui/toggle-group';
import { Minus, Plus, Ticket } from 'lucide-react';
import { AlertCircle } from 'lucide-react';
import { type Control, useController } from 'react-hook-form';
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
                  className="flex aspect-square h-full flex-col gap-1 p-4 data-[state=on]:bg-red-500 data-[state=on]:text-white"
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
                className="flex aspect-square h-full flex-col gap-1 p-4 data-[state=on]:bg-red-500 data-[state=on]:text-white"
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
            className={`border ${
              ticketField.value === id ? 'border-red-500' : 'border-gray-200'
            } flex min-h-[280px] cursor-pointer flex-col rounded-2xl p-6`}
          >
            <div className="mb-4 w-fit rounded-md bg-muted p-3">
              <Ticket size={20} />
            </div>

            <div className="flex-grow">
              <h3 className="font-medium text-xl">{ticket.name}</h3>
              <p className="min-h-[100px] text-gray-600 text-sm">
                {ticket.description}
              </p>
            </div>

            <div className="mt-auto">
              <div className="relative border-red-500 border-t border-dashed">
                <div
                  className={`-left-6 -ml-[1px] -mt-[10px] absolute h-6 w-3 rounded-tr-full rounded-br-full border-t border-r border-b bg-background ${
                    ticketField.value === id
                      ? 'border-red-500'
                      : 'border-gray-200'
                  }`}
                />
                <div
                  className={`-right-6 -mr-[1px] -mt-[10px] absolute h-6 w-3 rounded-tl-full rounded-bl-full border-t border-b border-l bg-background ${
                    ticketField.value === id
                      ? 'border-red-500'
                      : 'border-gray-200'
                  }`}
                />
              </div>
              <div className="pt-4">
                <p className="font-bold text-gray-900 text-xl">
                  RM {Number(ticket.price).toFixed(2)}
                  <span className="ml-1 font-normal text-gray-500 text-sm">
                    /pax
                  </span>
                </p>
                <p className="text-gray-500 text-sm">
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
            className="rounded-full bg-red-500 text-white"
          >
            <Plus />
          </Button>
        </div>
      </div>
    </>
  );
}
