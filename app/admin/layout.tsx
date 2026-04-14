// app/admin/layout.tsx — shared layout for all /admin/* pages
import { auth }     from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link         from 'next/link'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (session?.user?.role !== 'admin') redirect('/')

  return (
    <div className="min-h-screen">
      {/* Admin sub-nav */}
      <div
        className="sticky top-14 z-40 px-4 sm:px-6"
        style={{ background: 'rgba(10,12,16,0.9)', backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--border)' }}
      >
        <div className="max-w-7xl mx-auto flex items-center gap-1 h-11">
          <span className="font-mono text-xs uppercase tracking-widest mr-4 flex-shrink-0" style={{ color: 'var(--accent)' }}>
            Admin
          </span>
          {[
            { href: '/admin',        label: 'Overview' },
            { href: '/admin/users',  label: 'Users'    },
            { href: '/admin/dates',  label: 'Dates'    },
            { href: '/admin/emails', label: 'Emails'   },
          ].map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="px-3 py-1.5 rounded-lg text-xs font-mono transition-colors hover:opacity-80"
              style={{ color: 'var(--muted)' }}
            >
              {label}
            </Link>
          ))}
        </div>
      </div>

      {/* Page content */}
      <div>{children}</div>
    </div>
  )
}
