// app/not-found.tsx
import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 text-center gap-6">
      <div
        className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(108,99,255,0.08) 0%, transparent 70%)',
        }}
      />

      <p className="font-mono text-xs text-brand-muted uppercase tracking-widest">404</p>

      <h1 className="font-syne text-3xl sm:text-4xl font-bold text-brand-text">
        Countdown not found
      </h1>

      <p className="text-brand-muted text-base max-w-sm leading-relaxed">
        This countdown link doesn&apos;t exist or may have been deleted.
        Double-check the URL or create a new one.
      </p>

      <Link
        href="/"
        className="
          inline-flex items-center gap-2 bg-brand-accent text-white
          font-syne font-semibold px-6 py-3 rounded-xl
          hover:bg-brand-accent/90 transition-colors duration-150
        "
      >
        → Create a countdown
      </Link>
    </main>
  )
}
