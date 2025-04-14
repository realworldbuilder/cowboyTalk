import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="w-full border-t border-dark/10 py-6">
      <div className="max-width flex flex-col items-center justify-between gap-4 text-sm text-muted md:flex-row md:text-base">
        <div>
          Built in God's country.
        </div>
        <div>
          Never abandon wisdom.
        </div>
      </div>
    </footer>
  );
}
