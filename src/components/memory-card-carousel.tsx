'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Props {
  images: string[];
  title: string;
}

export default function MemoryCarousel({ images, title }: Props) {
  const [index, setIndex] = useState(0);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const next = () => setIndex((prev) => (prev + 1) % images.length);
  const prev = () =>
    setIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;

    if (diff > 50) next(); // swipe left
    else if (diff < -50) prev(); // swipe right
  };

  if (!images.length) return null;

  return (
    <Card className="w-full h-full overflow-hidden bg-white rounded-2xl">
      <CardContent
        className="relative aspect-[4/3] p-0 overflow-hidden group"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <Image
          src={images[index]}
          alt={`${title} image ${index + 1}`}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
          priority
        />
        {images.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="icon"
              onClick={prev}
              className="absolute top-1/2 left-3 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            >
              <ChevronLeft className="text-[#5F6368]" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={next}
              className="absolute top-1/2 right-3 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            >
              <ChevronRight className="text-[#5F6368]" />
            </Button>
          </>
        )}
        <div className="absolute bottom-3 right-3 bg-[#6B9EE8] text-white text-xs font-medium px-3 py-1.5 rounded-full">
          {index + 1} / {images.length}
        </div>
      </CardContent>
    </Card>
  );
}
