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

  return <ClientLayout role={profile.role}>{children}</ClientLayout>
}
