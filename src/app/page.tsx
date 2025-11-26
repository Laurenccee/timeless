'use client';

import { useEffect, useState, useRef } from 'react';
import { Memory } from '@/types/memory';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { generateDateRange, DateEntry } from '@/utils/date-utils';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { ChevronLeftIcon, ChevronRightIcon, Plus, Pencil } from 'lucide-react';
import MemoryCarousel from '@/components/memory-card-carousel';
import Link from 'next/link';

export default function HorizontalTimeline() {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const timelineRef = useRef<HTMLDivElement>(null);

  const startDate = '2024-09-01';
  const endDate = '2025-12-31';
  const fullDates: DateEntry[] = generateDateRange(startDate, endDate);

  useEffect(() => {
    async function fetchMemories() {
      try {
        const memoriesRef = collection(db, 'memories');
        const q = query(memoriesRef, orderBy('memory_date', 'asc'));
        const querySnapshot = await getDocs(q);

        const formatted = querySnapshot.docs.map((doc) => {
          const m = doc.data();
          return {
            id: doc.id,
            title: m.title,
            description: m.description,
            image: m.image_urls ?? [],
            rawDate: m.memory_date,
            iso: new Date(m.memory_date).toISOString().split('T')[0],
          };
        });

        setMemories(formatted);
        console.log('Fetched memories:', formatted);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching memories:', error);
        setLoading(false);
      }
    }

    fetchMemories();
  }, []);

  const memoryByIso: Record<string, Memory> = memories.reduce((acc, mem) => {
    acc[mem.iso] = mem;
    return acc;
  }, {} as Record<string, Memory>);

  const activeMemory = memories[activeIndex];

  // Scroll timeline to active memory
  useEffect(() => {
    if (!activeMemory || !timelineRef.current) return;

    const activeButton = timelineRef.current.querySelector(
      `button[data-memory-id="${activeMemory.id}"]`
    );
    if (activeButton) {
      activeButton.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      });
    }
  }, [activeIndex, activeMemory]);

  function nextMemory() {
    setActiveIndex((prev) => (prev + 1) % memories.length);
  }

  function prevMemory() {
    setActiveIndex((prev) => (prev === 0 ? memories.length - 1 : prev - 1));
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F7F9FC]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-3 border-[#6B9EE8] mx-auto mb-4"></div>
          <p className="text-[#5F6368] font-semibold text-lg">
            Loading your memories...
          </p>
        </div>
      </div>
    );
  }

  if (memories.length === 0) {
    return (
      <div className="flex h-screen w-full bg-[#F7F9FC] overflow-hidden">
        {/* Main Content */}
        <div className="flex flex-col flex-1 h-full md:ml-16 overflow-hidden">
          <Link
            href="/create"
            className="fixed top-4 right-4 sm:top-6 sm:right-6 z-30"
          >
            <button className="bg-[#6B9EE8] hover:bg-[#5A8DD6] text-white p-3 sm:p-4 rounded-2xl transition-all duration-200 opacity-40 hover:opacity-100 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <Plus className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </Link>

          <div className="flex items-center justify-center flex-1">
            <div className="text-center">
              <p className="text-[#5F6368] text-xl font-semibold mb-4">
                No memories yet
              </p>
              <Link href="/create">
                <button className="bg-[#6B9EE8] hover:bg-[#5A8DD6] text-white font-bold px-8 py-3 rounded-full transition-colors text-base">
                  Create your first memory
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-[#F7F9FC] overflow-hidden">
      {/* Main Content */}
      <div className="flex flex-col flex-1 h-full md:ml-16 overflow-hidden">
        {/* Create Button */}
        <Link
          href="/create"
          className="fixed top-4 right-4 sm:top-6 sm:right-6 z-30"
        >
          <button className="bg-[#6B9EE8] hover:bg-[#5A8DD6] text-white p-3 sm:p-4 rounded-2xl transition-all duration-200 opacity-40 hover:opacity-100 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <Plus className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </Link>

        {/* Top Display */}
        <div className="relative w-full max-w-7xl flex flex-1 px-4 sm:px-6 lg:px-12 justify-center items-center mx-auto min-h-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeMemory?.id}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col lg:flex-row gap-8 lg:gap-16 w-full h-full items-center"
            >
              <div className="w-full lg:w-1/2">
                <MemoryCarousel
                  images={activeMemory?.image || []}
                  title={activeMemory?.title}
                />
              </div>

              <div className="w-full lg:w-1/2 max-w-xl text-center lg:text-left px-4 sm:px-0">
                <div className="flex items-center justify-between mb-6">
                  <div className="inline-block">
                    <p className="text-xs sm:text-sm text-[#6B9EE8] bg-[#E8F0FC] px-4 py-2 rounded-full font-semibold tracking-wider uppercase">
                      {activeMemory?.rawDate}
                    </p>
                  </div>
                  <Link href={`/edit/${activeMemory?.id}`}>
                    <button className="bg-white hover:bg-[#E8F0FC] text-[#6B9EE8] p-2 rounded-full transition-colors">
                      <Pencil className="w-5 h-5" />
                    </button>
                  </Link>
                </div>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl text-[#1F1F1F] font-bold mb-4 leading-tight tracking-tight">
                  {activeMemory?.title}
                </h2>
                <p className="text-base sm:text-lg text-[#5F6368] leading-relaxed font-normal">
                  {activeMemory?.description}
                </p>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation Buttons - Neobrutalism Style */}
          <div className="hidden md:block absolute -left-16 lg:-left-20 top-1/2 -translate-y-1/2 z-10">
            <button
              onClick={prevMemory}
              className="bg-white hover:bg-[#E8F0FC] transition-all p-3 rounded-full border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] opacity-40 hover:opacity-100"
              aria-label="Previous memory"
            >
              <ChevronLeftIcon className="w-6 h-6 text-[#1F1F1F]" />
            </button>
          </div>
          <div className="hidden md:block absolute -right-16 lg:-right-20 top-1/2 -translate-y-1/2 z-10">
            <button
              onClick={nextMemory}
              className="bg-white hover:bg-[#E8F0FC] transition-all p-3 rounded-full border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] opacity-40 hover:opacity-100"
              aria-label="Next memory"
            >
              <ChevronRightIcon className="w-6 h-6 text-[#1F1F1F]" />
            </button>
          </div>

          {/* Mobile Navigation - Neobrutalism Bottom Buttons */}
          <div className="md:hidden fixed bottom-32 left-0 right-0 flex justify-center gap-4 z-20 px-4">
            <button
              onClick={prevMemory}
              className="bg-white hover:bg-[#E8F0FC] transition-colors p-3 rounded-full border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              aria-label="Previous memory"
            >
              <ChevronLeftIcon className="w-5 h-5 text-[#1F1F1F]" />
            </button>
            <button
              onClick={nextMemory}
              className="bg-white hover:bg-[#E8F0FC] transition-colors p-3 rounded-full border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              aria-label="Next memory"
            >
              <ChevronRightIcon className="w-5 h-5 text-[#1F1F1F]" />
            </button>
          </div>
        </div>

        {/* Bottom Timeline - Neobrutalism Style */}
        <div
          ref={timelineRef}
          className="w-full bg-white py-8 sm:py-12 overflow-x-auto relative border-t-2 border-black flex-shrink-0"
        >
          <TooltipProvider>
            <div className="relative flex min-w-max px-4 sm:px-8 space-x-3 sm:space-x-4 snap-x snap-mandatory">
              <div className="absolute bottom-[38px] left-0 w-full h-[2px] bg-black z-0"></div>

              {fullDates.map(({ iso, label, monthName }, index) => {
                const mem = memoryByIso[iso];
                const isActive = mem?.id === activeMemory?.id;
                const isNewMonth =
                  index === 0 || fullDates[index - 1].monthName !== monthName;

                return (
                  <div
                    key={iso}
                    className="flex flex-col items-center snap-start min-w-[3rem] sm:min-w-[4rem] relative z-10"
                  >
                    {isNewMonth && (
                      <div className="absolute -top-6 sm:-top-7 text-xs sm:text-sm text-[#6B9EE8] font-semibold uppercase tracking-wider">
                        {monthName}
                      </div>
                    )}

                    {mem && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="absolute top-[calc(100%-38px)]">
                            <button
                              data-memory-id={mem.id}
                              onClick={() => {
                                const idx = memories.findIndex(
                                  (m) => m.id === mem.id
                                );
                                if (idx !== -1) setActiveIndex(idx);
                              }}
                              aria-label={`Go to ${mem.title}`}
                              className={`w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full transition-all duration-200 focus:outline-none border-[1.5px] border-black ${
                                isActive
                                  ? 'bg-[#6B9EE8] scale-125 shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)]'
                                  : 'bg-white hover:bg-[#E8F0FC] shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]'
                              }`}
                            />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent
                          side="top"
                          className="bg-[#6B9EE8] text-white border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] px-3 py-2"
                        >
                          <p className="font-bold text-sm leading-tight">
                            {mem.title}
                          </p>
                          <p className="text-xs opacity-90 mt-0.5">
                            {mem.rawDate}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    )}

                    {isNewMonth ? (
                      <div className="h-16 sm:h-20 w-[2px] bg-[#B8D4F1]" />
                    ) : (
                      <div className="h-16 sm:h-20 flex items-end justify-center">
                        <div className="h-4 sm:h-5 w-[2px] bg-[#DDE5EF]" />
                      </div>
                    )}

                    <p className="mt-1 text-[9px] sm:text-[10px] text-[#5F6368] uppercase whitespace-nowrap tracking-wide font-medium">
                      {label}
                    </p>
                  </div>
                );
              })}
            </div>
          </TooltipProvider>
        </div>
      </div>
    </div>
  );
}
