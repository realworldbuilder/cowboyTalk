'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { CameraIcon, XIcon } from 'lucide-react';

type ImageUploaderProps = {
  noteId: Id<'notes'>;
  existingImages?: string[];
  setImages?: (images: string[]) => void;
};

export default function ImageUploader({ noteId, existingImages = [], setImages }: ImageUploaderProps) {
  const [localImages, setLocalImages] = useState<string[]>(existingImages);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const generateUploadUrl = useMutation(api.notes.generateImageUploadUrl);
  const attachImageToNote = useMutation(api.notes.attachImageToNote);

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    setIsUploading(true);
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      try {
        // 1. Get a URL to upload the image
        const uploadUrl = await generateUploadUrl();
        
        // 2. Upload the image to storage
        const result = await fetch(uploadUrl, {
          method: 'POST',
          headers: { 'Content-Type': file.type },
          body: file
        });
        
        const { storageId } = await result.json();
        
        // 3. Attach the image to the note
        const imageUrl = await attachImageToNote({ noteId, storageId });
        
        // 4. Update local state with the new image
        setLocalImages(prev => [...prev, imageUrl]);
        if (setImages) setImages([...localImages, imageUrl]);
        
      } catch (error) {
        console.error('Error uploading image:', error);
      }
    }
    
    setIsUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };
  
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };
  
  return (
    <div className="w-full mt-4">
      <div className="flex flex-wrap gap-2 mb-2">
        {localImages.map((imageUrl, index) => (
          <div key={index} className="relative h-20 w-20 rounded-md overflow-hidden border border-gray-200">
            <Image 
              src={imageUrl} 
              alt={`Uploaded image ${index + 1}`} 
              fill 
              className="object-cover"
              unoptimized
            />
          </div>
        ))}
        
        <button
          onClick={triggerFileInput}
          disabled={isUploading}
          className="h-20 w-20 border-2 border-dashed border-gray-300 rounded-md flex items-center justify-center text-gray-400 hover:text-gray-600 hover:border-gray-400 transition-colors"
        >
          <CameraIcon size={24} />
        </button>
      </div>
      
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        multiple
        onChange={handleUpload}
        className="hidden"
      />
      
      {isUploading && (
        <div className="text-sm text-gray-600">
          Uploading images...
        </div>
      )}
    </div>
  );
} 