import { createAdminClient } from '@/lib/supabase/admin'
import { inviteUsuario } from './actions'
import DeleteUserButton from './DeleteUserButton'

const inputCls = 'w-full border border-warm bg-white text-bark text-sm px-3 py-2.5 focus:outline-none focus:border-terra transition-colors placeholder:text-dust'

export default async function UsuariosPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; error?: string }>
}) {
  const { ok, error } = await searchParams
  const admin = createAdminClient()
  const { data } = await admin.auth.admin.listUsers()
  const usuarios = data?.users ?? []

  return (
    <>
      <div className="mb-6">
        <h1 className="text-lg font-semibold text-bark">Equipo</h1>
        <p className="text-sm text-dust mt-0.5">Personas con acceso al sistema</p>
      </div>

      {ok && (
        <div className="bg-pine-light border border-pine/20 px-4 py-3 mb-4 text-sm text-pine font-medium">
          Invitación enviada. El usuario recibirá un correo para crear su contraseña.
        </div>
      )}
      {error && (
        <div className="bg-rust-light border border-rust/20 px-4 py-3 mb-4 text-sm text-rust">
          {error}
        </div>
      )}

      <div className="bg-white border border-warm p-4 mb-6">
        <p className="text-xs font-medium text-dust uppercase tracking-widest mb-3">Agregar al equipo</p>
        <form action={inviteUsuario} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-umber uppercase tracking-widest mb-2">Nombre *</label>
              <input name="nombre" required maxLength={100} placeholder="Juan López" className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-medium text-umber uppercase tracking-widest mb-2">Correo *</label>
              <input name="email" type="email" required maxLength={255} placeholder="juan@escobar.com" className={inputCls} />
            </div>
          </div>
          <button type="submit" className="w-full bg-terra hover:bg-terra-dark text-white font-medium py-2.5 px-4 text-sm tracking-wide transition-colors">
            Enviar invitación
          </button>
        </form>
      </div>

      <div className="space-y-px">
        {usuarios.map(u => (
          <div key={u.id} className="bg-white border border-warm px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="font-medium text-bark truncate">
                  {(u.user_metadata?.nombre as string) ?? u.email?.split('@')[0]}
                </p>
                <p className="text-sm text-dust">{u.email}</p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                  u.email_confirmed_at ? 'bg-pine-light text-pine' : 'bg-amber-light text-amber'
                }`}>
                  {u.email_confirmed_at ? 'Activo' : 'Pendiente'}
                </span>
                <DeleteUserButton userId={u.id} email={u.email ?? ''} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
