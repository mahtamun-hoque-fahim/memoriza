// app/(auth)/sign-up/page.tsx
// With magic links there's no separate sign-up — first use auto-creates the account.
import { redirect } from 'next/navigation'
export default function SignUpPage() {
  redirect('/sign-in')
}
