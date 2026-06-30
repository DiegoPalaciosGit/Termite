import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { logout } from '@/app/login/actions'

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
      <polygon points="10,3 19,20 12,20 3,3" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
      <polygon points="34,3 25,20 32,20 41,3" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
      <circle cx="22" cy="27" r="6.5" stroke="currentColor" strokeWidth="2.5"/>
      <circle cx="22" cy="43" r="11" stroke="currentColor" strokeWidth="2.5"/>
    </svg>
  )
}

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <div className="min-h-dvh bg-linen">
      <header className="bg-white border-b border-warm px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <TermiteLogo className="text-bark" />
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
      <main className="max-w-2xl mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  )
}
