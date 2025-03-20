import { auth } from '@repo/auth/server';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from '@repo/design-system/components/ui/breadcrumb';
import { Separator } from '@repo/design-system/components/ui/separator';
import { SidebarTrigger } from '@repo/design-system/components/ui/sidebar';
import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { getOrders } from './actions';
import { columns } from './components/OrderColumns';
import { OrderDialog } from './components/OrderDialog';
import { OrderTable } from './components/OrderTable';

const title = 'TicketCare - Orders';
const description = 'TicketCare - Orders';

export const metadata: Metadata = {
  title,
  description,
};

const OrdersPage = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user || !session?.session.organizerId) {
    redirect('/');
  }

  const orders = await getOrders();

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbPage>Orders</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div>
          <div className="flex items-center justify-end">
            <OrderDialog />
          </div>
        </div>
        <div className="min-h-[100vh] flex-1 rounded-xl md:min-h-min">
          <OrderTable
            organizerId={session.session.organizerId}
            columns={columns}
            initialData={orders}
          />
        </div>
      </div>
    </>
  );
};

export default OrdersPage;
