'use client';

import { useState } from 'react';
import Image from 'next/image';
import { XIcon, ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';

type ImageViewerProps = {
  imageUrls: string[];
};

export default function ImageViewer({ imageUrls }: ImageViewerProps) {
  const [fullscreenIndex, setFullscreenIndex] = useState<number | null>(null);
  
  if (!imageUrls || imageUrls.length === 0) {
    return null;
  }
  
  const openFullscreen = (index: number) => {
    setFullscreenIndex(index);
  };
  
  const closeFullscreen = () => {
    setFullscreenIndex(null);
  };
  
  const showNext = () => {
    if (fullscreenIndex === null) return;
    setFullscreenIndex((fullscreenIndex + 1) % imageUrls.length);
  };
  
  const showPrevious = () => {
    if (fullscreenIndex === null) return;
    setFullscreenIndex((fullscreenIndex - 1 + imageUrls.length) % imageUrls.length);
  };
  
  return (
    <div className="mt-4">
      <h3 className="text-sm font-medium mb-2 text-gray-700">Attached Images</h3>
      <div className="flex flex-wrap gap-2">
        {imageUrls.map((url, index) => (
          <div 
            key={index} 
            className="relative h-24 w-24 rounded-md overflow-hidden cursor-pointer border border-gray-200"
            onClick={() => openFullscreen(index)}
          >
            <Image 
              src={url} 
              alt={`Image ${index + 1}`} 
              fill 
              className="object-cover hover:opacity-90 transition-opacity"
              unoptimized
            />
          </div>
        ))}
      </div>
      
      {/* Fullscreen viewer */}
      {fullscreenIndex !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
          <button 
            className="absolute top-4 right-4 text-white p-2 rounded-full hover:bg-gray-800"
            onClick={closeFullscreen}
          >
            <XIcon size={24} />
          </button>
          
          <button 
            className="absolute left-4 text-white p-2 rounded-full hover:bg-gray-800"
            onClick={showPrevious}
          >
            <ChevronLeftIcon size={32} />
          </button>
          
          <div className="relative h-full max-h-[80vh] w-full max-w-[90vw] md:max-w-[70vw]">
            <Image 
              src={imageUrls[fullscreenIndex]} 
              alt={`Fullscreen image ${fullscreenIndex + 1}`} 
              fill
              className="object-contain" 
              unoptimized
            />
          </div>
          
          <button 
            className="absolute right-4 text-white p-2 rounded-full hover:bg-gray-800"
            onClick={showNext}
          >
            <ChevronRightIcon size={32} />
          </button>
          
          <div className="absolute bottom-4 text-white">
            {fullscreenIndex + 1} / {imageUrls.length}
          </div>
        </div>
      )}
    </div>
  );
} 