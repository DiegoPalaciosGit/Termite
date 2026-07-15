import { getProfile } from '@/lib/supabase/taller'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { logout } from '@/app/login/actions'
import PortalNav from './PortalNav'

function TermiteLogo() {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src="/termita.svg" alt="Termite" width={28} height={28} />
  )
}

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

  return (
    <div className="min-h-dvh bg-linen">
      <header className="bg-white border-b border-warm px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <TermiteLogo />
          <div>
            <span className="font-semibold text-sm text-bark tracking-tight leading-none">termite</span>
            <span className="text-dust text-xs ml-2">· Portal de clientes</span>
          </div>
        </div>
        <form action={logout}>
          <button
            type="submit"
            className="text-xs text-dust hover:text-bark transition-colors uppercase tracking-widest"
          >
            Salir
          </button>
        </form>
      </header>
      <PortalNav notifCount={notifCount ?? 0} />
      <main className="max-w-2xl mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  )
}
