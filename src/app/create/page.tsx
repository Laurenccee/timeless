'use client';

import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from '@/components/ui/carousel';
import {
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  ImagePlus,
  Trash2,
} from 'lucide-react';
import { CarouselApi } from '@/components/ui/carousel';
import { db } from '@/lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { DatePicker } from '@/components/date-picker';

export default function CreateMemory() {
  const [files, setFiles] = useState<File[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [carouselApi, setCarouselApi] = useState<CarouselApi | null>(null);
  const [memoryDate, setMemoryDate] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  const router = useRouter();
  const dropRef = useRef<HTMLDivElement>(null);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFiles = Array.from(e.dataTransfer.files).filter((file) =>
      file.type.startsWith('image/')
    );

    if (droppedFiles.length > 0) {
      setFiles((prev) => [...prev, ...droppedFiles]);
    }
  }, []);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  async function handleUpload() {
    if (files.length === 0 || !title || !description)
      return alert('All fields are required');
    setLoading(true);

    try {
      const imageUrls: string[] = [];

      // Upload images to Cloudinary
      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', 'unsigned_memories'); // Cloudinary preset

        const res = await fetch(
          'https://api.cloudinary.com/v1_1/ddxjoserj/image/upload',
          {
            method: 'POST',
            body: formData,
          }
        );

        const data = await res.json();
        if (!data.secure_url) throw new Error('Image upload failed');

        imageUrls.push(data.secure_url);
      }

      // Save memory data to Firestore
      await addDoc(collection(db, 'memories'), {
        title,
        description,
        image_urls: imageUrls,
        memory_date: memoryDate,
        created_at: new Date().toISOString(),
      });

      router.push('/');
    } catch (err: unknown) {
      if (err instanceof Error) {
        alert(err.message);
      } else {
        console.error('Unexpected error:', err);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-[#F7F9FC] md:ml-16">
      <div className="w-full max-w-6xl bg-white rounded-2xl overflow-hidden relative my-8 mx-4">
        {/* Back button */}
        <button
          onClick={() => router.back()}
          className="absolute top-4 left-4 z-10 bg-white hover:bg-[#E8F0FC] p-2 sm:p-3 rounded-full transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
          aria-label="Back"
        >
          <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 text-[#5F6368]" />
        </button>

        <div className="px-8 py-6 border-b border-[#E8F0FC] text-[#1F1F1F] text-center font-semibold text-2xl">
          Create new memory
        </div>

        {files.length === 0 ? (
          <div
            ref={dropRef}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`flex flex-col items-center justify-center p-16 text-[#5F6368] transition border-2 border-dashed rounded-2xl m-8 ${
              isDragging ? 'border-[#6B9EE8] bg-[#E8F0FC]' : 'border-[#DDE5EF]'
            }`}
          >
            <ImagePlus className="w-20 h-20 text-[#B8D4F1] mb-4" />
            <p className="mb-4 text-lg font-medium">
              Drag and drop photos here or select from computer
            </p>
            <label className="inline-block bg-[#6B9EE8] hover:bg-[#5A8DD6] text-white font-medium px-6 py-3 rounded-full cursor-pointer transition-colors">
              Select from computer
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => setFiles(Array.from(e.target.files || []))}
                className="hidden"
              />
            </label>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row">
            {/* Carousel Section */}
            <div className="relative flex-1 flex items-center justify-center bg-[#F7F9FC]">
              <Carousel
                className="w-full max-w-3xl p-8"
                opts={{ loop: true }}
                setApi={setCarouselApi}
              >
                <CarouselContent>
                  {files.map((file, index) => (
                    <CarouselItem key={index}>
                      <div className="relative">
                        <Image
                          src={URL.createObjectURL(file)}
                          alt={`preview-${index}`}
                          width={600}
                          height={600}
                          priority={true}
                          className="object-contain max-h-[600px] w-full rounded-md"
                        />
                        <button
                          onClick={() =>
                            setFiles((prev) =>
                              prev.filter((_, i) => i !== index)
                            )
                          }
                          className="absolute top-2 right-2 bg-white/90 hover:bg-white p-2 rounded-full transition-colors"
                          aria-label="Remove image"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </CarouselItem>
                  ))}
                  {/* Add New Image Card */}
                  <CarouselItem>
                    <div className="h-full flex items-center justify-center">
                      <label className="flex flex-col items-center justify-center w-40 h-40 border-2 border-dashed border-[#DDE5EF] text-[#5F6368] hover:border-[#6B9EE8] hover:text-[#6B9EE8] rounded-2xl cursor-pointer transition-colors">
                        <ImagePlus className="w-8 h-8 mb-1" />
                        <span className="text-sm font-medium">Add photo</span>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          className="hidden"
                          onChange={(e) => {
                            const newFiles = Array.from(e.target.files || []);
                            const filtered = newFiles.filter(
                              (file) =>
                                !files.some(
                                  (existing) =>
                                    existing.name === file.name &&
                                    existing.size === file.size
                                )
                            );
                            setFiles((prev) => [...prev, ...filtered]);
                          }}
                        />
                      </label>
                    </div>
                  </CarouselItem>
                </CarouselContent>
              </Carousel>

              {/* Nav Buttons */}
              <button
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white hover:bg-[#E8F0FC] p-3 rounded-full transition-colors opacity-40 hover:opacity-100"
                onClick={() => carouselApi?.scrollPrev()}
                aria-label="Previous"
              >
                <ChevronLeft className="w-5 h-5 text-[#5F6368]" />
              </button>
              <button
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white hover:bg-[#E8F0FC] p-3 rounded-full transition-colors opacity-40 hover:opacity-100"
                onClick={() => carouselApi?.scrollNext()}
                aria-label="Next"
              >
                <ChevronRight className="w-5 h-5 text-[#5F6368]" />
              </button>
            </div>

            {/* Form Section */}
            <div className="w-full lg:w-[400px] p-6 border-t lg:border-t-0 lg:border-l border-[#E8F0FC] flex flex-col gap-4 bg-white">
              <textarea
                placeholder="Write a caption..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
                className="w-full border border-[#DDE5EF] rounded-2xl p-3 text-sm resize-none focus:outline-none focus:border-[#6B9EE8] transition-colors"
              />
              <input
                type="text"
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full border border-[#DDE5EF] rounded-2xl p-3 text-sm focus:outline-none focus:border-[#6B9EE8] transition-colors"
              />
              <DatePicker
                memoryDate={memoryDate}
                setMemoryDate={setMemoryDate}
              />
              <button
                onClick={handleUpload}
                disabled={loading}
                className="bg-[#6B9EE8] text-white font-medium px-4 py-3 rounded-full hover:bg-[#5A8DD6] transition-colors mt-auto disabled:opacity-50"
              >
                {loading ? 'Uploading...' : 'Share'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
