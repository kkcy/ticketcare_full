'use client';

import { useIsDesktop } from '@/app/hooks/useIsDesktop';
import type { SerializedEvent, SerializedPremiumTier } from '@/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { StarIcon, TicketsIcon } from '@repo/design-system/components/icons';
import { Badge } from '@repo/design-system/components/ui/badge';
import { Button } from '@repo/design-system/components/ui/button';
import { Card, CardContent } from '@repo/design-system/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@repo/design-system/components/ui/dialog';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@repo/design-system/components/ui/drawer';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  useForm,
} from '@repo/design-system/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/design-system/components/ui/select';
import { Separator } from '@repo/design-system/components/ui/separator';
import { toast } from '@repo/design-system/components/ui/sonner';
import { useRouter } from 'next/navigation';
import * as React from 'react';
import * as z from 'zod';
import { getPremiumTiers, initiateEventPremiumUpgrade } from '../actions';

// Form schema for premium tier selection
const formSchema = z.object({
  premiumTierId: z.string({
    required_error: 'Please select a premium tier',
  }),
});

interface EventUpgradeDialogProps {
  event: SerializedEvent;
}

export function EventUpgradeDialog({ event }: EventUpgradeDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [tiers, setTiers] = React.useState<SerializedPremiumTier[]>([]);
  const isDesktop = useIsDesktop();
  const router = useRouter();

  // Initialize form with react-hook-form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      premiumTierId: event.premiumTierId || '',
    },
  });

  // Fetch premium tiers when dialog opens
  React.useEffect(() => {
    if (open) {
      const fetchTiers = async () => {
        try {
          const tiersData = await getPremiumTiers();
          setTiers(tiersData);
        } catch (error) {
          console.error('Failed to fetch premium tiers:', error);
          toast.error('Failed to load premium tiers');
        }
      };

      fetchTiers();
    }
  }, [open]);

  const tierSelected = form.watch('premiumTierId');

  // Handle form submission
  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    try {
      // Get the selected tier to show price information
      const selectedTier = tiers.find(
        (tier) => tier.id === values.premiumTierId
      );

      // Call the initiate event premium upgrade action which will handle payment if needed
      // Use Chip payment gateway by default
      const result = await initiateEventPremiumUpgrade(
        event.id,
        event.slug,
        values.premiumTierId,
        'chip'
      );

      // If there's a redirect URL, it means payment is required
      if (result.redirectUrl) {
        // Show toast before redirecting
        toast.info(
          `Redirecting to Chip-In payment for ${selectedTier?.name} tier (RM${selectedTier?.price})`
        );
        // Redirect to the payment gateway
        window.location.href = result.redirectUrl;
        return;
      }

      // If no redirect, the upgrade was successful without payment
      toast.success('Event upgraded successfully');
      setOpen(false);
      router.refresh();
    } catch (error) {
      console.error('Failed to upgrade event:', error);
      toast.error(
        error instanceof Error ? error.message : 'Failed to upgrade event'
      );
    } finally {
      setLoading(false);
    }
  }

  // Determine button text based on event premium status
  const buttonText = event.isPremiumEvent
    ? 'Change Premium Tier'
    : 'Upgrade to Premium';

  // Determine dialog title based on event premium status
  const dialogTitle = event.isPremiumEvent
    ? 'Change Premium Tier'
    : 'Upgrade to Premium Event';

  // Determine dialog description based on event premium status
  const dialogDescription = event.isPremiumEvent
    ? 'Select a different premium tier for your event. You may be charged for the upgrade.'
    : 'Upgrade your event to premium to increase ticket sales capacity. You will be redirected to a payment page to complete the upgrade.';

  const content = (
    <div className="space-y-4">
      {event.isPremiumEvent && (
        <Card className="bg-purple-50 py-2">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <StarIcon className="h-5 w-5 text-purple-600" />
              <div>
                <p className="font-medium text-purple-800 text-sm">
                  Current Premium Tier:{' '}
                  {event.premiumTier ? event.premiumTier.name : 'Custom'}
                </p>
                <p className="text-purple-700 text-xs">
                  <TicketsIcon className="mr-1 inline-block h-3 w-3" />
                  Max tickets: {event.maxTicketsPerEvent}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="premiumTierId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Premium Tier</FormLabel>
                <FormControl>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a premium tier" />
                    </SelectTrigger>
                    <SelectContent>
                      {tiers.map((tier) => (
                        <SelectItem key={tier.id} value={tier.id}>
                          <div className="flex w-full items-center justify-between">
                            <span>{tier.name}</span>
                            <Badge variant="outline" className="ml-2">
                              {tier.maxTicketsPerEvent} tickets
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {isDesktop ? (
            <DialogFooter>
              <Button type="submit" disabled={!tierSelected || loading}>
                {loading ? 'Processing...' : 'Continue to Chip-In Payment'}
              </Button>
            </DialogFooter>
          ) : (
            <div className="flex flex-col gap-2">
              <Button
                type="submit"
                disabled={!tierSelected || loading}
                className="w-full"
              >
                {loading ? 'Processing...' : 'Continue to Chip-In Payment'}
              </Button>
              <DrawerClose asChild>
                <Button variant="outline" className="w-full">
                  Cancel
                </Button>
              </DrawerClose>
            </div>
          )}
        </form>
      </Form>

      <Separator />

      <div className="space-y-2">
        <h4 className="font-medium text-sm">Premium Benefits</h4>
        <ul className="space-y-1 text-sm">
          <li className="flex items-center gap-2">
            <TicketsIcon className="h-4 w-4 text-amber-600" />
            Increased ticket sales capacity
          </li>
          <li className="flex items-center gap-2">
            <StarIcon className="h-4 w-4 text-amber-600" />
            Premium badge on your event
          </li>
        </ul>

        {/* Show pricing information */}
        {tiers.length > 0 && (
          <div className="mt-4 border-t pt-2">
            <h4 className="mb-1 font-medium text-sm">Pricing</h4>
            <ul className="space-y-1 text-sm">
              {tiers.map((tier) => (
                <li key={tier.id} className="flex items-center justify-between">
                  <span>{tier.name}</span>
                  <span className="font-medium">${tier.price}</span>
                </li>
              ))}
            </ul>
            <p className="mt-1 text-muted-foreground text-xs">
              You will be redirected to Chip-In Asia secure payment gateway
              after selecting a tier.
            </p>
          </div>
        )}
      </div>
    </div>
  );

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="premium" size="sm" className="gap-1">
            <StarIcon className="h-4 w-4" />
            {buttonText}
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{dialogTitle}</DialogTitle>
            <DialogDescription>{dialogDescription}</DialogDescription>
          </DialogHeader>
          {content}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button variant="premium" size="sm" className="gap-1">
          <StarIcon className="h-4 w-4" />
          {buttonText}
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{dialogTitle}</DrawerTitle>
          <DrawerDescription>{dialogDescription}</DrawerDescription>
        </DrawerHeader>
        <div className="px-4">{content}</div>
        <DrawerFooter className="pt-2">
          <DrawerClose asChild>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
