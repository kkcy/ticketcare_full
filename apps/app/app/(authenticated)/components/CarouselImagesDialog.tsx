'use client';

import { env } from '@/env';
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
import type { ChangeEvent, DragEvent } from 'react';

interface CarouselImagesFormValues {
  images: string[];
}

interface CarouselImagesDialogProps {
  id: string;
  images?: string[];
  onSubmit: (values: CarouselImagesFormValues) => Promise<void>;
}

export function CarouselImagesDialog({
  id,
  images,
  onSubmit,
}: CarouselImagesDialogProps) {
  const [open, setOpen] = useState(false);
  const isDesktop = useMediaQuery('(min-width: 768px)');

  const [carouselImages, setCarouselImages] = useState<string[]>(images ?? []);
  const [uploadingFiles, setUploadingFiles] = useState<Map<string, number>>(
    new Map()
  );
  const [overallProgress, setOverallProgress] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  // Calculate overall progress across all files
  const updateOverallProgress = () => {
    if (uploadingFiles.size === 0) {
      setOverallProgress(0);
      return;
    }

    let total = 0;
    for (const progress of uploadingFiles.values()) {
      total += progress;
    }

    const average = Math.round(total / uploadingFiles.size);
    setOverallProgress(average);
  };

  const form = useForm<CarouselImagesFormValues>({
    defaultValues: {
      images: carouselImages,
    },
  });

  // Function to handle carousel image upload
  const handleCarouselImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) {
      return;
    }

    // Process all files at once
    processFiles(Array.from(files));
  };

  // Function to handle drag and drop
  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      // Filter for only image files
      const imageFiles = Array.from(e.dataTransfer.files).filter((file) =>
        file.type.startsWith('image/')
      );

      if (imageFiles.length > 0) {
        processFiles(imageFiles);
      }
    }
  };

  // Process multiple files for upload
  const processFiles = (files: File[]) => {
    // Generate a unique ID for each file
    const fileIdsMap = new Map<File, string>();

    // Initialize progress tracking for each file
    const newUploadingFiles = new Map(uploadingFiles);

    // First assign IDs to all files
    for (const file of files) {
      const fileId = `${file.name}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      fileIdsMap.set(file, fileId);
      newUploadingFiles.set(fileId, 0);
    }

    // Update state with all the new files at once
    setUploadingFiles(newUploadingFiles);

    // Then start uploading each file with its assigned ID
    for (const file of files) {
      const fileId = fileIdsMap.get(file);
      if (fileId) {
        uploadCarouselImage(file, fileId);
      }
    }
  };

  // Function to upload a single carousel image
  const uploadCarouselImage = async (file: File, fileId: string) => {
    try {
      // Update progress for this specific file
      setUploadingFiles((prev) => {
        const updated = new Map(prev);
        updated.set(fileId, 0);
        return updated;
      });

      // Calculate and update overall progress
      updateOverallProgress();

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

          // Update progress for this specific file
          setUploadingFiles((prev) => {
            const updated = new Map(prev);
            updated.set(fileId, percentComplete);
            return updated;
          });

          // Update overall progress
          updateOverallProgress();
        }
      };

      // Handle response
      xhr.onload = () => {
        if (xhr.status === 200) {
          try {
            const response = JSON.parse(xhr.responseText);
            if (response.success) {
              // Add the new image URL to the carousel images array without replacing previous uploads
              setCarouselImages((prevImages) => {
                const updatedImages = [...prevImages, response.url];
                // Update the form value with all images
                form.setValue('images', updatedImages);
                return updatedImages;
              });
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
        // Remove this file from the uploading files
        setUploadingFiles((prev) => {
          const updated = new Map(prev);
          updated.delete(fileId);
          return updated;
        });

        // Update overall progress
        updateOverallProgress();
      };

      // Handle errors
      xhr.onerror = () => {
        toast.error('Network error during upload.');
        // Remove this file from the uploading files
        setUploadingFiles((prev) => {
          const updated = new Map(prev);
          updated.delete(fileId);
          return updated;
        });

        // Update overall progress
        updateOverallProgress();
      };

      xhr.send(formData);
    } catch (_) {
      toast.error('Failed to upload image');
      // Remove this file from the uploading files
      setUploadingFiles((prev) => {
        const updated = new Map(prev);
        updated.delete(fileId);
        return updated;
      });

      // Update overall progress
      updateOverallProgress();
    }
  };

  // Function to remove a carousel image
  const removeCarouselImage = (index: number) => {
    const updatedImages = [...carouselImages];
    updatedImages.splice(index, 1);
    setCarouselImages(updatedImages);
    form.setValue('images', updatedImages);
  };

  async function formOnSubmit(values: CarouselImagesFormValues) {
    try {
      setIsSaving(true);

      await onSubmit(values);

      toast.success('Carousel images updated successfully');
      setOpen(false);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Something went wrong';

      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  }

  const CarouselImagesForm = () => (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(formOnSubmit)}
        className="mx-auto w-full max-w-3xl space-y-4 px-4 md:px-0"
      >
        {/* Carousel Images Upload */}
        <FormField
          control={form.control}
          name="images"
          render={({ field }) => (
            <FormItem>
              <div className="flex flex-col gap-4">
                {carouselImages.length > 0 && (
                  <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                    {carouselImages.map((imageUrl, index) => (
                      <div
                        key={index}
                        className="relative h-40 overflow-hidden rounded-md"
                      >
                        <Image
                          src={imageUrl}
                          alt={`Carousel image ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeCarouselImage(index)}
                          className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-black/70 text-white hover:bg-black/90"
                          aria-label="Remove image"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <div
                  className={`flex flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed p-6 ${
                    uploadingFiles.size > 0 ? 'opacity-50' : ''
                  }`}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  // biome-ignore lint/a11y/useSemanticElements: <explanation>
                  role="button"
                  tabIndex={0}
                  aria-label="Drop zone for carousel images"
                >
                  <div className="text-center">
                    <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
                    <p className="mt-2 font-medium text-sm">
                      {uploadingFiles.size > 0
                        ? `Uploading ${uploadingFiles.size} file(s)... ${overallProgress}%`
                        : 'Drag and drop images here'}
                    </p>
                    <p className="mt-1 text-muted-foreground text-xs">or</p>
                    <Label
                      htmlFor="carousel-image-upload"
                      className="mt-2 inline-flex h-9 cursor-pointer items-center justify-center rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground text-sm ring-offset-background transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      Select files
                    </Label>
                  </div>
                  <input
                    id="carousel-image-upload"
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleCarouselImageUpload}
                    disabled={uploadingFiles.size > 0}
                  />
                  <input type="hidden" value={field.value?.join(',')} />
                </div>
              </div>
              <FormDescription>
                Upload additional images for your event carousel. Recommended
                size: 1200x800px.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="max-md:w-full"
          disabled={isSaving || uploadingFiles.size > 0}
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
            Edit Images
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Images</DialogTitle>
          </DialogHeader>
          <CarouselImagesForm />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button size="sm" variant="outline">
          <Pencil className="mr-2 h-4 w-4" />
          Edit Images
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DialogTitle>Edit Images</DialogTitle>
        </DrawerHeader>
        <CarouselImagesForm />
        <DrawerFooter className="pt-2">
          <DrawerClose asChild>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
