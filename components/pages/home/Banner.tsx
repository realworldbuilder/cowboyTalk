import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';

const Banner = () => {
  return (
    <div className="relative w-full px-4 py-8 md:h-[605px] md:py-0 md:px-6 lg:px-8 xl:px-10 2xl:px-0">
      <div className="flex h-full w-full flex-col items-center justify-center">
        <a
          href="https://togetherai.link"
          target="_blank"
          rel="noreferrer"
          className="mb-4 cursor-pointer rounded-2xl border border-black px-3 py-1 text-xs text-slate-600 transition duration-300 ease-in-out hover:text-slate-700 sm:mb-5 sm:px-4 sm:text-sm"
        >
          Powered by <span className="font-bold">Together.ai </span>and{' '}
          <span className="font-bold">Convex</span>
        </a>
        <h1 className="inline-block text-center text-3xl font-medium tracking-tighter text-dark sm:text-4xl lg:text-7xl">
          AI-Powered Construction Reports
        </h1>
        <p className="mt-4 text-center text-base font-light tracking-tight sm:mt-6 sm:text-xl lg:mt-8 lg:text-3xl">
        Cowboy Talk wrangles your voice notes into slick reports—daily logs, safety hollers, quality checks, equipment rundowns, change orders, you name it. No typin’, no fussin’. Just talk, and it’s done faster than a rattlesnake’s strike ‘fore noon, partner.
        </p>
        <Link
          href={'/dashboard'}
          className="primary-gradient primary-shadow mx-auto mt-8 flex items-center justify-center gap-3 rounded-full px-4 py-2 text-center text-sm text-light sm:mt-12 sm:gap-4 md:mt-16 md:px-12 md:py-4 md:text-2xl"
        >
          Get Started
          <ArrowRight className="h-5 w-5 sm:h-6 sm:w-6 md:h-9 md:w-9" stroke="currentColor" fill="none" />
        </Link>
      </div>
      
      {/* background gradient */}
      <div className="absolute bottom-0 left-0 right-0 top-0 z-[-1] hidden h-full w-full grid-cols-3 md:grid">
        <BackgroundGradient />
        <BackgroundGradient />
        <BackgroundGradient />
      </div>
      {/* Mobile background gradient */}
      <div className="absolute bottom-0 left-0 right-0 top-0 z-[-1] h-full w-full md:hidden">
        <div className="mx-auto" style={{ maxWidth: '90%' }}>
          <BackgroundGradient />
        </div>
      </div>
    </div>
  );
};

function BackgroundGradient() {
  return (
    <div
      className="h-full w-full rounded-full"
      style={{
        opacity: '0.4',
        background:
          'radial-gradient(54.14% 54.14% at 50% 50%, #B94700 0%, rgba(185, 71, 0, 0.02) 100%)',
        filter: 'blur(177px)',
      }}
    />
  );
}

export default Banner;
