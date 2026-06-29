import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { redirect } from 'next/navigation'

type Hoja = {
  id: string
  folio: string
  product_name: string
  quantity: number
  status: string
  estimated_end_date: string | null
  approved_at: string | null
}

const ETAPAS = [
  {
    key: 'pendiente',
    label: 'Pendiente de aprobación',
    statuses: ['pendiente_aprobacion'],
    color: 'text-amber',
    bg: 'bg-amber-light',
    dot: 'bg-amber',
    empty: 'Sin solicitudes pendientes',
  },
  {
    key: 'progreso',
    label: 'En progreso',
    statuses: ['en_proceso', 'retrabajo'],
    color: 'text-terra',
    bg: 'bg-terra-light',
    dot: 'bg-terra',
    empty: 'No hay proyectos en producción ahora',
  },
  {
    key: 'entregado',
    label: 'Entregado',
    statuses: ['terminado'],
    color: 'text-pine',
    bg: 'bg-pine-light',
    dot: 'bg-pine',
    empty: 'Aún no hay proyectos entregados',
  },
]

export default async function PortalPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Obtener cliente vinculado
  const { data: cliente } = await supabase
    .from('clients')
    .select('id, name')
    .eq('user_id', user.id)
    .single()

  // Obtener pedidos del cliente
  const { data: hojas } = await supabase
    .from('hojas_viajeras')
    .select('id, folio, product_name, quantity, status, estimated_end_date, approved_at')
    .eq('client_id', cliente?.id ?? '')
    .order('created_at', { ascending: false })

  const pedidos = (hojas ?? []) as Hoja[]

  return (
    <>
      <div className="mb-6">
        <h1 className="text-lg font-semibold text-bark">Mis pedidos</h1>
        <p className="text-sm text-dust mt-0.5">
          {cliente?.name ?? user.email}
        </p>
      </div>

      <div className="mb-6">
        <Link
          href="/portal/catalogo"
          className="block bg-terra text-white px-4 py-3 text-sm font-medium tracking-wide hover:bg-terra-dark transition-colors text-center"
        >
          + Solicitar nuevo mueble
        </Link>
      </div>

      <div className="space-y-6">
        {ETAPAS.map(etapa => {
          const items = pedidos.filter(h => etapa.statuses.includes(h.status))
          return (
            <div key={etapa.key}>
              <div className="flex items-center gap-2 mb-2">
                <span className={`w-2 h-2 rounded-full ${etapa.dot}`} />
                <p className={`text-xs font-medium uppercase tracking-widest ${etapa.color}`}>
                  {etapa.label}
                </p>
                {items.length > 0 && (
                  <span className="text-xs text-dust">({items.length})</span>
                )}
              </div>

              {items.length === 0 ? (
                <div className="border border-dashed border-warm px-4 py-4 text-sm text-dust">
                  {etapa.empty}
                </div>
              ) : (
                <div className="space-y-px">
                  {items.map(h => (
                    <div key={h.id} className={`border border-warm px-4 py-3 ${etapa.bg}`}>
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-medium text-bark truncate">{h.product_name}</p>
                          <p className="text-xs text-dust mt-0.5 font-mono">{h.folio} · ×{h.quantity}</p>
                          {h.approved_at && etapa.key !== 'pendiente' && (
                            <p className="text-xs text-dust mt-0.5">
                              Aprobado: {new Date(h.approved_at).toLocaleDateString('es-MX', {
                                day: 'numeric', month: 'short', year: 'numeric',
                              })}
                            </p>
                          )}
                        </div>
                        {h.estimated_end_date && (
                          <div className="text-right shrink-0">
                            <p className="text-xs text-dust uppercase tracking-widest">Entrega</p>
                            <p className="text-sm font-semibold text-bark">
                              {new Date(h.estimated_end_date).toLocaleDateString('es-MX', {
                                month: 'short', day: 'numeric',
                              })}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {pedidos.length === 0 && (
        <div className="text-center py-12 text-dust border border-dashed border-warm mt-4">
          <p className="text-sm mb-3">Aún no tienes pedidos</p>
          <Link href="/portal/catalogo" className="text-terra hover:text-terra-dark text-sm font-medium">
            Ver catálogo →
          </Link>
        </div>
      )}
    </>
  )
}
