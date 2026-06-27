import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

const SEMAFORO: Record<string, { dot: string; label: string; text: string }> = {
  verde:    { dot: 'bg-green-500',  label: 'Rentable',    text: 'text-green-700' },
  amarillo: { dot: 'bg-yellow-400', label: 'Apretado',    text: 'text-yellow-700' },
  rojo:     { dot: 'bg-red-500',    label: 'Bajo margen', text: 'text-red-700' },
  gris:     { dot: 'bg-gray-300',   label: 'Sin datos',   text: 'text-gray-400' },
}

export default async function CostosPage() {
  const supabase = await createClient()

  const [{ data: productos }, { data: config }] = await Promise.all([
    supabase.from('products_catalog').select('*').eq('is_active', true).order('name'),
    supabase.from('shop_config').select('min_margin_pct').single(),
  ])

  const minMargin = Number(config?.min_margin_pct ?? 35)

  return (
    <>
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Semáforo de Rentabilidad</h2>
        <Link
          href="/costos/nuevo"
          className="bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          + Producto
        </Link>
      </div>
      <p className="text-xs text-gray-400 mb-6">
        Margen mínimo configurado: <span className="font-medium text-gray-600">{minMargin}%</span>
        {' · '}
        <Link href="/costos/config" className="text-amber-600 hover:underline">Configurar taller</Link>
      </p>

      {(productos ?? []).length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="mb-2">Sin productos en el catálogo</p>
          <Link href="/costos/nuevo" className="text-amber-600 hover:underline">Agregar el primero</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {(productos ?? []).map(p => {
            const s = SEMAFORO[p.margin_status ?? 'gris'] ?? SEMAFORO.gris
            return (
              <Link
                key={p.id}
                href={`/costos/${p.id}/editar`}
                className="block bg-white rounded-xl border border-gray-100 px-4 py-4 hover:border-amber-200 transition-colors"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-gray-900 truncate mb-1">{p.name}</p>
                    <div className="flex gap-4 text-sm text-gray-500">
                      <span>Venta: <span className="font-medium text-gray-700">${Number(p.sale_price).toLocaleString('es-MX')}</span></span>
                      <span>Costo: <span className="font-medium text-gray-700">${Number(p.estimated_cost).toLocaleString('es-MX')}</span></span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="flex items-center gap-2 justify-end mb-0.5">
                      <span className={`w-3 h-3 rounded-full ${s.dot}`} />
                      <span className={`text-sm font-semibold ${s.text}`}>
                        {p.margin_status === 'gris' ? s.label : `${Number(p.margin_pct).toFixed(1)}%`}
                      </span>
                    </div>
                    <p className={`text-xs ${s.text}`}>{s.label}</p>
                  </div>
                </div>
                {p.margin_status === 'gris' && (
                  <p className="text-xs text-gray-400 mt-2">Ingresa precio de venta y costo estimado para ver el semáforo</p>
                )}
              </Link>
            )
          })}
        </div>
      )}
    </>
  )
}
