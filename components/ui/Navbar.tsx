// components/ui/Navbar.tsx
import Link             from 'next/link'
import { ThemeToggle }  from './ThemeToggle'
import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs'

export function Navbar() {
  return (
    <header className="fixed top-0 inset-x-0 z-50 h-14 flex items-center px-4 sm:px-6 border-b backdrop-blur-md"
      style={{ borderColor: 'var(--border)', backgroundColor: 'rgba(10,12,16,0.80)' }}>
      <div className="flex items-center justify-between w-full max-w-4xl mx-auto">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group" aria-label="Memoriza — home">
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
          <SignedIn>
            <Link href="/dashboard"
              className="hidden sm:inline-flex font-mono text-xs uppercase tracking-widest transition-colors duration-150"
              style={{ color: 'var(--muted)' }}>
              Dashboard
            </Link>
          </SignedIn>

          <Link href="/"
            className="hidden sm:inline-flex font-mono text-xs uppercase tracking-widest transition-colors duration-150"
            style={{ color: 'var(--muted)' }}>
            + New
          </Link>

          <ThemeToggle />

          <SignedIn>
            <UserButton
              afterSignOutUrl="/"
              appearance={{
                variables: {
                  colorPrimary:    '#6C63FF',
                  colorBackground: '#131720',
                  colorText:       '#F2F2F5',
                  borderRadius:    '8px',
                },
              }}
            />
          </SignedIn>

          <SignedOut>
            <Link href="/sign-in"
              className="font-mono text-xs px-3 py-1.5 rounded-lg border transition-colors duration-150"
              style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}>
              Sign in
            </Link>
          </SignedOut>
        </div>
      </div>
    </header>
  )
}
