import 'server-only';

import { PrismaClient, Prisma as PrismaNamespace } from '@prisma/client';

declare global {
  var cachedPrisma: PrismaClient | undefined;
}

export const database = new PrismaClient();

export {
  CartStatus,
  EventStatus,
  OrderStatus,
  Prisma as PrismaNamespace,
} from '@prisma/client';
export type { User, Organization, Organizer } from '@prisma/client';

type SerializedPrisma<T> = T extends PrismaNamespace.Decimal
  ? number
  : T extends bigint
    ? string
    : T extends Date
      ? string
      : T extends object
        ? { [K in keyof T]: SerializedPrisma<T[K]> }
        : T extends Array<infer U>
          ? SerializedPrisma<U>[]
          : T;

export const serializePrisma = <T>(data: T): SerializedPrisma<T> => {
  return JSON.parse(
    JSON.stringify(data, (_, value) => {
      if (typeof value === 'bigint') {
        return value.toString();
      }

      if (value instanceof PrismaNamespace.Decimal) {
        return value.toNumber();
      }

      if (value instanceof Date) {
        return value.toISOString();
      }

      return value;
    })
  );
};
