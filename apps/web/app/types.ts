import type { getCart } from './[locale]/(events)/checkout/actions';
import type { getEvent } from './[locale]/(events)/events/[slug]/actions';
import type { getOrganizer } from './[locale]/(events)/organizers/[slug]/action';

export type GetEventResponse = Awaited<ReturnType<typeof getEvent>>;
export type SerializedEvent = NonNullable<GetEventResponse>;

export type SerializedCart = NonNullable<
  Awaited<ReturnType<typeof getCart>>['data']
>;

export type SerializedOrganizer = Awaited<ReturnType<typeof getOrganizer>>;
