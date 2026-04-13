// app/page.tsx — Landing page (placeholder, Phase 1)
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Memoriza — Never forget what matters most',
}

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-16 relative">
      {/* Background grid */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(108,99,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(108,99,255,0.03) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
        }}
      />
      {/* Glow */}
      <div
        className="fixed top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at center, rgba(108,99,255,0.1) 0%, transparent 70%)' }}
      />

      <div className="relative z-10 max-w-2xl w-full text-center animate-slide-up">
        <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-8 text-xs font-mono uppercase tracking-widest"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--muted)' }}>
          <span className="w-1.5 h-1.5 rounded-full animate-pulse-soft" style={{ background: 'var(--accent)' }} />
          Never forget what matters most
        </div>

        <h1 className="font-syne text-5xl sm:text-6xl font-bold mb-6 leading-tight">
          Remember every<br />
          <span className="gradient-text">important date</span>
        </h1>

        <p className="text-lg mb-10 max-w-lg mx-auto leading-relaxed" style={{ color: 'var(--muted)' }}>
          Memoriza sends reminder emails to you <em>and</em> the person you want to celebrate —
          plus a beautiful themed countdown page to share.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/sign-in"
            className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-syne font-semibold text-white transition-all hover:opacity-90"
            style={{ background: 'var(--accent)' }}
          >
            Get started free →
          </Link>
          <Link
            href="#how-it-works"
            className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-syne font-semibold transition-all hover:opacity-80"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }}
          >
            How it works
          </Link>
        </div>
      </div>
    </main>
  )
}
