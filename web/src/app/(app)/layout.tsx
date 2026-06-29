import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { logout } from '@/app/login/actions'
import AppNav from '@/app/ui/AppNav'

function TermiteLogo({ className = '' }: { className?: string }) {
  return (
    <svg
      width="18"
      height="23"
      viewBox="0 0 40 50"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={className}
    >
      <line x1="14" y1="15" x2="2" y2="3" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round"/>
      <line x1="26" y1="15" x2="38" y2="3" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round"/>
      <circle cx="20" cy="21" r="7.5" stroke="currentColor" strokeWidth="3.5"/>
      <circle cx="20" cy="37" r="11.5" stroke="currentColor" strokeWidth="3.5"/>
    </svg>
  )
}

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

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
      <AppNav />
      <main className="max-w-2xl mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  )
}
