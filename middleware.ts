import { authMiddleware } from '@clerk/nextjs';
import { NextResponse } from 'next/server';

// This example protects all routes including api/trpc routes
// Please edit this to allow other routes to be public as needed.
// See https://clerk.com/docs/references/nextjs/auth-middleware for more information about configuring your Middleware
export default authMiddleware({
  // Public routes that don't require authentication
  publicRoutes: [
    '/',                     // Homepage
    '/api(.*)',              // API routes
    '/favicon.ico',          // Favicon
    '/images(.*)',           // Public images
    '/_next/(.*)',           // Next.js assets
    '/sign-in(.*)',          // Clerk sign-in
    '/sign-up(.*)',          // Clerk sign-up
  ],
});

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};
