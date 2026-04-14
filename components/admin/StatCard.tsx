// components/admin/StatCard.tsx
interface Props {
  label: string
  value: string | number
  sub?:  string
  accent?: string
}

export function StatCard({ label, value, sub, accent = 'var(--accent)' }: Props) {
  return (
    <div
      className="rounded-2xl p-5"
      style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
    >
      <p className="font-mono text-xs uppercase tracking-wider mb-3" style={{ color: 'var(--muted)' }}>
        {label}
      </p>
      <p className="font-syne text-3xl font-bold" style={{ color: accent }}>
        {value}
      </p>
      {sub && (
        <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>{sub}</p>
      )}
    </div>
  )
}
