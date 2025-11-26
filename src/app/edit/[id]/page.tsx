'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import Link from 'next/link';
import { ArrowLeft, Upload, X } from 'lucide-react';

export default function EditMemory() {
  const router = useRouter();
  const params = useParams();
  const memoryId = params.id as string;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMemory() {
      try {
        const memoryDoc = await getDoc(doc(db, 'memories', memoryId));
        if (memoryDoc.exists()) {
          const data = memoryDoc.data();
          setTitle(data.title || '');
          setDescription(data.description || '');
          setDate(data.memory_date || '');
          setImages(data.image_urls || []);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching memory:', error);
        setLoading(false);
      }
    }
    fetchMemory();
  }, [memoryId]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);

    try {
      const formData = new FormData();
      Array.from(files).forEach((file) => {
        formData.append('file', file);
      });
      formData.append('upload_preset', 'timeless');

      const uploadPromises = Array.from(files).map(async (file) => {
        const fileFormData = new FormData();
        fileFormData.append('file', file);
        fileFormData.append('upload_preset', 'unsigned_memories');

        const response = await fetch(
          'https://api.cloudinary.com/v1_1/ddxjoserj/image/upload',
          {
            method: 'POST',
            body: fileFormData,
          }
        );

        const data = await response.json();
        return data.secure_url;
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      setImages([...images, ...uploadedUrls]);
    } catch (error) {
      console.error('Error uploading images:', error);
      alert('Failed to upload images. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !description || !date) {
      alert('Please fill in all fields');
      return;
    }

    try {
      await updateDoc(doc(db, 'memories', memoryId), {
        title,
        description,
        memory_date: date,
        image_urls: images,
        updated_at: new Date().toISOString(),
      });

      router.push('/');
    } catch (error) {
      console.error('Error updating memory:', error);
      alert('Failed to update memory. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F7F9FC]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-3 border-[#6B9EE8] mx-auto mb-4"></div>
          <p className="text-[#5F6368] font-medium">Loading memory...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F9FC] py-8 px-4 sm:px-6 lg:px-8 md:ml-16 overflow-y-auto">
      <div className="max-w-3xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center text-[#6B9EE8] hover:text-[#5A8DD6] mb-6 transition-colors font-semibold"
        >
          <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
          Back to Timeline
        </Link>

        <div className="bg-white rounded-2xl p-6 sm:p-8">
          <h1 className="text-3xl font-semibold text-[#1F1F1F] mb-6">
            Edit Memory
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-[#1F1F1F] mb-2"
              >
                Title
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-[#DDE5EF] focus:border-[#6B9EE8] focus:ring-2 focus:ring-[#6B9EE8]/20 outline-none transition-all"
                placeholder="Give your memory a title"
              />
            </div>

            <div>
              <label
                htmlFor="date"
                className="block text-sm font-medium text-[#1F1F1F] mb-2"
              >
                Date
              </label>
              <input
                type="date"
                id="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-[#DDE5EF] focus:border-[#6B9EE8] focus:ring-2 focus:ring-[#6B9EE8]/20 outline-none transition-all"
              />
            </div>

            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-[#1F1F1F] mb-2"
              >
                Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 rounded-xl border border-[#DDE5EF] focus:border-[#6B9EE8] focus:ring-2 focus:ring-[#6B9EE8]/20 outline-none transition-all resize-none"
                placeholder="Describe this memory..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1F1F1F] mb-2">
                Images
              </label>

              {images.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
                  {images.map((url, index) => (
                    <div key={index} className="relative group">
                      <Image
                        src={url}
                        alt={`Memory ${index + 1}`}
                        width={200}
                        height={128}
                        unoptimized
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-[#DDE5EF] rounded-xl cursor-pointer hover:border-[#6B9EE8] transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-8 h-8 text-[#5F6368] mb-2" />
                  <p className="text-sm text-[#5F6368]">
                    {uploading ? 'Uploading...' : 'Click to upload images'}
                  </p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  disabled={uploading}
                />
              </label>
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                className="flex-1 bg-[#6B9EE8] hover:bg-[#5A8DD6] text-white font-medium py-3 px-6 rounded-full transition-colors"
              >
                Save Changes
              </button>
              <Link
                href="/"
                className="flex-1 bg-[#DDE5EF] hover:bg-[#C5D4E8] text-[#1F1F1F] font-medium py-3 px-6 rounded-full transition-colors text-center"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
