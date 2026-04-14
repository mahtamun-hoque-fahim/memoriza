// app/(auth)/layout.tsx — layout wrapper for auth pages (no extra nav padding needed)
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
