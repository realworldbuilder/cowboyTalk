import type { Metadata } from 'next';
import './globals.css';
import ConvexClientProvider from './ConvexClientProvider';
import Footer from '@/components/ui/Footer';
import { Toaster } from 'react-hot-toast';
import PlausibleProvider from 'next-plausible';

let title = 'Cowboy Talk - Construction Voice Reporting';
let description = 'Generate action items from your construction voice reports in seconds';
let url = 'https://www.cowboytalk.app';
let ogimage = 'https://www.cowboytalk.app/images/og-image.png';
let sitename = 'cowboytalk.app';

export const metadata: Metadata = {
  metadataBase: new URL(url),
  title,
  description,
  icons: {
    icon: '/favicon.ico',
  },
  openGraph: {
    images: [ogimage],
    title,
    description,
    url: url,
    siteName: sitename,
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    images: [ogimage],
    title,
    description,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <PlausibleProvider domain="cowboy-talk.vercel.app" />
      </head>
      <body>
        <ConvexClientProvider>
          {children}
          <Footer />
          <Toaster position="bottom-left" reverseOrder={false} />
        </ConvexClientProvider>
      </body>
    </html>
  );
}
