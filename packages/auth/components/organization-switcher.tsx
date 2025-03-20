'use client';
import type { Organization } from '@repo/database';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@repo/design-system/components/ui/avatar';
import {} from '@repo/design-system/components/ui/dropdown-menu';
import { cn } from '@repo/design-system/lib/utils';

// export const OrganizationSwitcher = ({ className = '' }) => {
//   const { data: organizations } = authClient.useListOrganizations();
//   const { data: activeOrganization } = authClient.useActiveOrganization();

//   const handleOrganizationSelect = (org: string) => {
//     authClient.organization.setActive({
//       organizationSlug: org,
//     });
//   };

//   return (
//     <DropdownMenu>
//       <DropdownMenuTrigger asChild>
//         <Button
//           variant="outline"
//           className={cn(
//             'flex w-full items-center justify-between gap-2',
//             className
//           )}
//         >
//           <div className="flex items-center gap-2">
//             <Avatar className="h-5 w-5">
//               {activeOrganization?.logo && (
//                 <AvatarImage
//                   src={activeOrganization.logo}
//                   alt={activeOrganization?.name || ''}
//                 />
//               )}
//               <AvatarFallback className="bg-primary text-primary-foreground text-xs">
//                 {activeOrganization?.name?.charAt(0) || '?'}
//               </AvatarFallback>
//             </Avatar>
//             <span className="truncate">
//               {activeOrganization?.name || 'Select organization'}
//             </span>
//           </div>
//           <ChevronDownIcon className="h-4 w-4 opacity-50" />
//         </Button>
//       </DropdownMenuTrigger>
//       <DropdownMenuContent className="w-[200px]" align="start">
//         <DropdownMenuLabel>Organizations</DropdownMenuLabel>
//         <DropdownMenuGroup>
//           {organizations?.map((org) => (
//             <DropdownMenuItem
//               key={org.id}
//               onClick={() => {
//                 if (org.slug) {
//                   handleOrganizationSelect(org.slug);
//                 }
//               }}
//               className={cn(
//                 'cursor-pointer',
//                 org.id === activeOrganization?.id && 'bg-accent'
//               )}
//             >
//               <Avatar className="mr-2 h-5 w-5">
//                 {org.logo && <AvatarImage src={org.logo} alt={org.name} />}
//                 <AvatarFallback className="bg-primary text-primary-foreground text-xs">
//                   {org.name.charAt(0)}
//                 </AvatarFallback>
//               </Avatar>
//               <span>{org.name}</span>
//             </DropdownMenuItem>
//           ))}
//         </DropdownMenuGroup>
//         <DropdownMenuSeparator />
//         {/* <DropdownMenuItem
//           className="cursor-pointer"
//           onClick={() => {
//             // Here you would implement your create organization functionality
//             console.log('Create organization clicked');
//           }}
//         >
//           <PlusIcon className="mr-2 h-4 w-4" />
//           <span>Create organization</span>
//         </DropdownMenuItem> */}
//       </DropdownMenuContent>
//     </DropdownMenu>
//   );
// };

export const OrganizationSwitcher = ({
  activeOrganization,
  className = '',
}: {
  activeOrganization: Organization;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        'flex h-full w-full items-center justify-between gap-2 px-2',
        className
      )}
    >
      <div className="flex items-center gap-2">
        <Avatar className="h-5 w-5">
          {activeOrganization?.logo && (
            <AvatarImage
              src={activeOrganization.logo}
              alt={activeOrganization?.name || ''}
            />
          )}
          <AvatarFallback className="bg-primary text-primary-foreground text-xs">
            {activeOrganization?.name?.charAt(0) || '?'}
          </AvatarFallback>
        </Avatar>
        <span className="truncate">
          {activeOrganization?.name || 'Select organization'}
        </span>
      </div>
    </div>
  );
};
