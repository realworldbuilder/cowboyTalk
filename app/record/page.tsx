'use client';

import { useEffect, useState, useRef } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { getCurrentFormattedDate } from '@/lib/utils';
import { useUser } from '@clerk/nextjs';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Header from '@/components/ui/Header';
import { ExclamationTriangleIcon } from '@radix-ui/react-icons';
import { CameraIcon, XIcon } from 'lucide-react';
import { Id } from '@/convex/_generated/dataModel';

const RecordVoicePage = () => {
  const [title, setTitle] = useState('Record your voice note');
  const envVarsUrl = useQuery(api.utils.envVarsMissing);

  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [totalSeconds, setTotalSeconds] = useState(0);
  const [capturedImages, setCapturedImages] = useState<string[]>([]);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [imageStorageIds, setImageStorageIds] = useState<Id<"_storage">[]>([]);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const { user } = useUser();

  const generateUploadUrl = useMutation(api.notes.generateUploadUrl);
  const generateImageUploadUrl = useMutation(api.notes.generateImageUploadUrl);
  const createNote = useMutation(api.notes.createNote);
  const attachImageToNote = useMutation(api.notes.attachImageToNote);

  const router = useRouter();

  async function startRecording() {
    setIsRunning(true);
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);
    let audioChunks: any = [];

    recorder.ondataavailable = (e) => {
      audioChunks.push(e.data);
    };

    recorder.onstop = async () => {
      const audioBlob = new Blob(audioChunks, { type: 'audio/mp3' });

      const postUrl = await generateUploadUrl();
      const result = await fetch(postUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'audio/mp3' },
        body: audioBlob,
      });
      const { storageId } = await result.json();

      if (user) {
        let noteId = await createNote({
          storageId,
        });
        
        // Attach any captured images to the note
        for (const storageId of imageStorageIds) {
          await attachImageToNote({
            noteId,
            storageId
          });
        }

        router.push(`/recording/${noteId}`);
      }
    };
    setMediaRecorder(recorder as any);
    recorder.start();
  }

  function stopRecording() {
    // @ts-ignore
    mediaRecorder.stop();
    setIsRunning(false);
  }
  
  const openCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      
      setIsCameraOpen(true);
    } catch (error) {
      console.error("Error accessing camera:", error);
    }
  };
  
  const closeCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    setIsCameraOpen(false);
  };
  
  const captureImage = async () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Draw the current video frame to the canvas
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Convert canvas to blob
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
          else resolve(new Blob([]));
        }, 'image/jpeg', 0.8);
      });
      
      // Upload the image to storage
      try {
        // Get upload URL
        const uploadUrl = await generateImageUploadUrl();
        
        // Upload the image
        const result = await fetch(uploadUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'image/jpeg' },
          body: blob
        });
        
        const { storageId } = await result.json();
        setImageStorageIds(prev => [...prev, storageId as Id<"_storage">]);
        
        // Convert blob to data URL for preview
        const reader = new FileReader();
        reader.onloadend = () => {
          setCapturedImages(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(blob);
        
        // Close camera after capturing
        closeCamera();
      } catch (error) {
        console.error("Error uploading image:", error);
      }
    }
  };

  const formattedDate = getCurrentFormattedDate();

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning) {
      interval = setInterval(() => {
        setTotalSeconds((prevTotalSeconds) => prevTotalSeconds + 1);
      }, 1000);
    }

    return () => {
      clearInterval(interval);
      // Clean up camera stream when component unmounts
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [isRunning]);

  function formatTime(time: number): string {
    return time < 10 ? `0${time}` : `${time}`;
  }

  const handleRecordClick = () => {
    if (title === 'Record your voice note') {
      setTitle('Recording...');
      startRecording();
    } else if (title === 'Recording...') {
      setTitle('Processing...');
      stopRecording();
    }
  };

  return (
    <div className="flex min-h-[90vh] flex-col items-center justify-between py-4">
      <div>
        <h1 className="pt-2 text-center text-xl font-medium text-dark md:pt-4 md:text-3xl">
          {title}
        </h1>
        <p className="mt-2 text-center text-sm text-gray-400">{formattedDate}</p>
      </div>
      
      {/* Camera overlay */}
      {isCameraOpen && (
        <div className="fixed inset-0 z-50 flex flex-col bg-black">
          <div className="relative flex-1">
            <video 
              ref={videoRef} 
              className="h-full w-full object-cover" 
              playsInline 
              muted
            />
            <canvas ref={canvasRef} className="hidden" />
            
            <div className="absolute top-4 right-4">
              <button 
                onClick={closeCamera}
                className="rounded-full bg-black/50 p-2 text-white"
              >
                <XIcon size={24} />
              </button>
            </div>
          </div>
          
          <div className="flex justify-center bg-black p-4">
            <button 
              onClick={captureImage}
              className="h-16 w-16 rounded-full border-4 border-white"
            />
          </div>
        </div>
      )}
      
      <div className="relative mx-auto flex h-[260px] w-[260px] items-center justify-center md:h-[300px] md:w-[300px]">
        <div
          className={`recording-box absolute h-full w-full rounded-[50%] p-[12%] pt-[17%] ${
            title !== 'Record your voice note' && title !== 'Processing...'
              ? 'record-animation'
              : ''
          }`}
        >
          <div
            className="h-full w-full rounded-[50%]"
            style={{ background: 'linear-gradient(rgba(168, 64, 0, 0.8), rgba(122, 53, 0, 0.9))' }}
          />
        </div>
        <div className="z-50 flex h-fit w-fit flex-col items-center justify-center">
          <h1 className="text-[50px] leading-[114.3%] tracking-[-1.5px] text-light md:text-[60px]">
              {formatTime(Math.floor(totalSeconds / 60))}:{formatTime(totalSeconds % 60)}
          </h1>
        </div>
      </div>
      
      {/* Captured Images Preview */}
      {capturedImages.length > 0 && (
        <div className="mb-4 mt-1 flex flex-wrap justify-center gap-2">
          {capturedImages.map((src, index) => (
            <div key={index} className="relative h-16 w-16 overflow-hidden rounded-md border border-gray-300">
              <Image 
                src={src} 
                alt={`Captured image ${index + 1}`} 
                fill 
                className="object-cover" 
              />
            </div>
          ))}
        </div>
      )}
      
      <div className="flex w-fit items-center justify-center gap-[33px] md:gap-[77px]">
        {envVarsUrl ? (
          <MissingEnvVars url={envVarsUrl} />
        ) : (
          <>
            {isRunning && (
              <button
                onClick={openCamera}
                className="h-fit w-fit rounded-[50%] border-[2px]"
                style={{ boxShadow: '0px 0px 8px 5px rgba(0,0,0,0.3)' }}
              >
                <CameraIcon className="h-[60px] w-[60px] p-3 md:h-[90px] md:w-[90px]" />
              </button>
            )}
            
            <button
              onClick={handleRecordClick}
              className="h-fit w-fit rounded-[50%] border-[2px]"
              style={{ boxShadow: '0px 0px 8px 5px rgba(0,0,0,0.3)' }}
            >
              {!isRunning ? (
                <Image
                  src={'/icons/nonrecording_mic.svg'}
                  alt="recording mic"
                  width={148}
                  height={148}
                  className="h-[60px] w-[60px] md:h-[90px] md:w-[90px]"
                />
              ) : (
                <Image
                  src={'/icons/recording_mic.svg'}
                  alt="recording mic"
                  width={148}
                  height={148}
                  className="h-[60px] w-[60px] animate-pulse transition md:h-[90px] md:w-[90px]"
                />
              )}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default RecordVoicePage;

function MissingEnvVars(props: { url: string }) {
  return (
    <div className="rounded-md bg-yellow-50 p-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <ExclamationTriangleIcon
            className="h-5 w-5 text-yellow-400"
            aria-hidden="true"
          />
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-yellow-800">
            Missing Environment Variables
          </h3>
          <div className="mt-2 text-sm text-yellow-700">
            <p>
              Set up your{' '}
              <a className="underline" target="_blank" href={props.url}>
                Convex environment variables here
              </a>{' '}
              with API keys from{' '}
              <a
                className="underline"
                target="_blank"
                href="https://api.together.xyz/settings/api-keys"
              >
                Together.ai
              </a>{' '}
              and{' '}
              <a
                className="underline"
                target="_blank"
                href="https://replicate.com/account/api-tokens"
              >
                Replicate
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
