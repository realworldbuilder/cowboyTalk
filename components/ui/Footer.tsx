import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="w-full border-t border-dark/10 py-6">
      <div className="max-width flex flex-col items-center justify-center text-sm text-muted md:text-base">
        <Link href="https://github.com/realworldbuilder/cowboyTalk" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
          this is like if carhartt made software.
        </Link>
      </div>
    </footer>
  );
}
