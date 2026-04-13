// app/(user)/dashboard/page.tsx — placeholder for Phase 2
import { auth }     from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link         from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Dashboard',
  robots: { index: false },
}

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user) redirect('/sign-in')

  return (
    <main className="min-h-screen px-4 py-12">
      <div className="fixed inset-0 pointer-events-none" style={{
        backgroundImage: `linear-gradient(rgba(108,99,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(108,99,255,0.03) 1px, transparent 1px)`,
        backgroundSize: '48px 48px',
      }} />
      <div className="relative z-10 max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-10">
          <div>
            <p className="font-mono text-xs uppercase tracking-widest mb-1" style={{ color: 'var(--muted)' }}>Your account</p>
            <h1 className="font-syne text-3xl font-bold">Dashboard</h1>
          </div>
          <Link
            href="/dashboard/new"
            className="px-5 py-2.5 rounded-xl font-syne font-semibold text-sm text-white hover:opacity-90 transition-all"
            style={{ background: 'var(--accent)' }}
          >
            + Add date
          </Link>
        </div>

        <div className="rounded-2xl p-12 text-center" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <div className="text-4xl mb-4">📅</div>
          <p className="font-syne font-semibold mb-2">No dates yet</p>
          <p className="text-sm mb-6" style={{ color: 'var(--muted)' }}>
            Add your first important date to get started.
          </p>
          <Link
            href="/dashboard/new"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-syne font-semibold text-sm text-white hover:opacity-90 transition-all"
            style={{ background: 'var(--accent)' }}
          >
            Add a date →
          </Link>
        </div>
      </div>
    </main>
  )
}
