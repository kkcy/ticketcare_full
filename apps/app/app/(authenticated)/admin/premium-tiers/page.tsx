import { auth } from '@repo/auth/server'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { Header } from '../../components/header'
import { getPremiumTiers } from './actions'
import { PremiumTierCard } from './components/PremiumTierCard'
import { PremiumTierDialog } from './components/PremiumTierDialog'

export default async function PremiumTiersPage() {
  const session = await auth.api.getSession({
    headers: await headers()
  })

  // Check if user is a super admin
  if (!session?.user?.role || session.user.role !== 'super-admin') {
    redirect('/')
  }

  const tiers = await getPremiumTiers()

  return (
    <>
      <Header page="Premium Tiers" />

      <div className="flex items-center justify-between gap-4 px-4">
        <div>
          <h1 className="font-bold text-3xl">Premium Event Tiers</h1>
          <p className="text-muted-foreground">
            Manage ticket capacity limits for different premium event tiers
          </p>
        </div>
        <PremiumTierDialog />
      </div>

      <div className="grid min-h-[100vh] flex-1 auto-rows-max gap-4 p-4 md:min-h-min lg:grid-cols-3">
        {tiers.map((tier) => (
          <PremiumTierCard key={tier.id} tier={tier} />
        ))}

        {tiers.length === 0 && (
          <div className="col-span-full flex h-40 items-center justify-center rounded-lg border border-dashed">
            <div className="text-center">
              <p className="text-muted-foreground">No premium tiers found</p>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
