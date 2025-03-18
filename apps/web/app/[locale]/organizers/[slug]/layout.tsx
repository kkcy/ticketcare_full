import type { ReactNode } from 'react';

type OrganizerLayoutProperties = {
  readonly children: ReactNode;
};

const OrganizerLayout = ({ children }: OrganizerLayoutProperties) => (
  <main className="mx-auto my-16 flex max-w-4xl flex-col">{children}</main>
);

export default OrganizerLayout;
