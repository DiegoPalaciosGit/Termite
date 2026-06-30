import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { logout } from '@/app/login/actions'
import AppNav from '@/app/ui/AppNav'

function TermiteLogo() {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src="/termita.png" alt="Termite" width={24} height={24} style={{ objectFit: 'contain' }} />
  )
}

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const role = (user.user_metadata?.role as string) ?? 'worker'

  return (
    <div className="min-h-dvh bg-linen">
      <header className="bg-white border-b border-warm px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <TermiteLogo />
          <span className="font-semibold text-sm text-bark tracking-tight leading-none">termite</span>
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
      <AppNav role={role} />
      <main className="max-w-2xl mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  )
}
