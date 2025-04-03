'use client';

import { isExpired } from '@/app/[locale]/(events)/lib/utils';
import type { SerializedEvent } from '@/app/types';
import { Button } from '@repo/design-system/components/ui/button';
import { useFormContext } from '@repo/design-system/components/ui/form';
import { ArrowRight, Heart, Share2 } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { TicketFormValues } from './event-pricing';

interface EventFooterProps {
  event: SerializedEvent;
}

export function EventFooter({ event }: EventFooterProps) {
  const { formState, handleSubmit } = useFormContext<TicketFormValues>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentTab = (searchParams.get('tab') as string) || 'about';

  const handleBuyTicket = () => {
    if (currentTab !== 'pricing') {
      const url = new URL(window.location.href);
      url.searchParams.set('tab', 'pricing');

      // Use replace instead of push to avoid scroll reset
      // and add the scroll=false option to prevent scrolling
      router.replace(url.toString(), { scroll: false });
    } else {
      handleSubmit(() => {
        console.log('submit');
      })();
    }
  };

  return (
    <div className="fixed right-0 bottom-0 left-0 z-50 border-t bg-background px-6 py-4">
      <div className="mx-auto flex max-w-4xl items-center justify-between">
        <div className="item-center flex space-x-4">
          <Button size="icon" variant="ghost">
            <Share2 />
          </Button>
          <Button size="icon" variant="ghost">
            <Heart />
          </Button>
        </div>
        <div className="flex items-center gap-4">
          {!isExpired(event) && (
            <Button
              size="lg"
              onClick={handleBuyTicket}
              disabled={
                (currentTab === 'pricing' && !formState.isValid) ||
                formState.isLoading ||
                formState.isSubmitting
              }
            >
              {formState.isLoading || formState.isSubmitting
                ? 'Processing...'
                : 'Buy Ticket'}
              <ArrowRight size={20} />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
