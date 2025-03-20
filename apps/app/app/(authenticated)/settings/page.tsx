import {} from '@repo/design-system/components/ui/breadcrumb';
import type { Metadata } from 'next';
import type { ReactElement } from 'react';
import { Header } from '../components/header';

const title = 'TicketCare - Settings';
const description = 'TicketCare - Settings';

export const metadata: Metadata = {
  title,
  description,
};

const SettingsPage = (): ReactElement => {
  return (
    <>
      <Header page="Settings" />
    </>
  );
};

export default SettingsPage;
