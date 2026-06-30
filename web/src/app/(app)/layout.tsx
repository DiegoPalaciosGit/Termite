import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { logout } from '@/app/login/actions'
import AppNav from '@/app/ui/AppNav'

function TermiteLogo({ className = '' }: { className?: string }) {
  return (
    <svg
      width="18"
      height="22"
      viewBox="0 0 44 54"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={className}
    >
      <polygon points="6,2 13,2 19,20 12,20" stroke="currentColor" strokeWidth="3"/>
      <polygon points="38,2 31,2 25,20 32,20" stroke="currentColor" strokeWidth="3"/>
      <circle cx="22" cy="27" r="6.5" stroke="currentColor" strokeWidth="3"/>
      <circle cx="22" cy="43" r="11" stroke="currentColor" strokeWidth="3"/>
    </svg>
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
          <TermiteLogo className="text-bark" />
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
