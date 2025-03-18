import { createAccessControl } from 'better-auth/plugins/access';
import {
  adminAc,
  defaultStatements as adminDefaultStatements,
} from 'better-auth/plugins/admin/access';
import { defaultStatements as orgDefaultStatements } from 'better-auth/plugins/organization/access';

const statement = {
  ...adminDefaultStatements, // user, session
  ...orgDefaultStatements, // organization
  event: ['create', 'read', 'update', 'delete', 'approve'],
  venue: ['create', 'read', 'update', 'delete'],
  ticket: ['create', 'read', 'update', 'delete', 'sell'],
  inventory: ['create', 'read', 'update', 'delete'],
  order: ['create', 'read', 'update', 'delete'],
  organizer: ['create', 'read', 'update', 'delete'],
} as const;

export const ac = createAccessControl(statement);

// Admin role - has full access to everything
export const superAdminRole = ac.newRole({
  ...adminAc.statements,
  organization: ['update', 'delete'],
  member: ['create', 'update', 'delete'], // Can manage all members
  invitation: ['create', 'cancel'], // Can invite to any org
  team: ['create', 'update', 'delete'], // Full team control
  // ---
  event: ['create', 'read', 'update', 'delete', 'approve'],
  venue: ['create', 'read', 'update', 'delete'],
  ticket: ['create', 'read', 'update', 'delete', 'sell'],
  inventory: ['create', 'read', 'update', 'delete'],
  order: ['create', 'read', 'update', 'delete'],
  organizer: ['create', 'read', 'update', 'delete'],
});

export const adminRole = ac.newRole({
  event: ['create', 'read', 'update', 'delete'], // Full event control in their org
  ticket: ['create', 'read'], // Manage tickets in their org
});

// Customer role - can read events, venues, tickets and manage their own orders
export const customerRole = ac.newRole({
  event: ['read'],
  venue: ['read'],
  ticket: ['read'],
  order: ['create', 'read'],
});

// Organization-specific roles (OrganizationMember.role)
export const ownerRole = ac.newRole({
  organization: ['update', 'delete'], // Manage their org
  member: ['create', 'update', 'delete'], // Manage org members
  invitation: ['create', 'cancel'], // Invite to their org
  event: ['create', 'read', 'update', 'delete'], // Full event control in org
  ticket: ['create', 'read'], // Manage tickets in org
});

// Organizer role - can manage their own events, venues, tickets, and inventory
export const organizerRole = ac.newRole({
  event: ['create', 'read', 'update'],
  venue: ['create', 'read', 'update'],
  ticket: ['create', 'read', 'update', 'sell'],
  inventory: ['create', 'read', 'update'],
  order: ['read'],
});
