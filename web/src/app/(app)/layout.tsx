import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { logout } from '@/app/login/actions'
import AppNav from '@/app/ui/AppNav'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <div className="min-h-screen bg-amber-50">
      <header className="bg-white border-b border-amber-100 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <span className="font-bold text-gray-900">Termite · Escobar</span>
        <form action={logout}>
          <button type="submit" className="text-sm text-gray-500 hover:text-gray-700">
            Salir
          </button>
        </form>
      </header>
      <AppNav />
      <main className="max-w-4xl mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  )
}
