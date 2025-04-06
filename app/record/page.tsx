'use client';

import { useEffect, useState, useRef } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { getCurrentFormattedDate } from '@/lib/utils';
import { useUser } from '@clerk/nextjs';
import { v4 } from 'uuid'; // for randomly generating file ID
import { useRouter } from 'next/navigation';
import Header from '@/components/ui/Header';
import { ExclamationTriangleIcon } from '@radix-ui/react-icons';
import { Mic, MicOff } from 'lucide-react';

const RecordVoicePage = () => {
  const [title, setTitle] = useState('Record your construction report');
  const envVarsUrl = useQuery(api.utils.envVarsMissing);

  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [totalSeconds, setTotalSeconds] = useState(0);

  const { user } = useUser();

  const generateUploadUrl = useMutation(api.notes.generateUploadUrl);
  const createNote = useMutation(api.notes.createNote);

  const router = useRouter();

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      setMediaRecorder(recorder);
      const chunks: BlobPart[] = [];

      recorder.ondataavailable = e => {
        chunks.push(e.data);
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(chunks, { type: 'audio/wav' });
        
        // Get signed URL from Convex
        const signedUrl = await generateUploadUrl();
        
        // Upload to Convex storage
        const result = await fetch(signedUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'audio/wav' },
          body: audioBlob,
        });
        
        const { storageId } = await result.json();

        // Save record to database
        if (user) {
          const noteId = await createNote({
            storageId,
          });
          
          router.push(`/recording/${noteId}`);
        }
      };

      recorder.start();
      setIsRunning(true);
      setTitle('Recording...');
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  }

  function stopRecording() {
    // @ts-ignore
    mediaRecorder.stop();
    setIsRunning(false);
  }

  const formattedDate = getCurrentFormattedDate();

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning) {
      interval = setInterval(() => {
        setTotalSeconds((prevTotalSeconds) => prevTotalSeconds + 1);
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isRunning]);

  function formatTime(time: number): string {
    return time < 10 ? `0${time}` : `${time}`;
  }

  const handleRecordClick = () => {
    if (title === 'Record your construction report') {
      startRecording();
    } else if (title === 'Recording...') {
      stopRecording();
    }
  };

  return (
    <div className=" flex flex-col items-center justify-between">
      <h1 className="pt-[25px] text-center text-xl font-medium text-dark md:pt-[47px] md:text-2xl lg:text-3xl">
        {title}
      </h1>
      <p className="mb-20 mt-4 text-sm text-gray-400 md:text-base">{formattedDate}</p>
      <div className="relative mx-auto flex h-[316px] w-[316px] items-center justify-center">
        <div
          className={`recording-box absolute h-full w-full rounded-[50%] p-[12%] pt-[17%] ${
            title !== 'Record your construction report' && title !== 'Processing...'
              ? 'record-animation'
              : ''
          }`}
        >
          <div
            className="h-full w-full rounded-[50%]"
            style={{ background: 'linear-gradient(#B94700, #7A2E00)' }}
          />
        </div>
        <div className="z-50 flex h-fit w-fit flex-col items-center justify-center">
          <h1 className="text-[40px] md:text-[50px] lg:text-[60px] leading-[114.3%] tracking-[-1.5px] text-light">
              {formatTime(Math.floor(totalSeconds / 60))}:{formatTime(totalSeconds % 60)}
          </h1>
        </div>
      </div>
      <div className="mt-10 flex w-fit items-center justify-center gap-[33px] pb-7 md:gap-[77px] ">
        {envVarsUrl ? (
          <MissingEnvVars url={envVarsUrl} />
        ) : (
          <button
            onClick={handleRecordClick}
            className="mt-10 h-fit w-fit rounded-[50%] border-[2px] p-5"
            style={{ boxShadow: '0px 0px 8px 5px rgba(0,0,0,0.3)' }}
          >
            {!isRunning ? (
              <MicOff 
                className="h-[60px] w-[60px] md:h-[90px] md:w-[90px] text-gray-700"
                strokeWidth={1.5}
              />
            ) : (
              <Mic
                className="h-[60px] w-[60px] md:h-[90px] md:w-[90px] text-primary-600 animate-pulse transition"
                strokeWidth={1.5}
              />
            )}
          </button>
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
          <h3 className="text-xs md:text-sm font-medium text-yellow-800">
            Missing Environment Variables
          </h3>
          <div className="mt-2 text-xs md:text-sm text-yellow-700">
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
