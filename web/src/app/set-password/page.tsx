'use client'
import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'

function TermiteLogo() {
  return (
    <svg
      width="36"
      height="46"
      viewBox="0 0 40 50"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <line x1="14" y1="15" x2="2" y2="3" stroke="#3B2A1A" strokeWidth="3.5" strokeLinecap="round"/>
      <line x1="26" y1="15" x2="38" y2="3" stroke="#3B2A1A" strokeWidth="3.5" strokeLinecap="round"/>
      <circle cx="20" cy="21" r="7.5" stroke="#3B2A1A" strokeWidth="3.5"/>
      <circle cx="20" cy="37" r="11.5" stroke="#3B2A1A" strokeWidth="3.5"/>
    </svg>
  )
}

export default function SetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [ready, setReady] = useState(false)
  const router = useRouter()

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    async function init() {
      const searchParams = new URLSearchParams(window.location.search)
      const code = searchParams.get('code')

      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (error) setError('Enlace expirado. Pide una nueva invitación.')
        else setReady(true)
        return
      }

      const hashParams = new URLSearchParams(window.location.hash.substring(1))
      const accessToken = hashParams.get('access_token')
      const refreshToken = hashParams.get('refresh_token')

      if (accessToken && refreshToken) {
        await supabase.auth.signOut()
        const { error } = await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken })
        if (error) setError('Enlace expirado. Pide una nueva invitación.')
        else setReady(true)
        return
      }

      setError('Enlace inválido o expirado. Pide una nueva invitación.')
    }

    init()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password !== confirm) { setError('Las contraseñas no coinciden'); return }
    if (password.length < 8) { setError('Mínimo 8 caracteres'); return }
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.updateUser({ password })
    if (error) { setError(error.message); setLoading(false); return }
    router.push('/dashboard')
  }

  const inputCls = 'w-full px-0 py-2.5 border-0 border-b border-warm bg-transparent text-bark text-sm focus:outline-none focus:border-bark transition-colors placeholder:text-dust'

  return (
    <div className="min-h-screen bg-linen flex items-center justify-center p-6">
      <div className="w-full max-w-xs">
        <div className="mb-10">
          <div className="flex justify-center mb-6">
            <TermiteLogo />
          </div>
          <h1 className="text-lg font-semibold text-bark tracking-tight">Crear contraseña</h1>
          <p className="text-sm text-dust mt-1">termite · Carpintería Escobar</p>
        </div>

        {!ready && !error && <p className="text-sm text-dust">Verificando enlace...</p>}
        {error && <p className="text-sm text-rust">{error}</p>}

        {ready && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-medium text-umber uppercase tracking-widest mb-2">
                Contraseña nueva
              </label>
              <input type="password" required minLength={8} value={password}
                onChange={e => setPassword(e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-medium text-umber uppercase tracking-widest mb-2">
                Confirmar contraseña
              </label>
              <input type="password" required value={confirm}
                onChange={e => setConfirm(e.target.value)} className={inputCls} />
            </div>
            {error && <p className="text-xs text-rust">{error}</p>}
            <button type="submit" disabled={loading}
              className="w-full bg-terra hover:bg-terra-dark text-white font-medium py-2.5 px-4 text-sm tracking-wide transition-colors disabled:opacity-50">
              {loading ? 'Guardando...' : 'Crear contraseña'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
