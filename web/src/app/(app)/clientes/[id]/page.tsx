import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'

const STATUS_BADGE: Record<string, string> = {
  en_proceso: 'bg-terra-light text-terra-text',
  retrabajo:  'bg-rust-light text-rust',
  terminado:  'bg-pine-light text-pine',
}
const STATUS_LABEL: Record<string, string> = {
  en_proceso: 'En proceso',
  retrabajo:  'Retrabajo',
  terminado:  'Terminado',
}

export default async function ClienteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: cliente }, { data: hojas }] = await Promise.all([
    supabase.from('clients').select('*').eq('id', id).single(),
    supabase
      .from('hojas_viajeras')
      .select('id, folio, product_name, quantity, status, estimated_end_date')
      .eq('client_id', id)
      .order('created_at', { ascending: false }),
  ])

  if (!cliente) notFound()

  const activas = (hojas ?? []).filter(h => h.status !== 'terminado').length

  return (
    <>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <Link href="/clientes" className="text-dust hover:text-bark transition-colors">←</Link>
          <div>
            <h1 className="text-lg font-semibold text-bark">{cliente.name}</h1>
            <div className="flex gap-3 mt-0.5">
              {cliente.phone && <p className="text-sm text-umber">{cliente.phone}</p>}
              {cliente.email && <p className="text-sm text-dust">{cliente.email}</p>}
            </div>
          </div>
        </div>
        <Link href={`/clientes/${id}/editar`} className="text-xs text-dust hover:text-bark uppercase tracking-widest shrink-0 transition-colors">
          Editar
        </Link>
      </div>

      {cliente.notes && (
        <div className="bg-terra-light border border-terra/20 px-4 py-2 mb-4 text-sm text-terra-text">
          {cliente.notes}
        </div>
      )}

      <div className="bg-white border border-warm p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-medium text-dust uppercase tracking-widest">Órdenes de producción</p>
          <Link
            href="/hojas/nueva"
            className="text-xs text-terra hover:text-terra-dark uppercase tracking-widest transition-colors"
          >
            + Nueva orden
          </Link>
        </div>

        {(hojas ?? []).length === 0 ? (
          <p className="text-sm text-dust">Sin órdenes todavía.</p>
        ) : (
          <div className="space-y-px">
            {(hojas ?? []).map(h => (
              <Link
                key={h.id}
                href={`/hojas/${h.id}`}
                className="block border border-warm px-3 py-2 hover:bg-linen transition-colors"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs font-mono text-dust">{h.folio}</span>
                      <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${STATUS_BADGE[h.status]}`}>
                        {STATUS_LABEL[h.status]}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-bark truncate">{h.product_name} ×{h.quantity}</p>
                  </div>
                  {h.estimated_end_date && (
                    <p className="text-xs text-dust shrink-0">
                      {new Date(h.estimated_end_date).toLocaleDateString('es-MX', { month: 'short', day: 'numeric' })}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white border border-warm p-4 text-center">
          <p className="text-2xl font-bold text-bark">{(hojas ?? []).length}</p>
          <p className="text-xs text-dust uppercase tracking-widest mt-0.5">Total órdenes</p>
        </div>
        <div className="bg-white border border-warm p-4 text-center">
          <p className={`text-2xl font-bold ${activas > 0 ? 'text-terra' : 'text-bark'}`}>{activas}</p>
          <p className="text-xs text-dust uppercase tracking-widest mt-0.5">En producción</p>
        </div>
      </div>
    </>
  )
}
