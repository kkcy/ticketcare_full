import type { Metadata } from 'next';
import { Header } from './components/header';

const title = 'TicketCare';
const description = 'Your Ultimate Event Ticketing Solution';

export const metadata: Metadata = {
  title,
  description,
};

const App = () => {
  return (
    <>
      <Header page="Dashboard" />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0" />
    </>
  );
};

export default App;
