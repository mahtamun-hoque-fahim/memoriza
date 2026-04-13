// components/ui/Navbar.tsx
'use client'
import Link               from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { usePathname }    from 'next/navigation'
import { useState }       from 'react'

export function Navbar() {
  const { data: session, status } = useSession()
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)

  // Hide navbar on countdown public pages
  if (pathname?.startsWith('/c/')) return null

  const isAdmin = session?.user?.role === 'admin'

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 h-14 flex items-center px-4 sm:px-6"
      style={{
        background:   'rgba(10, 12, 16, 0.85)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border)',
      }}
    >
      {/* Logo */}
      <Link href="/" className="font-syne font-bold text-lg tracking-tight" style={{ color: 'var(--text)' }}>
        Memoriza
      </Link>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Desktop nav */}
      <div className="hidden sm:flex items-center gap-2">
        {status === 'loading' ? null : session?.user ? (
          <>
            <Link
              href="/dashboard"
              className="px-4 py-2 rounded-lg text-sm font-medium transition-colors hover:opacity-80"
              style={{ color: pathname === '/dashboard' ? 'var(--accent)' : 'var(--muted)' }}
            >
              Dashboard
            </Link>
            {isAdmin && (
              <Link
                href="/admin"
                className="px-4 py-2 rounded-lg text-sm font-medium transition-colors hover:opacity-80"
                style={{ color: pathname?.startsWith('/admin') ? 'var(--accent)' : 'var(--muted)' }}
              >
                Admin
              </Link>
            )}
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-colors hover:opacity-80"
              style={{ color: 'var(--muted)' }}
            >
              Sign out
            </button>
          </>
        ) : (
          <Link
            href="/sign-in"
            className="px-5 py-2 rounded-xl text-sm font-syne font-semibold text-white transition-all hover:opacity-90"
            style={{ background: 'var(--accent)' }}
          >
            Sign in
          </Link>
        )}
      </div>

      {/* Mobile menu button */}
      <button
        className="sm:hidden p-2 rounded-lg"
        style={{ color: 'var(--muted)' }}
        onClick={() => setMenuOpen((v) => !v)}
        aria-label="Toggle menu"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
          {menuOpen
            ? <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            : <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
          }
        </svg>
      </button>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div
          className="absolute top-14 left-0 right-0 py-3 px-4 flex flex-col gap-1 sm:hidden"
          style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}
        >
          {session?.user ? (
            <>
              <Link href="/dashboard" onClick={() => setMenuOpen(false)}
                className="py-2.5 px-3 rounded-lg text-sm font-medium" style={{ color: 'var(--text)' }}>
                Dashboard
              </Link>
              {isAdmin && (
                <Link href="/admin" onClick={() => setMenuOpen(false)}
                  className="py-2.5 px-3 rounded-lg text-sm font-medium" style={{ color: 'var(--text)' }}>
                  Admin
                </Link>
              )}
              <button
                onClick={() => { setMenuOpen(false); signOut({ callbackUrl: '/' }) }}
                className="py-2.5 px-3 rounded-lg text-sm font-medium text-left"
                style={{ color: 'var(--muted)' }}
              >
                Sign out
              </button>
            </>
          ) : (
            <Link href="/sign-in" onClick={() => setMenuOpen(false)}
              className="py-2.5 px-3 rounded-lg text-sm font-semibold font-syne text-white"
              style={{ background: 'var(--accent)' }}>
              Sign in
            </Link>
          )}
        </div>
      )}
    </nav>
  )
}
