import { authMiddleware } from '@clerk/nextjs';

// This example protects all routes including api/trpc routes
// Please edit this to allow other routes to be public as needed.
// See https://clerk.com/docs/references/nextjs/auth-middleware for more information about configuring your Middleware
export default authMiddleware({
  publicRoutes: [
    '/', 
    '/test',
    '/sign-in',
    '/sign-up',
    '/sign-out',
    '/sso-callback',
    // Add Clerk's sign-out routes as public to prevent redirect loops
    '/(api|trpc)(.*)',
  ],
  debug: true,
});

// Use the matcher pattern that avoids known issues with Edge runtime
export const config = {
  matcher: [
    // Required for Clerk authentication
    '/((?!.*\\..*|_next).*)',
    // Exclude static files and api routes that don't need auth
    '/(api|trpc)(.*)'
  ],
};
