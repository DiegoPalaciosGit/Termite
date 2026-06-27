import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { updateProducto } from '../../actions'

const SEMAFORO_LABEL: Record<string, string> = {
  verde: '🟢 Rentable', amarillo: '🟡 Margen apretado', rojo: '🔴 Bajo margen', gris: '⚪ Sin datos',
}

export default async function EditarProductoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: producto }, { data: config }] = await Promise.all([
    supabase.from('products_catalog').select('*').eq('id', id).single(),
    supabase.from('shop_config').select('min_margin_pct').single(),
  ])

  if (!producto) notFound()

  const minMargin = Number(config?.min_margin_pct ?? 35)

  return (
    <>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/costos" className="text-gray-400 hover:text-gray-600 text-lg">←</Link>
        <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Editar Producto</h2>
      </div>

      {/* Current semaforo */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 mb-4">
        <p className="text-xs text-gray-400 mb-1">Semáforo actual · margen mínimo {minMargin}%</p>
        <p className="text-lg font-semibold">{SEMAFORO_LABEL[producto.margin_status ?? 'gris']}</p>
        {producto.margin_status !== 'gris' && (
          <p className="text-sm text-gray-500">Margen: {Number(producto.margin_pct).toFixed(1)}%</p>
        )}
      </div>

      <form action={updateProducto} className="bg-white rounded-xl border border-gray-100 p-5 space-y-4 max-w-lg">
        <input type="hidden" name="id" value={id} />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
          <input name="name" required maxLength={255} defaultValue={producto.name}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Precio de venta ($)</label>
            <input name="sale_price" type="number" min="0" step="0.01" defaultValue={Number(producto.sale_price).toFixed(2)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Costo estimado ($)</label>
            <input name="estimated_cost" type="number" min="0" step="0.01" defaultValue={Number(producto.estimated_cost).toFixed(2)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
          <textarea name="notes" rows={2} defaultValue={producto.notes ?? ''}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none" />
        </div>

        <button type="submit" className="w-full bg-amber-500 hover:bg-amber-600 text-white font-medium py-2.5 rounded-lg transition-colors">
          Guardar y recalcular
        </button>
      </form>
    </>
  )
}
