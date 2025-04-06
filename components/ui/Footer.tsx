import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="container mx-auto mt-auto flex h-16 flex-col items-center justify-between border-t border-gray-200 px-3 py-4 text-center text-xs md:text-sm text-gray-500 sm:h-20 sm:flex-row sm:py-6">
      <div>
      🤠 Yeehaw! Built in God's Country.
      </div>
      <div>
        <Link href="https://github.com/realworldbuilder/cowboyTalk" className="hover:text-gray-700 hover:underline">
          Open source forever.
        </Link>
      </div>
    </footer>
  );
}