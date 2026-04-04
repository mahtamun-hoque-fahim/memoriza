// components/ui/Navbar.tsx
// Server component wrapper — ThemeToggle is client-only, imported inside

import Link          from 'next/link'
import { ThemeToggle } from './ThemeToggle'

export function Navbar() {
  return (
    <header className="fixed top-0 inset-x-0 z-50 h-14 flex items-center px-4 sm:px-6 border-b border-brand-border bg-brand-bg/80 backdrop-blur-md">
      <div className="flex items-center justify-between w-full max-w-4xl mx-auto">

        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 group"
          aria-label="Memoriza — home"
        >
          <div className="w-7 h-7 rounded-lg bg-brand-accent flex items-center justify-center text-white text-xs font-bold font-syne transition-transform group-hover:scale-105">
            M
          </div>
          <span className="font-syne font-semibold text-brand-text text-sm tracking-wide">
            Memoriza
          </span>
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="hidden sm:inline-flex font-mono text-xs text-brand-muted hover:text-brand-text transition-colors duration-150 uppercase tracking-widest"
          >
            + New
          </Link>
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
