// middleware.ts
// Clerk auth middleware. Runs on every request at Edge.
// Only /dashboard requires a signed-in user — everything else is public.

import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isProtected = createRouteMatcher([
  '/dashboard(.*)',
])

export default clerkMiddleware((auth, req) => {
  if (isProtected(req)) {
    auth().protect()
  }
})

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}
