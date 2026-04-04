// app/page.tsx
import { CreateForm } from '@/components/countdown/CreateForm'

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-16">

      {/* ── Background grid decoration ─────────────────────────────────── */}
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

      {/* ── Glow orb ──────────────────────────────────────────────────── */}
      <div
        className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(108,99,255,0.12) 0%, transparent 70%)',
        }}
      />

      <div className="relative z-10 w-full max-w-lg">

        {/* ── Header ──────────────────────────────────────────────────── */}
        <div className="text-center mb-12 animate-slide-up">
          <div className="inline-flex items-center gap-2 bg-brand-surface border border-brand-border rounded-full px-4 py-1.5 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-accent animate-pulse" />
            <span className="font-mono text-xs text-brand-muted uppercase tracking-widest">
              Free · No account needed
            </span>
          </div>

          <h1 className="font-syne text-4xl sm:text-5xl font-bold mb-4 leading-tight">
            Count down to{' '}
            <span className="gradient-text">any moment</span>
          </h1>
          <p className="text-brand-muted text-base sm:text-lg leading-relaxed">
            Create a shareable countdown for birthdays, launches,
            anniversaries — anything worth the wait.
          </p>
        </div>

        {/* ── Form card ───────────────────────────────────────────────── */}
        <div
          className="bg-brand-surface border border-brand-border rounded-2xl p-6 sm:p-8 animate-slide-up"
          style={{ animationDelay: '0.1s', opacity: 0, animationFillMode: 'forwards' }}
        >
          <CreateForm />
        </div>

        {/* ── Footer note ─────────────────────────────────────────────── */}
        <p
          className="text-center text-xs text-brand-muted mt-6 animate-fade-in"
          style={{ animationDelay: '0.3s', opacity: 0, animationFillMode: 'forwards' }}
        >
          Up to 10 active countdowns per device. Links never expire.
        </p>
      </div>
    </main>
  )
}
