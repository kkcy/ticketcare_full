import type { SerializedPremiumTier } from '@/types'
import { DollarSignIcon, TicketsIcon } from '@repo/design-system/components/icons'
import { Badge } from '@repo/design-system/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@repo/design-system/components/ui/card'
import { Tooltip, TooltipContent, TooltipTrigger } from '@repo/design-system/components/ui/tooltip'
import Link from 'next/link'

export function PremiumTierCard({ tier }: { tier: SerializedPremiumTier }) {
  return (
    <Link href={`/admin/premium-tiers/${tier.id}`} className="block h-full">
      <Card className="flex h-full flex-col transition-shadow hover:shadow-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{tier.name}</CardTitle>
            <Badge variant={tier.isActive ? 'success' : 'pending'}>
              {tier.isActive ? 'Active' : 'Inactive'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="flex-grow space-y-1 text-sm">
          <Tooltip>
            <TooltipTrigger className="flex items-center">
              <DollarSignIcon className="mr-2 h-4 w-4" />${tier.price.toString()}
            </TooltipTrigger>
            <TooltipContent>
              <p>Price</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger className="flex items-center">
              <TicketsIcon className="mr-2 h-4 w-4" />
              {tier.maxTicketsPerEvent}
            </TooltipTrigger>
            <TooltipContent>
              <p>Max tickets per event</p>
            </TooltipContent>
          </Tooltip>
        </CardContent>
        <CardFooter>
          <CardDescription>{tier.description}</CardDescription>
        </CardFooter>
      </Card>
    </Link>
  )
}
