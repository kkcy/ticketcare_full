import { auth } from '@repo/auth/server';
import { database, serializePrisma } from '@repo/database';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@repo/design-system/components/ui/breadcrumb';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@repo/design-system/components/ui/card';
import { Separator } from '@repo/design-system/components/ui/separator';
import { SidebarTrigger } from '@repo/design-system/components/ui/sidebar';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@repo/design-system/components/ui/tabs';
import type { Metadata } from 'next';
import { headers } from 'next/headers';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { ReactElement } from 'react';

type PageProps = {
  readonly params: Promise<{
    id: string;
  }>;
};

async function getUser(id: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user || !session?.session.organizerId) {
    return notFound();
  }

  const user = await database.user.findUnique({
    where: {
      id,
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      dob: true,
      role: true,
      orders: {
        where: {
          tickets: {
            some: {
              event: {
                organizerId: session.session.organizerId,
              },
            },
          },
        },
        include: {
          tickets: {
            include: {
              event: true,
              ticketType: true,
            },
          },
        },
      },
    },
  });

  if (!user) {
    notFound();
  }

  return serializePrisma(user);
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const user = await getUser(id);

  const title = 'TicketCare - User';
  const description = `Details for ${user.firstName} ${user.lastName}`;

  return {
    title,
    description,
  };
}

export default async function UserDetailPage({
  params,
}: PageProps): Promise<ReactElement> {
  const { id } = await params;
  const user = await getUser(id);

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/users">User</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{user.id}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <main className="flex-1 space-y-4 p-4 pt-6 lg:p-8">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="font-bold text-3xl tracking-tight">{`${user.firstName} ${user.lastName}`}</h2>
        </div>
        <Tabs defaultValue="summary">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="summary">Summary</TabsTrigger>
              <TabsTrigger value="orders">Orders</TabsTrigger>
            </TabsList>
            <div className="flex items-center gap-2" />
          </div>
          <TabsContent value="summary" className="mt-6">
            <div className="grid gap-4 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Name</span>
                    <span>{`${user.firstName} ${user.lastName}`}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Email</span>
                    <span>{user.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Phone</span>
                    <span>{user.phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Date of Birth</span>
                    <span>
                      {user.dob
                        ? new Date(user.dob).toLocaleDateString()
                        : 'N/A'}
                    </span>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Account Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Account Type</span>
                    <span className="capitalize">{user.role}</span>
                  </div>
                </CardContent>
              </Card>
              {/* <Card>
                <CardHeader>
                  <CardTitle>Notifications</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Email Notifications
                    </span>
                    <span>
                      {user.emailNotifications ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      SMS Notifications
                    </span>
                    <span>
                      {user.smsNotifications ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Push Notifications
                    </span>
                    <span>
                      {user.pushNotifications ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                </CardContent>
              </Card> */}
            </div>
          </TabsContent>
          <TabsContent value="orders" className="mt-6">
            {user.orders.length > 0 ? (
              <div className="space-y-4">
                {user.orders.map((order) => (
                  <Link
                    key={order.id}
                    className="block cursor-pointer rounded-lg border p-4 hover:bg-muted"
                    href={`/orders/${order.id}`}
                  >
                    <div className="mb-2 flex justify-between">
                      <span className="font-medium">Order #{order.id}</span>
                      <span className="text-muted-foreground">
                        {new Date(order.orderedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="space-y-2">
                      {order.tickets.map((ticket) => (
                        <div
                          key={ticket.id}
                          className="flex justify-between text-sm"
                        >
                          <span>
                            {ticket.event?.title} - {ticket.ticketType?.name}
                          </span>
                          <span>${ticket.ticketType?.price}</span>
                        </div>
                      ))}
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-muted-foreground">
                No orders found
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </>
  );
}
