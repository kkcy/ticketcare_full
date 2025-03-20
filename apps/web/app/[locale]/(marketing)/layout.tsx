import { Toolbar as CMSToolbar } from '@repo/cms/components/toolbar';
import { Toolbar } from '@repo/feature-flags/components/toolbar';
import { getDictionary } from '@repo/internationalization';
import type { ReactNode } from 'react';
import { Footer } from './components/footer';
import { Header } from './components/header';

type RootLayoutProperties = {
  readonly children: ReactNode;
  readonly params: Promise<{
    locale: string;
  }>;
};

const MarketingLayout = async ({ children, params }: RootLayoutProperties) => {
  const { locale } = await params;
  const dictionary = await getDictionary(locale);

  return (
    <>
      <Header dictionary={dictionary} />
      {children}
      <Footer />
      <Toolbar />
      <CMSToolbar />
    </>
  );
};

export default MarketingLayout;
