'use client';

import { env } from '@/env';
import type { SerializedEvent } from '@/types';
import { Pencil, Upload } from '@repo/design-system/components/icons';
import { Button } from '@repo/design-system/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@repo/design-system/components/ui/dialog';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTrigger,
} from '@repo/design-system/components/ui/drawer';
import {
  Form,
  FormDescription,
  FormField,
  FormItem,
  FormMessage,
  useForm,
} from '@repo/design-system/components/ui/form';
import { Label } from '@repo/design-system/components/ui/label';
import { toast } from '@repo/design-system/components/ui/sonner';
import { useMediaQuery } from '@repo/design-system/hooks/use-media-query';
import Image from 'next/image';
import { useState } from 'react';
import type { ChangeEvent } from 'react';
import { updateEvent } from '../actions';

interface HeroImageFormValues {
  heroImageUrl?: string;
}

interface HeroImageDialogProps {
  event: SerializedEvent;
}

export function HeroImageDialog({ event }: HeroImageDialogProps) {
  const [open, setOpen] = useState(false);
  const isDesktop = useMediaQuery('(min-width: 768px)');

  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    event?.heroImageUrl || null
  );

  const form = useForm<HeroImageFormValues>({
    defaultValues: {
      heroImageUrl: event.heroImageUrl || undefined,
    },
  });

  // Function to handle hero image upload
  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }

    try {
      setIsUploading(true);
      setUploadProgress(0);

      const formData = new FormData();
      formData.append('file', file);
      formData.append('access', 'public');

      // Create a new XMLHttpRequest to track upload progress
      const xhr = new XMLHttpRequest();
      xhr.open('POST', `${env.NEXT_PUBLIC_API_URL}/api/upload`, true);

      // Set the appropriate headers for CORS
      xhr.withCredentials = true;
      xhr.setRequestHeader('Accept', 'application/json');

      // Track upload progress
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const percentComplete = Math.round((e.loaded / e.total) * 100);
          setUploadProgress(percentComplete);
        }
      };

      // Handle response
      xhr.onload = () => {
        if (xhr.status === 200) {
          try {
            const response = JSON.parse(xhr.responseText);
            if (response.success) {
              setPreviewUrl(response.url);
              form.setValue('heroImageUrl', response.url);
              toast.success('Image uploaded successfully');
            } else {
              toast.error(response.error || 'Failed to upload image');
            }
          } catch (_) {
            toast.error('Failed to process server response');
          }
        } else {
          toast.error(
            `Failed to upload image: ${xhr.statusText || 'Server error'}`
          );
        }
        setIsUploading(false);
      };

      // Handle errors
      xhr.onerror = () => {
        toast.error('Network error during upload.');
        setIsUploading(false);
      };

      xhr.send(formData);
    } catch (_) {
      toast.error('Failed to upload image');
      setIsUploading(false);
    }
  };

  async function onSubmit(values: HeroImageFormValues) {
    try {
      setIsSaving(true);
      if (!event?.id) {
        throw new Error('Event ID is required');
      }

      await updateEvent(event.id, {
        ...values,
        venueId: BigInt(event.venueId),
      });

      toast.success('Hero image updated successfully');
      setOpen(false);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Something went wrong';

      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  }

  const HeroImageForm = () => (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="mx-auto w-full max-w-3xl space-y-4 px-4 md:px-0"
      >
        {/* Hero Image Upload */}
        <FormField
          control={form.control}
          name="heroImageUrl"
          render={({ field }) => (
            <FormItem>
              <div className="flex flex-col gap-4">
                {previewUrl && (
                  <div className="relative h-40 w-full overflow-hidden rounded-md">
                    <Image
                      src={previewUrl}
                      alt="Event preview"
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="flex items-center gap-4">
                  <Label
                    htmlFor="image-upload"
                    className={`flex h-10 cursor-pointer items-center gap-2 rounded-md border border-input bg-background px-4 py-2 font-medium text-sm ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${isUploading ? 'opacity-50' : ''}`}
                  >
                    <Upload className="h-4 w-4" />
                    {isUploading
                      ? `Uploading... ${uploadProgress}%`
                      : 'Pick a file'}
                  </Label>
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                    disabled={isUploading}
                  />
                  <input type="hidden" {...field} />
                </div>
              </div>
              <FormDescription>
                Upload a hero image for your event. Recommended size:
                1200x630px.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="max-md:w-full"
          disabled={isSaving || isUploading}
        >
          {isSaving ? 'Saving...' : 'Save'}
        </Button>
      </form>
    </Form>
  );

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button size="sm" variant="outline">
            <Pencil className="mr-2 h-4 w-4" />
            Edit Hero Image
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Hero Image</DialogTitle>
          </DialogHeader>
          <HeroImageForm />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button size="sm" variant="outline">
          <Pencil className="mr-2 h-4 w-4" />
          Edit Hero Image
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DialogTitle>Edit Hero Image</DialogTitle>
        </DrawerHeader>
        <HeroImageForm />
        <DrawerFooter className="pt-2">
          <DrawerClose asChild>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
