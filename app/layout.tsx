import { Inter } from 'next/font/google';
import './globals.css';
import { Metadata } from 'next';
import ConvexClientProvider from './ConvexClientProvider';
import { ClerkProvider } from '@clerk/nextjs';
import Footer from '@/components/ui/Footer';
import { Toaster } from 'react-hot-toast';

let title = 'Cowboy Talk - AI-Powered Construction Reports';
let description = 'Turn your voice notes into detailed construction reports—no typing needed';
let url = 'http://localhost:3000';
let ogimage = 'http://localhost:3000/images/og-image.png';
let sitename = 'cowboytalk';

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
        {/* Remove the PlausibleProvider line (line 45) */}
        {/* <PlausibleProvider domain="cowboytalk.app" /> */}
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
