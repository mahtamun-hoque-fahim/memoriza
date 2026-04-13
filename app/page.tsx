// app/page.tsx — Landing page
import Link          from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Memoriza — Never forget what matters most',
  description: 'Send reminder emails to yourself and your loved ones before every important date — plus a beautiful themed countdown page to share.',
}

const FEATURES = [
  {
    icon: '💌',
    title: 'Dual email reminders',
    desc:  'Reminders go to you and the person you're celebrating — 3, 7, or 14 days before.',
  },
  {
    icon: '🎨',
    title: 'Themed countdown pages',
    desc:  'Every date gets a unique shareable link with a theme matched to the occasion.',
  },
  {
    icon: '📅',
    title: 'Recurring dates',
    desc:  'Anniversaries and birthdays repeat every year automatically. Set once, never forget.',
  },
  {
    icon: '📸',
    title: 'Add a photo',
    desc:  'Upload a cover image to make the countdown page personal and memorable.',
  },
]

const OCCASIONS = [
  { icon: '💍', label: 'Anniversary'  },
  { icon: '🎂', label: 'Birthday'     },
  { icon: '💝', label: 'Valentine\'s' },
  { icon: '🎓', label: 'Graduation'   },
  { icon: '🌹', label: 'First date'   },
  { icon: '🏆', label: 'Promotion'    },
  { icon: '🎆', label: 'New Year'     },
  { icon: '✨', label: 'Custom'       },
]

export default function HomePage() {
  return (
    <main className="min-h-screen relative overflow-x-hidden">

      {/* ── Background grid ──────────────────────────────────────────────── */}
      <div className="fixed inset-0 pointer-events-none" style={{
        backgroundImage: `
          linear-gradient(rgba(108,99,255,0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(108,99,255,0.03) 1px, transparent 1px)
        `,
        backgroundSize: '48px 48px',
      }} />
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] pointer-events-none" style={{
        background: 'radial-gradient(ellipse at center, rgba(108,99,255,0.1) 0%, transparent 70%)',
      }} />

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative z-10 flex flex-col items-center text-center px-4 pt-24 pb-20">
        <div
          className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-8 text-xs font-mono uppercase tracking-widest animate-fade-in"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--muted)', animationDelay: '0s' }}
        >
          <span className="w-1.5 h-1.5 rounded-full animate-pulse-soft" style={{ background: 'var(--accent)' }} />
          Smart date reminders
        </div>

        <h1
          className="font-syne text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-tight max-w-3xl animate-slide-up"
          style={{ animationDelay: '0.05s', opacity: 0, animationFillMode: 'forwards' }}
        >
          Never forget what
          <br />
          <span className="gradient-text">matters most</span>
        </h1>

        <p
          className="text-lg sm:text-xl max-w-xl leading-relaxed mb-10 animate-slide-up"
          style={{ color: 'var(--muted)', animationDelay: '0.1s', opacity: 0, animationFillMode: 'forwards' }}
        >
          Memoriza remembers your important dates and sends reminders to
          you <em>and</em> the person you want to celebrate — with a beautiful
          themed countdown page to share.
        </p>

        <div
          className="flex flex-col sm:flex-row gap-4 animate-slide-up"
          style={{ animationDelay: '0.15s', opacity: 0, animationFillMode: 'forwards' }}
        >
          <Link
            href="/sign-in"
            className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-syne font-semibold text-white transition-all hover:opacity-90 hover:scale-[1.02]"
            style={{ background: 'var(--accent)' }}
          >
            Start for free →
          </Link>
          <a
            href="#how-it-works"
            className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-syne font-semibold transition-all hover:opacity-80"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }}
          >
            How it works
          </a>
        </div>
      </section>

      {/* ── Occasions strip ──────────────────────────────────────────────── */}
      <section className="relative z-10 px-4 pb-16">
        <div className="max-w-3xl mx-auto">
          <div className="flex flex-wrap justify-center gap-3">
            {OCCASIONS.map((o) => (
              <div
                key={o.label}
                className="flex items-center gap-2 px-4 py-2 rounded-full text-sm"
                style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--muted)' }}
              >
                <span>{o.icon}</span>
                <span className="font-mono text-xs">{o.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────────────────── */}
      <section id="how-it-works" className="relative z-10 px-4 py-20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <p className="font-mono text-xs uppercase tracking-widest mb-3" style={{ color: 'var(--accent)' }}>
              How it works
            </p>
            <h2 className="font-syne text-3xl sm:text-4xl font-bold">Three steps. Zero forgetting.</h2>
          </div>

          <div className="grid sm:grid-cols-3 gap-6">
            {[
              { step: '01', title: 'Add a date',     desc: 'Enter the event details, choose the occasion type, and set your reminder lead time.' },
              { step: '02', title: 'We send emails', desc: 'Memoriza emails you and your recipient before the date — as many days early as you choose.' },
              { step: '03', title: 'Share the page', desc: 'Every date gets a beautiful themed countdown page with a shareable link.' },
            ].map((item) => (
              <div
                key={item.step}
                className="rounded-2xl p-6 relative overflow-hidden"
                style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
              >
                <span
                  className="absolute top-4 right-5 font-mono text-4xl font-bold opacity-10 select-none"
                  style={{ color: 'var(--accent)' }}
                >
                  {item.step}
                </span>
                <h3 className="font-syne font-semibold text-lg mb-2">{item.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────────────── */}
      <section className="relative z-10 px-4 py-20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <p className="font-mono text-xs uppercase tracking-widest mb-3" style={{ color: 'var(--accent)' }}>
              Features
            </p>
            <h2 className="font-syne text-3xl sm:text-4xl font-bold">Everything you need</h2>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="rounded-2xl p-6"
                style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
              >
                <div className="text-3xl mb-4">{f.icon}</div>
                <h3 className="font-syne font-semibold text-lg mb-2">{f.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <section className="relative z-10 px-4 py-20 text-center">
        <div
          className="max-w-xl mx-auto rounded-3xl p-10 sm:p-14"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
        >
          <div className="text-4xl mb-4">🗓️</div>
          <h2 className="font-syne text-3xl font-bold mb-4">Ready to start remembering?</h2>
          <p className="mb-8 leading-relaxed" style={{ color: 'var(--muted)' }}>
            Sign up free. No credit card required.
          </p>
          <Link
            href="/sign-in"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-syne font-semibold text-white transition-all hover:opacity-90"
            style={{ background: 'var(--accent)' }}
          >
            Get started →
          </Link>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer
        className="relative z-10 text-center py-8 text-xs"
        style={{ color: 'var(--muted)', borderTop: '1px solid var(--border)' }}
      >
        <p>© {new Date().getFullYear()} Memoriza. Built by <a href="https://mahtamunhoquefahim.pages.dev" target="_blank" rel="noopener noreferrer" className="hover:opacity-80 underline">MAHTAMUN</a>.</p>
      </footer>
    </main>
  )
}
