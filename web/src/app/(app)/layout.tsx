import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ClientLayout from './ClientLayout'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const role = (user.user_metadata?.role as string) ?? 'worker'

  return <ClientLayout role={role}>{children}</ClientLayout>
}
