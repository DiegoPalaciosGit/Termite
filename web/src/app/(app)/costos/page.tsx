import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

const SEMAFORO: Record<string, { dot: string; label: string; text: string; bg: string }> = {
  verde:    { dot: 'bg-pine',    label: 'Rentable',    text: 'text-pine',   bg: 'bg-pine-light' },
  amarillo: { dot: 'bg-amber',   label: 'Apretado',    text: 'text-amber',  bg: 'bg-amber-light' },
  rojo:     { dot: 'bg-rust',    label: 'Bajo margen', text: 'text-rust',   bg: 'bg-rust-light' },
  gris:     { dot: 'bg-warm',    label: 'Sin datos',   text: 'text-dust',   bg: 'bg-white' },
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
        <div>
          <h1 className="text-lg font-semibold text-bark">Rentabilidad</h1>
          <p className="text-sm text-dust mt-0.5">¿Cuánto gana el taller por cada producto?</p>
        </div>
        <Link
          href="/costos/nuevo"
          className="bg-terra hover:bg-terra-dark text-white font-medium py-2 px-4 text-xs tracking-wide transition-colors shrink-0"
        >
          + Producto
        </Link>
      </div>
      <p className="text-xs text-dust mb-6">
        Margen mínimo: <span className="font-semibold text-umber">{minMargin}%</span>
        {' · '}
        <Link href="/costos/config" className="text-terra hover:text-terra-dark">Ajustar configuración</Link>
      </p>

      {(productos ?? []).length === 0 ? (
        <div className="text-center py-16 text-dust border border-dashed border-warm">
          <p className="text-sm mb-2">Sin productos en el catálogo</p>
          <Link href="/costos/nuevo" className="text-terra hover:text-terra-dark text-sm font-medium">Agregar el primero →</Link>
        </div>
      ) : (
        <div className="space-y-px">
          {(productos ?? []).map(p => {
            const s = SEMAFORO[p.margin_status ?? 'gris'] ?? SEMAFORO.gris
            return (
              <Link
                key={p.id}
                href={`/costos/${p.id}/editar`}
                className="block bg-white border border-warm px-4 py-4 hover:bg-linen transition-colors"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-bark truncate mb-1">{p.name}</p>
                    <div className="flex gap-4 text-sm text-umber">
                      <span>Venta: <span className="font-semibold text-bark">${Number(p.sale_price).toLocaleString('es-MX')}</span></span>
                      <span>Costo: <span className="font-semibold text-bark">${Number(p.estimated_cost).toLocaleString('es-MX')}</span></span>
                    </div>
                  </div>
                  <div className={`text-right shrink-0 px-3 py-2 ${s.bg}`}>
                    <div className="flex items-center gap-1.5 justify-end mb-0.5">
                      <span className={`w-2 h-2 rounded-full ${s.dot}`} />
                      <span className={`text-sm font-bold ${s.text}`}>
                        {p.margin_status === 'gris' ? '—' : `${Number(p.margin_pct).toFixed(1)}%`}
                      </span>
                    </div>
                    <p className={`text-xs font-medium ${s.text}`}>{s.label}</p>
                  </div>
                </div>
                {p.margin_status === 'gris' && (
                  <p className="text-xs text-dust mt-2">Ingresa precio y costo para calcular el margen</p>
                )}
              </Link>
            )
          })}
        </div>
      )}
    </>
  )
}
