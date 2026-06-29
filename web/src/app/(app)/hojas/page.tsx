import { createClient } from '@/lib/supabase/server'
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
const STATUS_ORDER: Record<string, number> = {
  retrabajo: 0,
  en_proceso: 1,
  terminado: 2,
}

export default async function HojasPage() {
  const supabase = await createClient()

  const { data: hojas } = await supabase
    .from('hojas_viajeras')
    .select('id, folio, product_name, quantity, status, estimated_end_date, clients(name)')
    .order('created_at', { ascending: false })

  const sorted = [...(hojas ?? [])].sort(
    (a, b) => (STATUS_ORDER[a.status] ?? 1) - (STATUS_ORDER[b.status] ?? 1)
  )

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-semibold text-bark">Órdenes de Trabajo</h1>
          <p className="text-sm text-dust mt-0.5">Seguimiento de cada pieza en producción</p>
        </div>
        <Link
          href="/hojas/nueva"
          className="bg-terra hover:bg-terra-dark text-white font-medium py-2 px-4 text-xs tracking-wide transition-colors shrink-0"
        >
          + Nueva orden
        </Link>
      </div>

      {sorted.length === 0 ? (
        <div className="text-center py-16 text-dust border border-dashed border-warm">
          <p className="text-sm mb-2">Aún no hay órdenes registradas</p>
          <Link href="/hojas/nueva" className="text-terra hover:text-terra-dark text-sm font-medium">
            Crear la primera orden →
          </Link>
        </div>
      ) : (
        <div className="space-y-px">
          {sorted.map(h => (
            <Link
              key={h.id}
              href={`/hojas/${h.id}`}
              className="block bg-white border border-warm px-4 py-3 hover:bg-linen transition-colors"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono text-dust">{h.folio}</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${STATUS_BADGE[h.status]}`}>
                      {STATUS_LABEL[h.status]}
                    </span>
                  </div>
                  <p className="font-medium text-bark truncate">{h.product_name}</p>
                  <p className="text-sm text-umber">
                    {(h.clients as unknown as { name: string } | null)?.name ?? 'Sin cliente'} · ×{h.quantity}
                  </p>
                </div>
                {h.estimated_end_date && (
                  <div className="text-right shrink-0">
                    <p className="text-xs text-dust uppercase tracking-widest">Entrega</p>
                    <p className="text-sm font-semibold text-bark">
                      {new Date(h.estimated_end_date).toLocaleDateString('es-MX', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  )
}
