import { redirect } from 'next/navigation'
import { getProfile } from '@/lib/supabase/taller'
import ClientLayout from './ClientLayout'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  let profile: { taller_id: string; role: string }
  try {
    profile = await getProfile()
  } catch {
    redirect('/login')
  }

  if (profile.role === 'client') redirect('/portal')

  return <ClientLayout role={profile.role}>{children}</ClientLayout>
}
