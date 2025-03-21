import type { getEvent } from './app/(authenticated)/events/[slug]/actions';
import type { getOrders } from './app/(authenticated)/orders/actions';
// Import actions from their respective locations
// These will be updated once we create the action files
import type { getUsers } from './app/(authenticated)/users/actions';

export type SerializedUsers = Awaited<ReturnType<typeof getUsers>>;
export type SerializedUser = SerializedUsers[number];

export type SerializedEvent = Awaited<ReturnType<typeof getEvent>>;

export type SerializedOrders = Awaited<ReturnType<typeof getOrders>>;
export type SerializedOrder = SerializedOrders[number];
