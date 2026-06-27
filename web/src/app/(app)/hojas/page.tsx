import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

const STATUS_BADGE: Record<string, string> = {
  en_proceso: 'bg-blue-100 text-blue-700',
  retrabajo: 'bg-red-100 text-red-700',
  terminado: 'bg-green-100 text-green-700',
}
const STATUS_LABEL: Record<string, string> = {
  en_proceso: 'En proceso',
  retrabajo: 'Retrabajo',
  terminado: 'Terminado',
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
        <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Hojas Viajeras</h2>
        <Link
          href="/hojas/nueva"
          className="bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          + Nueva HV
        </Link>
      </div>

      {sorted.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-lg mb-2">Sin órdenes todavía</p>
          <Link href="/hojas/nueva" className="text-amber-600 hover:underline">
            Crear la primera
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {sorted.map(h => (
            <Link
              key={h.id}
              href={`/hojas/${h.id}`}
              className="block bg-white rounded-xl border border-gray-100 px-4 py-3 hover:border-amber-200 transition-colors"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-mono text-gray-400">{h.folio}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_BADGE[h.status]}`}>
                      {STATUS_LABEL[h.status]}
                    </span>
                  </div>
                  <p className="font-medium text-gray-900 truncate">{h.product_name}</p>
                  <p className="text-sm text-gray-500">
                    {(h.clients as unknown as { name: string } | null)?.name ?? 'Sin cliente'} · ×{h.quantity}
                  </p>
                </div>
                {h.estimated_end_date && (
                  <div className="text-right shrink-0">
                    <p className="text-xs text-gray-400">Entrega</p>
                    <p className="text-sm font-medium text-gray-700">
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
