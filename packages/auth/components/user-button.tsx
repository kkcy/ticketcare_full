'use client';

import { useSession } from '@repo/auth/client';
import type { User } from '@repo/database';
import {
  CogIcon,
  LogOutIcon,
  UserIcon,
} from '@repo/design-system/components/icons';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@repo/design-system/components/ui/avatar';
import { Button } from '@repo/design-system/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@repo/design-system/components/ui/dropdown-menu';
import { cn } from '@repo/design-system/lib/utils';

interface UserButtonProps {
  user?: User;
  onSignOut?: () => void;
  onProfileClick?: () => void;
  onAccountClick?: () => void;
  showName?: boolean;
  className?: string;
}

export const UserButton = ({
  user,
  onSignOut = () => {},
  onProfileClick = () => {},
  onAccountClick = () => {},
  showName = false,
  className = '',
}: UserButtonProps) => {
  const { data: session } = useSession();
  const sessionUser = session?.user as User | undefined;

  if (!user && !sessionUser) {
    return null;
  }

  // biome-ignore lint/style/noNonNullAssertion: <explanation>
  const currentUser = user || sessionUser!;

  const userInitials = currentUser.name
    ? `${currentUser.name.charAt(0)}`
    : currentUser?.email?.charAt(0).toUpperCase() || '?';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            'flex h-8 w-8 items-center justify-center rounded-full p-0',
            showName && 'w-auto px-2',
            className
          )}
        >
          <Avatar className="h-6 w-6">
            {currentUser.image && (
              <AvatarImage
                src={currentUser.image}
                alt={currentUser.name || currentUser.email || 'User'}
              />
            )}
            <AvatarFallback className="bg-primary text-primary-foreground">
              {userInitials}
            </AvatarFallback>
          </Avatar>

          {showName && (
            <span className="overflow-hidden text-ellipsis font-medium">
              {currentUser.name || currentUser.email}
            </span>
          )}
          <span className="sr-only">Open user menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" sideOffset={12} className="w-56">
        <div className="flex items-center gap-2 p-2">
          <Avatar className="h-10 w-10">
            {currentUser.image && (
              <AvatarImage
                src={currentUser.image}
                alt={currentUser.name || currentUser.email || 'User'}
              />
            )}
            <AvatarFallback className="bg-primary text-primary-foreground">
              {userInitials}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col space-y-0.5">
            {currentUser.name && (
              <p className="font-medium text-sm">{currentUser.name}</p>
            )}
            <p className="truncate text-muted-foreground text-xs">
              {currentUser.email}
            </p>
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem className="cursor-pointer" onClick={onProfileClick}>
            <UserIcon className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer" onClick={onAccountClick}>
            <CogIcon className="mr-2 h-4 w-4" />
            <span>Account settings</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="cursor-pointer" onClick={onSignOut}>
          <LogOutIcon className="mr-2 h-4 w-4" />
          <span>Sign out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
