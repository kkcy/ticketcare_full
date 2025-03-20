'use client';
import { signOut, useActiveOrganization } from '@repo/auth/client';
import { OrganizationSwitcher } from '@repo/auth/components/organization-switcher';
import { UserButton } from '@repo/auth/components/user-button';
import type { User } from '@repo/database';
import { ModeToggle } from '@repo/design-system/components/mode-toggle';
import { Collapsible } from '@repo/design-system/components/ui/collapsible';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@repo/design-system/components/ui/sidebar';
import { cn } from '@repo/design-system/lib/utils';
import {
  AnchorIcon,
  CalendarIcon,
  LifeBuoyIcon,
  SendIcon,
  Settings2Icon,
  ShoppingBagIcon,
  UsersRoundIcon,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { ReactNode } from 'react';
import { Search } from './search';

type GlobalSidebarProperties = {
  user?: User;
  activeOrganizationId?: string;
  activeOrganizationName?: string;
  readonly children: ReactNode;
};

const data = {
  user: {
    name: 'shadcn',
    email: 'm@example.com',
    avatar: '/avatars/shadcn.jpg',
  },
  navMain: [
    {
      title: 'Events',
      url: '/events',
      icon: CalendarIcon,
      isActive: true,
    },
    {
      title: 'Orders',
      url: '/orders',
      icon: ShoppingBagIcon,
    },
    {
      title: 'Users',
      url: '/users',
      icon: UsersRoundIcon,
    },
    {
      title: 'Settings',
      url: '/settings',
      icon: Settings2Icon,
    },
  ],
  navSecondary: [
    {
      title: 'Webhooks',
      url: '/webhooks',
      icon: AnchorIcon,
    },
    {
      title: 'Support',
      url: '#',
      icon: LifeBuoyIcon,
    },
    {
      title: 'Feedback',
      url: '#',
      icon: SendIcon,
    },
  ],
};

export const GlobalSidebar = ({
  user,
  activeOrganizationName,
  children,
}: GlobalSidebarProperties) => {
  const sidebar = useSidebar();
  const { data: organization } = useActiveOrganization();
  const router = useRouter();

  return (
    <>
      <Sidebar variant="inset">
        <SidebarHeader>
          {activeOrganizationName && (
            <SidebarMenu>
              <SidebarMenuItem>
                <div
                  className={cn(
                    'h-[36px] overflow-hidden transition-all [&>div]:w-full',
                    sidebar.open ? '' : '-mx-1'
                  )}
                >
                  <OrganizationSwitcher
                    activeOrganization={
                      organization || {
                        name: activeOrganizationName,
                      }
                    }
                  />
                </div>
              </SidebarMenuItem>
            </SidebarMenu>
          )}
        </SidebarHeader>
        <Search />
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Platform</SidebarGroupLabel>
            <SidebarMenu>
              {data.navMain.map((item) => (
                <Collapsible
                  key={item.title}
                  asChild
                  defaultOpen={item.isActive}
                >
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild tooltip={item.title}>
                      <Link href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </Collapsible>
              ))}
            </SidebarMenu>
          </SidebarGroup>
          <SidebarGroup className="mt-auto">
            <SidebarGroupContent>
              <SidebarMenu>
                {data.navSecondary.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <Link href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem className="flex items-center gap-2">
              <UserButton
                user={user}
                showName
                onSignOut={() => {
                  signOut({
                    fetchOptions: {
                      onSuccess: () => {
                        router.push('/sign-in');
                      },
                    },
                  });
                }}
                className="flex-1"
              />
              <div className="flex shrink-0 items-center gap-px">
                <ModeToggle />
                {/* <Button
                  variant="ghost"
                  size="icon"
                  className="shrink-0"
                  asChild
                >
                  <div className="h-4 w-4">
                    <NotificationsTrigger />
                  </div>
                </Button> */}
              </div>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>{children}</SidebarInset>
    </>
  );
};
