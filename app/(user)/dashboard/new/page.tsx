// app/(user)/dashboard/new/page.tsx
import { auth }      from '@/lib/auth'
import { redirect }  from 'next/navigation'
import { DateForm }  from '@/components/countdown/DateForm'
import Link          from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Add a date' }

export default async function NewDatePage() {
  const session = await auth()
  if (!session?.user) redirect('/sign-in')

  return (
    <main className="min-h-screen px-4 py-12">
      <div className="fixed inset-0 pointer-events-none" style={{
        backgroundImage: `linear-gradient(rgba(108,99,255,0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(108,99,255,0.03) 1px, transparent 1px)`,
        backgroundSize: '48px 48px',
      }} />
      <div className="relative z-10 max-w-lg mx-auto">
        <div className="mb-8">
          <Link href="/dashboard" className="text-xs font-mono hover:opacity-70 transition-opacity" style={{ color: 'var(--muted)' }}>
            ← Back to dashboard
          </Link>
          <h1 className="font-syne text-3xl font-bold mt-4">Add a date</h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--muted)' }}>
            We'll remind you (and whoever you're celebrating) before it arrives.
          </p>
        </div>
        <div className="rounded-2xl p-6 sm:p-8" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <DateForm mode="create" />
        </div>
      </div>
    </main>
  )
}
