'use client';

import { useEffect, useState } from 'react';
import { Memory } from '@/types/memory';
import { supabase } from '@/lib/supabase';
import { generateDateRange, DateEntry } from '@/utils/date-utils';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import MemoryCarousel from '@/components/memory-card-carousel';

export default function HorizontalTimeline() {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  const startDate = '2024-09-01';
  const endDate = '2025-12-31';
  const fullDates: DateEntry[] = generateDateRange(startDate, endDate);

  useEffect(() => {
    async function fetchMemories() {
      const { data, error } = await supabase
        .from('memories')
        .select('*')
        .order('memory_date', { ascending: true });

      if (error) {
        console.error('Error fetching memories:', error);
        return;
      }

      const formatted = data.map((m) => ({
        id: m.id,
        title: m.title,
        description: m.description,
        image: m.image_urls ?? [],
        rawDate: m.memory_date,
        iso: new Date(m.memory_date).toISOString().split('T')[0],
      }));

      setMemories(formatted);
      console.log('Fetched memories:', formatted);
      setLoading(false);
    }

    fetchMemories();
  }, []);

  const memoryByIso: Record<string, Memory> = memories.reduce((acc, mem) => {
    acc[mem.iso] = mem;
    return acc;
  }, {} as Record<string, Memory>);

  const activeMemory = memories[activeIndex];

  function nextMemory() {
    setActiveIndex((prev) => (prev + 1) % memories.length);
  }

  function prevMemory() {
    setActiveIndex((prev) => (prev === 0 ? memories.length - 1 : prev - 1));
  }

  if (loading) {
    return <p className="text-center mt-20">Loading timeline...</p>;
  }

  return (
    <div className="flex flex-col min-h-screen w-full">
      {/* Top Display */}
      <div className="relative w-full max-w-7xl flex flex-1 px-12 justify-center items-center md:px-8 py-12 mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeMemory?.id}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col md:flex-row gap-6 md:gap-12 w-full h-full items-center"
          >
            <MemoryCarousel
              images={activeMemory?.image || []}
              title={activeMemory?.title}
            />

            <div className="w-full md:w-1/2 max-w-xl text-center md:text-left">
              <p className="text-sm text-sky-400 mb-1 font-semibold uppercase tracking-wide">
                {activeMemory?.rawDate}
              </p>
              <h2 className="text-3xl text-sky-600 font-bold mb-2">
                {activeMemory?.title}
              </h2>
              <p className="text-lg text-justify text-gray-700">
                {activeMemory?.description}
              </p>
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="absolute left-0 top-1/2 -translate-y-1/2 z-10">
          <button
            onClick={prevMemory}
            className="flex flex-col items-center text-xs text-gray-400 hover:text-black"
          >
            <ChevronLeftIcon className="w-6 h-6" />
          </button>
        </div>
        <div className="absolute right-0 top-1/2 -translate-y-1/2 z-10">
          <button
            onClick={nextMemory}
            className="flex flex-col items-center text-xs text-gray-400 hover:text-black"
          >
            <ChevronRightIcon className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Bottom Timeline */}
      <div className="w-full bg-gray-50 py-12  overflow-x-auto relative">
        <TooltipProvider>
          <div className="relative flex min-w-max px-8 space-x-4 snap-x snap-mandatory">
            <div className="absolute bottom-[38px] left-0 w-full h-[2px] bg-gray-300 z-0"></div>

            {fullDates.map(({ iso, label, monthName }, index) => {
              const mem = memoryByIso[iso];
              const isActive = mem?.id === activeMemory?.id;
              const isNewMonth =
                index === 0 || fullDates[index - 1].monthName !== monthName;

              return (
                <div
                  key={iso}
                  className="flex flex-col items-center snap-start min-w-[4rem] relative z-10"
                >
                  {isNewMonth && (
                    <div className="absolute -top-5 text-xs text-blue-700 font-bold uppercase">
                      {monthName}
                    </div>
                  )}

                  {mem && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="absolute top-[calc(100%-38px)]">
                          <button
                            onClick={() => {
                              const idx = memories.findIndex(
                                (m) => m.id === mem.id
                              );
                              if (idx !== -1) setActiveIndex(idx);
                            }}
                            aria-label={`Go to ${mem.title}`}
                            className={`w-2 h-2 rounded-full border transition focus:outline-none focus:ring-2 ${
                              isActive
                                ? 'bg-blue-500 border-blue-700 focus:ring-blue-400'
                                : 'bg-white border-gray-400 focus:ring-gray-300'
                            }`}
                          />
                          {isActive && (
                            <span className="absolute inset-0 rounded-full animate-ping bg-blue-300 opacity-50 pointer-events-none"></span>
                          )}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="top">
                        <p>{`${mem.title} (${mem.rawDate})`}</p>
                      </TooltipContent>
                    </Tooltip>
                  )}

                  {isNewMonth ? (
                    <div className="h-20 w-px bg-gray-300" />
                  ) : (
                    <div className="h-20 flex items-end justify-center">
                      <div className="h-5 w-px bg-gray-300" />
                    </div>
                  )}

                  <p className="mt-1 text-[10px] text-gray-500 uppercase whitespace-nowrap tracking-wide">
                    {label}
                  </p>
                </div>
              );
            })}
          </div>
        </TooltipProvider>
      </div>
    </div>
  );
}
