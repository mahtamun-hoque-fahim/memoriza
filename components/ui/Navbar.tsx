// components/ui/Navbar.tsx
// Uses next-auth/react useSession — client component.

'use client'
import Link            from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { ThemeToggle } from './ThemeToggle'

export function Navbar() {
  const { data: session, status } = useSession()
  const loading = status === 'loading'

  return (
    <header className="fixed top-0 inset-x-0 z-50 h-14 flex items-center px-4 sm:px-6 border-b backdrop-blur-md"
      style={{ borderColor: 'var(--border)', backgroundColor: 'rgba(10,12,16,0.80)' }}>
      <div className="flex items-center justify-between w-full max-w-4xl mx-auto">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold font-syne transition-transform group-hover:scale-105"
            style={{ backgroundColor: 'var(--accent)' }}>
            M
          </div>
          <span className="font-syne font-semibold text-sm tracking-wide" style={{ color: 'var(--text)' }}>
            Memoriza
          </span>
        </Link>

        {/* Right */}
        <div className="flex items-center gap-3">
          {session && (
            <Link href="/dashboard"
              className="hidden sm:inline-flex font-mono text-xs uppercase tracking-widest transition-colors duration-150"
              style={{ color: 'var(--muted)' }}>
              Dashboard
            </Link>
          )}

          <Link href="/"
            className="hidden sm:inline-flex font-mono text-xs uppercase tracking-widest transition-colors duration-150"
            style={{ color: 'var(--muted)' }}>
            + New
          </Link>

          <ThemeToggle />

          {!loading && (
            session ? (
              <div className="flex items-center gap-2">
                {session.user?.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={session.user.image} alt={session.user.name ?? ''} className="w-7 h-7 rounded-full" />
                ) : (
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold"
                    style={{ backgroundColor: 'var(--accent)', color: '#fff' }}>
                    {(session.user?.email?.[0] ?? '?').toUpperCase()}
                  </div>
                )}
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="font-mono text-xs transition-colors duration-150"
                  style={{ color: 'var(--muted)' }}>
                  Sign out
                </button>
              </div>
            ) : (
              <Link href="/sign-in"
                className="font-mono text-xs px-3 py-1.5 rounded-lg border transition-colors duration-150"
                style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}>
                Sign in
              </Link>
            )
          )}
        </div>
      </div>
    </header>
  )
}
