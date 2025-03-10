import 'server-only'

import { Prisma, PrismaClient, EventStatus, OrderStatus, CartStatus, CustomerType } from '@prisma/client'

declare global {
  var cachedPrisma: PrismaClient | undefined
}

export const database = new PrismaClient()

export { Prisma, EventStatus, OrderStatus, CartStatus, CustomerType }

type SerializedPrisma<T> = T extends Prisma.Decimal
  ? number
  : T extends bigint
  ? string
  : T extends Date
  ? string
  : T extends object
  ? { [K in keyof T]: SerializedPrisma<T[K]> }
  : T extends Array<infer U>
  ? Array<SerializedPrisma<U>>
  : T

export const serializePrisma = <T>(data: T): SerializedPrisma<T> => {
  return JSON.parse(
    JSON.stringify(data, (_, value) =>
      typeof value === 'bigint'
        ? value.toString()
        : value instanceof Prisma.Decimal
          ? value.toNumber()
          : value instanceof Date
            ? value.toISOString()
            : value
    )
  )
}
