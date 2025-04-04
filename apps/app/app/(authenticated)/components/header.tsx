import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@repo/design-system/components/ui/breadcrumb';
import { Separator } from '@repo/design-system/components/ui/separator';
import { SidebarTrigger } from '@repo/design-system/components/ui/sidebar';
import { dash, isEmpty } from 'radash';
import { Fragment, type ReactNode } from 'react';

type HeaderProps = {
  pages?: string[];
  page: string;
  children?: ReactNode;
};

export const Header = ({ pages, page, children }: HeaderProps) => (
  <header className="flex h-16 shrink-0 items-center justify-between gap-2">
    <div className="flex items-center gap-2 px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 h-4" />
      <Breadcrumb>
        <BreadcrumbList>
          {pages?.map((page, index) => (
            <Fragment key={page}>
              {index > 0 && <BreadcrumbSeparator className="hidden md:block" />}
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href={`/${dash(page.toLowerCase())}`}>
                  {page}
                </BreadcrumbLink>
              </BreadcrumbItem>
            </Fragment>
          ))}
          {!isEmpty(pages) && (
            <BreadcrumbSeparator className="hidden md:block" />
          )}
          <BreadcrumbItem>
            <BreadcrumbPage>{page}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    </div>
    {children}
  </header>
);
