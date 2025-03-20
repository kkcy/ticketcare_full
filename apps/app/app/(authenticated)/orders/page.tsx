import { auth } from '@repo/auth/server';
import {} from '@repo/design-system/components/ui/breadcrumb';
import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { Header } from '../components/header';
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
      <Header page="Orders" />

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
