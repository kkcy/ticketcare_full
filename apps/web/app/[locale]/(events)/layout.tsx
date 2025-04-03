import type { ReactNode } from 'react';
import { Header } from './components/header';

type EventLayoutProperties = {
  readonly children: ReactNode;
};

const EventLayout = ({ children }: EventLayoutProperties) => (
  <>
    <Header />
    <main className="mx-auto my-16 flex max-w-4xl flex-col">{children}</main>
  </>
);

export default EventLayout;
