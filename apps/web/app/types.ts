import type { getCart } from './[locale]/checkout/actions';
import type { getEvent } from './[locale]/events/[slug]/actions';
import type { getOrganizer } from './[locale]/organizers/[slug]/action';

export type SerializedEvent = Awaited<ReturnType<typeof getEvent>>;

export type SerializedCart = NonNullable<
  Awaited<ReturnType<typeof getCart>>['data']
>;

export type SerializedOrganizer = Awaited<ReturnType<typeof getOrganizer>>;
