// middleware.ts — protects /dashboard and /admin routes
// next-auth v5: session is on req.auth (NextAuthRequest extends NextRequest)
import { auth }        from '@/lib/auth'
import { NextResponse } from 'next/server'

export default auth((req) => {
  const session  = req.auth
  const isAuthed = !!session?.user
  const isAdmin  = session?.user?.role === 'admin'
  const { pathname } = req.nextUrl

  if (pathname.startsWith('/admin') && !isAdmin) {
    return NextResponse.redirect(new URL('/sign-in', req.nextUrl))
  }

  if (pathname.startsWith('/dashboard') && !isAuthed) {
    return NextResponse.redirect(new URL('/sign-in', req.nextUrl))
  }
})

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*'],
}
