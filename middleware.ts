// middleware.ts
// Auth.js v5 middleware — protects /dashboard.
// All other routes are public (countdown pages, API routes).

export { auth as middleware } from '@/lib/auth'

export const config = {
  matcher: ['/dashboard/:path*'],
}
