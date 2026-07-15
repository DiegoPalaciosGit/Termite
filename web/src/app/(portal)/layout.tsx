import { getProfile } from '@/lib/supabase/taller'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import PortalShell from './PortalShell'

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  let profile: { taller_id: string; role: string }
  try {
    profile = await getProfile()
  } catch {
    redirect('/login')
  }

  if (profile.role !== 'client') redirect('/dashboard')

  const supabase = await createClient()
  const { count: notifCount } = await supabase
    .from('client_notifications')
    .select('*', { count: 'exact', head: true })

  return <PortalShell notifCount={notifCount ?? 0}>{children}</PortalShell>
}
