import { database, serializePrisma } from '@repo/database';
import { Badge } from '@repo/design-system/components/ui/badge';
import {} from '@repo/design-system/components/ui/breadcrumb';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@repo/design-system/components/ui/card';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { title } from 'radash';
import type { ReactElement } from 'react';
import { Header } from '../../components/header';

type PageProps = {
  readonly params: Promise<{
    id: string;
  }>;
};

async function getOrder(id: string) {
  const order = await database.order.findUnique({
    where: {
      id: Number.parseInt(id),
    },
    select: {
      id: true,
      status: true,
      totalAmount: true,
      paymentMethod: true,
      transactionId: true,
      paymentStatus: true,
      orderedAt: true,
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          role: true,
        },
      },
      tickets: {
        select: {
          id: true,
          status: true,
          purchaseDate: true,
          ownerName: true,
          ownerEmail: true,
          ownerPhone: true,
          qrCode: true,
          event: {
            select: {
              id: true,
              title: true,
              description: true,
              startTime: true,
              endTime: true,
              doorsOpen: true,
              venue: {
                select: {
                  id: true,
                  name: true,
                  address: true,
                },
              },
            },
          },
          ticketType: {
            select: {
              id: true,
              name: true,
              description: true,
              price: true,
            },
          },
        },
      },
    },
  });

  if (!order) {
    notFound();
  }

  return serializePrisma(order);
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const order = await getOrder(id);

  const title = 'Order - TicketCare';
  const description = `Details for order ${order.id}`;

  return {
    title,
    description,
  };
}

export default async function OrderDetailPage({
  params,
}: PageProps): Promise<ReactElement> {
  const { id } = await params;
  const order = await getOrder(id);

  return (
    <>
      <Header pages={['Orders']} page={order.id} />

      <main className="flex-1 space-y-4 p-4 pt-6 lg:p-8">
        <div>
          <h2 className="font-semibold text-3xl tracking-tight">{`Order ${order.id}`}</h2>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Order Details</CardTitle>
                <Badge
                  variant={
                    order.status === 'completed'
                      ? 'success'
                      : order.status === 'pending'
                        ? 'pending'
                        : order.status === 'cancelled'
                          ? 'destructive'
                          : 'secondary'
                  }
                >
                  {title(order.status)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Order ID</span>
                <span>#{order.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Amount</span>
                <span>${order.totalAmount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Payment Method</span>
                <span className="capitalize">{title(order.paymentMethod)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Payment Status</span>
                <span className="capitalize">{order.paymentStatus}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Transaction ID</span>
                <span>{order.transactionId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Order Date</span>
                <span>{new Date(order.orderedAt).toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Name</span>
                <span>{`${order.user.firstName} ${order.user.lastName}`}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Email</span>
                <span>{order.user.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Phone</span>
                <span>{order.user.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Account Type</span>
                <span className="capitalize">{order.user.role}</span>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4 lg:col-span-2">
            <div>
              <h2 className="font-semibold text-2xl tracking-tight">Tickets</h2>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <div className="space-y-4">
                {order.tickets.map((ticket) => {
                  if (!ticket) {
                    return <></>;
                  }

                  return (
                    <div key={ticket.id} className="rounded-lg border p-4">
                      <div className="mb-2 flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold">
                            {ticket.event?.title}
                          </h4>
                          <p className="text-muted-foreground text-sm">
                            {ticket.event?.venue.name} -{' '}
                            {ticket.ticketType.name}
                          </p>
                        </div>
                        <Badge
                          variant={
                            ticket.status === 'purchased'
                              ? 'success'
                              : ticket.status === 'reserved'
                                ? 'pending'
                                : ticket.status === 'used'
                                  ? 'secondary'
                                  : 'destructive'
                          }
                        >
                          {title(ticket.status)}
                        </Badge>
                      </div>
                      <div className="grid gap-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Event Time
                          </span>
                          {ticket.event?.startTime && (
                            <span>
                              {new Date(
                                ticket.event.startTime
                              ).toLocaleString()}
                            </span>
                          )}
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Doors Open
                          </span>
                          {ticket.event?.doorsOpen && (
                            <span>
                              {new Date(
                                ticket.event.doorsOpen
                              ).toLocaleString()}
                            </span>
                          )}
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Ticket Price
                          </span>
                          <span>${ticket.ticketType.price}</span>
                        </div>
                        {ticket.ownerName && (
                          <>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">
                                Ticket Owner
                              </span>
                              <span>{ticket.ownerName}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">
                                Owner Email
                              </span>
                              <span>{ticket.ownerEmail}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">
                                Owner Phone
                              </span>
                              <span>{ticket.ownerPhone}</span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
