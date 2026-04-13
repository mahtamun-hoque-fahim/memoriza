// app/admin/page.tsx — admin dashboard (Phase 4)
import { auth }     from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function AdminPage() {
  const session = await auth()
  if (session?.user?.role !== 'admin') redirect('/')

  return (
    <main className="min-h-screen px-4 py-12">
      <div className="max-w-6xl mx-auto">
        <h1 className="font-syne text-3xl font-bold mb-2">Admin</h1>
        <p style={{ color: 'var(--muted)' }}>Phase 4 — coming soon.</p>
      </div>
    </main>
  )
}
