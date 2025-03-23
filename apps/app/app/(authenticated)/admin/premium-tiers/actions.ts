'use server';

import { auth } from '@repo/auth/server';
import {
  type PrismaNamespace,
  database,
  serializePrisma,
} from '@repo/database';
import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';

// Get all premium tiers
export async function adminGetPremiumTiers() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.role || session.user.role !== 'super-admin') {
    throw new Error('Unauthorized: Only super admins can manage premium tiers');
  }

  const tiers = await database.premiumTier.findMany({
    orderBy: {
      price: 'asc',
    },
  });

  return serializePrisma(tiers);
}

// Create a new premium tier
export async function createPremiumTier(
  values: PrismaNamespace.PremiumTierUncheckedCreateInput
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.role || session.user.role !== 'super-admin') {
    throw new Error('Unauthorized: Only super admins can manage premium tiers');
  }

  await database.premiumTier.create({
    data: values,
  });

  revalidatePath('/admin/premium-tiers');

  return {
    success: true,
  };
}

// Update an existing premium tier
export async function updatePremiumTier(
  id: string,
  values: PrismaNamespace.PremiumTierUncheckedUpdateInput
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.role || session.user.role !== 'super-admin') {
    throw new Error('Unauthorized: Only super admins can manage premium tiers');
  }

  await database.premiumTier.update({
    where: { id },
    data: values,
  });

  revalidatePath('/admin/premium-tiers');
  revalidatePath(`/admin/premium-tiers/${id}`);

  return {
    success: true,
  };
}

// Delete a premium tier
export async function deletePremiumTier(id: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.role || session.user.role !== 'super-admin') {
    throw new Error('Unauthorized: Only super admins can manage premium tiers');
  }

  // Check if any events are using this tier
  const eventsUsingTier = await database.event.count({
    where: {
      premiumTierId: id,
    },
  });

  if (eventsUsingTier > 0) {
    throw new Error(
      `Cannot delete tier: ${eventsUsingTier} events are using this tier`
    );
  }

  await database.premiumTier.delete({
    where: { id },
  });

  revalidatePath('/admin/premium-tiers');
  revalidatePath(`/admin/premium-tiers/${id}`);

  return {
    success: true,
  };
}

// Get a specific premium tier by ID
export async function getPremiumTier(id: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.role || session.user.role !== 'super-admin') {
    throw new Error('Unauthorized: Only super admins can manage premium tiers');
  }

  const tier = await database.premiumTier.findUnique({
    where: { id },
  });

  if (!tier) {
    throw new Error('Premium tier not found');
  }

  return serializePrisma(tier);
}
