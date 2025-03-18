'use client';

import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
} from '@repo/design-system/components/ui/carousel';
import Image from 'next/image';
import { useEffect, useState } from 'react';

export const EventCarousel = () => {
  const placeholderArray = Array.from({ length: 2 });
  const [carousel, setCarousel] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!carousel) {
      return;
    }

    setCurrent(carousel.selectedScrollSnap() + 1);
    carousel.on('select', () => {
      setCurrent(carousel.selectedScrollSnap() + 1);
    });
  }, [carousel]);

  return (
    <div className="relative">
      <Carousel
        setApi={setCarousel}
        className="w-full"
        onChange={(index) => {
          console.log('scroll to', index);
          // setCurrent(index)
        }}
        // onSelectedIndexChange={(index) => setCurrent(index)}
      >
        <CarouselContent className="h-[300px] lg:h-[480px]">
          {placeholderArray.map((_, index) => (
            <CarouselItem className="relative" key={index}>
              <Image
                src={`/event-placeholder-${index + 1}.png`}
                alt="Event Image"
                fill
                className="object-cover"
              />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      {/* pagination dots */}
      <div className="-translate-x-1/2 absolute bottom-4 left-1/2 flex gap-2">
        {placeholderArray.map((_, index) => (
          <span
            key={index}
            className={`h-2 w-2 rounded-full bg-white ${current === index + 1 ? '' : 'opacity-50'}`}
          />
        ))}
      </div>
    </div>
  );
};
