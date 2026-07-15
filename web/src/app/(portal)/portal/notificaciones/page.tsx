import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import {
  deleteNotificacion,
  deleteNotificacionesPedido,
  deleteAllNotificaciones,
} from '../actions'

type Notif = {
  id: number
  hoja_viajera_id: number
  message: string
  created_at: string
  hojas_viajeras: { folio: string; product_name: string } | null
}

function formatFecha(dt: string) {
  return new Date(dt).toLocaleString('es-MX', {
    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
  })
}

export default async function NotificacionesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data } = await supabase
    .from('client_notifications')
    .select('id, hoja_viajera_id, message, created_at, hojas_viajeras(folio, product_name)')
    .order('created_at', { ascending: false })

  const notifs = (data ?? []) as unknown as Notif[]

  // Agrupar por pedido, en orden de notificación más reciente
  const grupos = new Map<number, Notif[]>()
  for (const n of notifs) {
    const list = grupos.get(n.hoja_viajera_id) ?? []
    list.push(n)
    grupos.set(n.hoja_viajera_id, list)
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-semibold text-bark">Notificaciones</h1>
          <p className="text-sm text-dust mt-0.5">
            {notifs.length === 0
              ? 'Sin notificaciones'
              : `${notifs.length} notificación${notifs.length !== 1 ? 'es' : ''}`}
          </p>
        </div>
        {notifs.length > 0 && (
          <form action={deleteAllNotificaciones}>
            <button
              type="submit"
              className="text-xs text-dust hover:text-rust uppercase tracking-widest transition-colors"
            >
              Eliminar todas
            </button>
          </form>
        )}
      </div>

      {notifs.length === 0 ? (
        <div className="bg-white border border-warm p-8 text-center">
          <p className="text-sm text-dust">
            Aquí verás el avance de tus muebles: cada etapa de producción y cambio de estado.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {[...grupos.entries()].map(([hojaId, items]) => {
            const hoja = items[0].hojas_viajeras
            return (
              <div key={hojaId} className="bg-white border border-warm">
                <div className="flex items-center justify-between px-4 py-3 border-b border-warm bg-linen/50">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xs font-mono text-dust shrink-0">{hoja?.folio}</span>
                    <span className="text-sm font-medium text-bark truncate">{hoja?.product_name}</span>
                  </div>
                  <form action={deleteNotificacionesPedido} className="shrink-0">
                    <input type="hidden" name="hoja_id" value={hojaId} />
                    <button
                      type="submit"
                      className="text-xs text-dust hover:text-rust uppercase tracking-widest transition-colors"
                    >
                      Limpiar
                    </button>
                  </form>
                </div>
                <div>
                  {items.map(n => (
                    <div
                      key={n.id}
                      className="flex items-start justify-between gap-3 px-4 py-3 border-b border-warm/60 last:border-0"
                    >
                      <div className="min-w-0">
                        <p className="text-sm text-bark">{n.message}</p>
                        <p className="text-xs text-dust mt-0.5">{formatFecha(n.created_at)}</p>
                      </div>
                      <form action={deleteNotificacion} className="shrink-0">
                        <input type="hidden" name="id" value={n.id} />
                        <button
                          type="submit"
                          className="text-xs text-dust hover:text-rust transition-colors p-1"
                          aria-label="Eliminar notificación"
                        >
                          ✕
                        </button>
                      </form>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </>
  )
}
