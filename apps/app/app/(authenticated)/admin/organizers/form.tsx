'use client';

import type { SerializedOrganizer } from '@/types';

import { useRouter } from 'next/navigation';

import type { PrismaNamespace } from '@repo/database';
import { Button } from '@repo/design-system/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  useForm,
} from '@repo/design-system/components/ui/form';
import { Input } from '@repo/design-system/components/ui/input';
import { toast } from '@repo/design-system/components/ui/sonner';
import { Textarea } from '@repo/design-system/components/ui/textarea';
import { UserAutocomplete } from '../../components/UserAutocomplete';
import { createOrganizer, updateOrganizer } from './actions';

interface OrganizerFormProps {
  setOpen?: (open: boolean) => void;
  mode?: 'create' | 'edit';
  organizer?: SerializedOrganizer;
}

export function OrganizerForm({
  setOpen,
  mode = 'create',
  organizer,
}: OrganizerFormProps) {
  const router = useRouter();

  const form = useForm<PrismaNamespace.OrganizerUncheckedCreateInput>({
    defaultValues: organizer
      ? {
          name: organizer.name,
          slug: organizer.slug,
          description: organizer.description || '',
          logo: organizer.logo || '',
          website: organizer.website || '',
          email: organizer.email,
          phone: organizer.phone || '',
          address: organizer.address || '',
          verificationStatus: organizer.verificationStatus,
          payoutFrequency: organizer.payoutFrequency,
          commissionRate: organizer.commissionRate,
          emailNotifications: organizer.emailNotifications,
          smsNotifications: organizer.smsNotifications,
          pushNotifications: organizer.pushNotifications,
          userId: organizer.userId,
        }
      : {
          name: '',
          slug: '',
          description: '',
          email: '',
          verificationStatus: 'PENDING',
          payoutFrequency: 'MONTHLY',
          commissionRate: 10,
          emailNotifications: true,
          smsNotifications: false,
          pushNotifications: false,
        },
  });

  async function onSubmit(
    values: PrismaNamespace.OrganizerUncheckedCreateInput
  ) {
    try {
      if (mode === 'edit' && organizer?.id) {
        await updateOrganizer(organizer.id, values);
        toast.success('Organizer updated successfully');
      } else {
        await createOrganizer(values);
        toast.success('Organizer created successfully');
      }

      setOpen?.(false);
      router.refresh();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Something went wrong';

      toast.error(errorMessage);
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="mx-auto w-full max-w-3xl space-y-4 px-4 md:px-0"
      >
        {mode === 'create' && (
          <FormField
            control={form.control}
            name="userId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>User</FormLabel>
                <FormControl>
                  <UserAutocomplete
                    value={field.value ?? ''}
                    onChange={field.onChange}
                  />
                </FormControl>
                <FormDescription>
                  User associated with this organizer
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Organizer Name" {...field} />
              </FormControl>
              <FormDescription>The name of the organizer</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="slug"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Slug</FormLabel>
              <FormControl>
                <Input placeholder="organizer-slug" {...field} />
              </FormControl>
              <FormDescription>
                URL-friendly identifier (no spaces, lowercase)
              </FormDescription>
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
                  placeholder="Organizer Description"
                  className="resize-none"
                  {...field}
                  // Convert null to empty string
                  value={field.value ?? ''}
                />
              </FormControl>
              <FormDescription>
                Brief description of the organizer
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="email@example.com"
                    {...field}
                  />
                </FormControl>
                <FormDescription>Contact email address</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone</FormLabel>
                <FormControl>
                  <Input
                    placeholder="+1 (555) 123-4567"
                    {...field}
                    value={field.value ?? ''}
                  />
                </FormControl>
                <FormDescription>Contact phone number</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="website"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Website</FormLabel>
                <FormControl>
                  <Input
                    placeholder="https://example.com"
                    {...field}
                    value={field.value ?? ''}
                  />
                </FormControl>
                <FormDescription>Organizer's website URL</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Address</FormLabel>
                <FormControl>
                  <Input
                    placeholder="123 Main St, City, State"
                    {...field}
                    value={field.value ?? ''}
                  />
                </FormControl>
                <FormDescription>Physical address</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="verificationStatus"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Verification Status</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select verification status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="VERIFIED">Verified</SelectItem>
                    <SelectItem value="REJECTED">Rejected</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>Current verification status</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="payoutFrequency"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Payout Frequency</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select payout frequency" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="DAILY">Daily</SelectItem>
                    <SelectItem value="WEEKLY">Weekly</SelectItem>
                    <SelectItem value="BIWEEKLY">Biweekly</SelectItem>
                    <SelectItem value="MONTHLY">Monthly</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  How often payouts are processed
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="commissionRate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Commission Rate (%)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  step="0.01"
                  {...field}
                  onChange={(e) =>
                    field.onChange(Number.parseFloat(e.target.value) || 0)
                  }
                  value={field.value}
                />
              </FormControl>
              <FormDescription>Platform commission percentage</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        /> */}

        <Button
          disabled={form.formState.isSubmitting}
          type="submit"
          className="max-md:w-full"
        >
          {mode === 'create' ? 'Create Organizer' : 'Update Organizer'}
        </Button>
      </form>
    </Form>
  );
}
