'use client'

import type { SerializedPremiumTier } from '@/types'

import { useRouter } from 'next/navigation'

import type { PrismaNamespace } from '@repo/database'
import { Button } from '@repo/design-system/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  useForm
} from '@repo/design-system/components/ui/form'
import { Input } from '@repo/design-system/components/ui/input'
import { Switch } from '@repo/design-system/components/ui/switch'
import { toast } from '@repo/design-system/components/ui/sonner'
import { Textarea } from '@repo/design-system/components/ui/textarea'

import { createPremiumTier, updatePremiumTier } from './actions'

interface PremiumTierFormProps {
  setOpen?: (open: boolean) => void
  mode?: 'create' | 'edit'
  premiumTier?: SerializedPremiumTier
}

export function PremiumTierForm({ setOpen, mode = 'create', premiumTier }: PremiumTierFormProps) {
  const router = useRouter()

  const form = useForm<PrismaNamespace.PremiumTierUncheckedCreateInput>({
    defaultValues: premiumTier
      ? {
          name: premiumTier.name,
          description: premiumTier.description || '',
          maxTicketsPerEvent: premiumTier.maxTicketsPerEvent,
          price: premiumTier.price,
          isActive: premiumTier.isActive
        }
      : {
          name: '',
          description: '',
          maxTicketsPerEvent: 100,
          price: 0,
          isActive: false
        }
  })

  async function onSubmit(values: PrismaNamespace.PremiumTierUncheckedCreateInput) {
    try {
      if (mode === 'edit' && premiumTier?.id) {
        await updatePremiumTier(premiumTier.id, values)
        toast.success('Premium tier updated successfully')
      } else {
        await createPremiumTier(values)
        toast.success('Premium tier created successfully')
      }

      setOpen?.(false)
      router.refresh()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Something went wrong'

      toast.error(errorMessage)
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="mx-auto w-full max-w-3xl space-y-4 px-4 md:px-0"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Premium Tier Name" {...field} />
              </FormControl>
              <FormDescription>E.g., "Basic", "Standard", "Pro"</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Premium Tier Description"
                  className="resize-none"
                  {...field}
                  // Convert null to empty string
                  value={field.value ?? ''}
                />
              </FormControl>
              <FormDescription>Describe what this tier offers</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="maxTicketsPerEvent"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Maximum Tickets Per Event</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={1}
                    max={10000}
                    {...field}
                    onChange={(e) => field.onChange(Number.parseInt(e.target.value) || 100)}
                    value={field.value}
                  />
                </FormControl>
                <FormDescription>Maximum number of tickets that can be sold</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={0}
                    step="0.01"
                    {...field}
                    onChange={(e) => field.onChange(Number.parseFloat(e.target.value) || 0)}
                    value={field.value}
                  />
                </FormControl>
                <FormDescription>Cost of this premium tier in dollars</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Active Status</FormLabel>
                <FormDescription>
                  Only active premium tiers will be available for selection
                </FormDescription>
              </div>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />

        <Button disabled={form.formState.isSubmitting} type="submit" className="max-md:w-full">
          {mode === 'create' ? 'Create Premium Tier' : 'Update Premium Tier'}
        </Button>
      </form>
    </Form>
  )
}
