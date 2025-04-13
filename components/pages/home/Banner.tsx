import Link from 'next/link';

const Banner = () => {
  return (
    <section className="w-full py-16 md:py-24">
      <div className="max-width flex flex-col items-center justify-center">
        <a
          href="mailto:foundervisions@proton.me"
          target="_blank"
          rel="noreferrer"
          className="mb-5 rounded-full border border-muted/30 px-4 py-1 text-sm text-muted transition duration-300 hover:border-muted/50 hover:text-dark sm:text-base"
        >
          Invite only for now. Sorry, partner.
        </a>
        <h1 className="text-center text-4xl font-medium tracking-tight text-dark md:text-5xl lg:text-6xl">
          AI-Power for Construction<br className="hidden md:inline-block" />
          Superintendents
        </h1>
        <p className="mt-6 max-w-2xl text-center text-lg font-light tracking-tight text-dark/80 md:mt-8 md:text-xl">
          Cowboy Talk seamlessly converts your voice notes into{' '}
          <span className="font-medium text-primary">
            organized directives</span> or <span className="font-medium text-primary">constractual notices</span>{' '}
          and <span className="font-medium text-primary">clear action items</span> using AI.
        </p>
        <Link
          href={'/dashboard'}
          className="btn-primary mt-10 flex items-center justify-center gap-3 rounded-full px-6 py-3 md:mt-12 md:text-lg"
        >
          Get Started
          <svg 
            width="20" 
            height="20" 
            viewBox="0 0 20 20" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            className="ml-1"
          >
            <path 
              d="M4.16667 10H15.8333M15.8333 10L10 4.16667M15.8333 10L10 15.8333" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          </svg>
        </Link>
      </div>
      {/* subtle background effect */}
      <div className="absolute inset-0 -z-10 opacity-50">
        <div className="absolute left-1/4 top-1/4 h-64 w-64 rounded-full bg-primary/5 blur-3xl"></div>
        <div className="absolute right-1/4 top-1/2 h-64 w-64 rounded-full bg-secondary/5 blur-3xl"></div>
      </div>
    </section>
  );
};

export default Banner;
