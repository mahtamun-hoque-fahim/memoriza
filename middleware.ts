// middleware.ts — protects /dashboard and /admin routes
import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export default auth(async (req) => {
  const { nextUrl, auth: session } = req as any

  const isAuthed = !!session?.user
  const isAdmin  = session?.user?.role === 'admin'

  if (nextUrl.pathname.startsWith('/admin') && !isAdmin) {
    return NextResponse.redirect(new URL('/sign-in', nextUrl))
  }

  if (nextUrl.pathname.startsWith('/dashboard') && !isAuthed) {
    return NextResponse.redirect(new URL('/sign-in', nextUrl))
  }
})

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*'],
}
