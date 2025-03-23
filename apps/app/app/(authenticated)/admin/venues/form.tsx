'use client';

import type { SerializedVenue } from '@/types';

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

import { createVenue, updateVenue } from './actions';

interface VenueFormProps {
  setOpen?: (open: boolean) => void;
  mode?: 'create' | 'edit';
  venue?: SerializedVenue;
}

export function VenueForm({ setOpen, mode = 'create', venue }: VenueFormProps) {
  const router = useRouter();

  const form = useForm<PrismaNamespace.VenueUncheckedCreateInput>({
    defaultValues: venue
      ? {
          name: venue.name,
          slug: venue.slug,
          description: venue.description || '',
          address: venue.address || '',
          city: venue.city || '',
          state: venue.state || '',
          country: venue.country || '',
          postalCode: venue.postalCode || '',
          totalCapacity: venue.totalCapacity || 0,
          images: venue.images || [],
        }
      : {
          name: '',
          slug: '',
          description: '',
          address: '',
          city: '',
          state: '',
          country: '',
          postalCode: '',
          totalCapacity: 0,
          images: [],
        },
  });

  async function onSubmit(values: PrismaNamespace.VenueUncheckedCreateInput) {
    try {
      // Generate slug from name if not provided
      if (!values.slug) {
        values.slug = values.name.toLowerCase().replace(/\s+/g, '-');
      }

      if (mode === 'edit' && venue?.id) {
        await updateVenue(venue.id, values);
        toast.success('Venue updated successfully');
      } else {
        await createVenue(values);
        toast.success('Venue created successfully');
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
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Venue Name" {...field} />
              </FormControl>
              <FormDescription>The name of the venue</FormDescription>
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
                <Input placeholder="venue-slug" {...field} />
              </FormControl>
              <FormDescription>
                URL-friendly identifier (leave blank to auto-generate)
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
                  placeholder="Venue Description"
                  className="resize-none"
                  {...field}
                  // Convert null to empty string
                  value={field.value ?? ''}
                />
              </FormControl>
              <FormDescription>Describe the venue</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Address</FormLabel>
                <FormControl>
                  <Input
                    placeholder="123 Main St"
                    {...field}
                    value={field.value ?? ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>City</FormLabel>
                <FormControl>
                  <Input
                    placeholder="City"
                    {...field}
                    value={field.value ?? ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <FormField
            control={form.control}
            name="state"
            render={({ field }) => (
              <FormItem>
                <FormLabel>State/Province</FormLabel>
                <FormControl>
                  <Input
                    placeholder="State"
                    {...field}
                    value={field.value ?? ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="country"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Country</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Country"
                    {...field}
                    value={field.value ?? ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="postalCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Postal Code</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Postal Code"
                    {...field}
                    value={field.value ?? ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="totalCapacity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Total Capacity</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={0}
                  {...field}
                  onChange={(e) =>
                    field.onChange(Number.parseInt(e.target.value) || 0)
                  }
                  value={field.value || 0}
                />
              </FormControl>
              <FormDescription>
                Maximum number of people the venue can accommodate
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Age restriction and dress code fields removed as they are no longer in the schema */}

        {/* Venue features section removed as these fields are no longer in the schema */}

        <Button
          disabled={form.formState.isSubmitting}
          type="submit"
          className="max-md:w-full"
        >
          {mode === 'create' ? 'Create Venue' : 'Update Venue'}
        </Button>
      </form>
    </Form>
  );
}
