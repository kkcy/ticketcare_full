import { auth } from '@repo/auth/server'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPremiumTier } from '../actions'
import { Header } from '@/app/(authenticated)/components/header'
import { Info, TicketIcon, DollarSignIcon } from '@repo/design-system/components/icons'
import { PremiumTierDelete } from '../components/PremiumTierDelete'
import { PremiumTierStatus } from '../components/PremiumTierStatus'
import { PremiumTierDialog } from '../components/PremiumTierDialog'

type PageProps = {
  readonly params: Promise<{
    id: string
  }>
}

export default async function PremiumTierDetailPage({ params }: PageProps) {
  const session = await auth.api.getSession({
    headers: await headers()
  })

  // Check if user is a super admin
  if (!session?.user?.role || session.user.role !== 'super-admin') {
    redirect('/')
  }

  const tier = await getPremiumTier((await params).id)

  return (
    <>
      <Header pages={['Premium Tiers']} page={tier.name} />

      <main className="flex-1 space-y-4 p-4 pt-6 md:p-8">
        <div className="flex items-center justify-between space-x-2">
          <div className="flex items-center justify-start space-x-2">
            <h2 className="font-bold text-3xl tracking-tight">{tier.name}</h2>
          </div>
          <div className="flex items-center gap-2">
            <PremiumTierDelete premiumTier={tier} />
            <PremiumTierStatus premiumTier={tier} />
            <PremiumTierDialog mode="edit" premiumTier={tier} />
          </div>
        </div>

        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border p-4">
              <div className="flex items-center gap-2">
                <Info className="h-4 w-4 text-muted-foreground" />
                <h3 className="font-semibold">Details</h3>
              </div>
              <p className="mt-2 text-muted-foreground text-sm">{tier.description}</p>
            </div>
            <div className="rounded-lg border p-4">
              <div className="flex items-center gap-2">
                <DollarSignIcon className="h-4 w-4 text-muted-foreground" />
                <h3 className="font-semibold">Price</h3>
              </div>
              <p className="mt-2 text-muted-foreground text-sm">{tier.price}</p>
            </div>
            <div className="rounded-lg border p-4">
              <div className="flex items-center gap-2">
                <TicketIcon className="h-4 w-4 text-muted-foreground" />
                <h3 className="font-semibold">Ticket Capacity</h3>
              </div>
              <p className="mt-2 text-muted-foreground text-sm">
                {tier.maxTicketsPerEvent} tickets
              </p>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
