import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { updateProducto } from '../../actions'

const SEMAFORO_STYLE: Record<string, { label: string; bg: string; text: string }> = {
  verde:    { label: 'Rentable',         bg: 'bg-pine-light',  text: 'text-pine' },
  amarillo: { label: 'Margen apretado',  bg: 'bg-amber-light', text: 'text-amber' },
  rojo:     { label: 'Bajo margen',      bg: 'bg-rust-light',  text: 'text-rust' },
  gris:     { label: 'Sin datos',        bg: 'bg-warm',        text: 'text-dust' },
}

const inputCls = 'w-full border border-warm bg-white text-bark text-sm px-3 py-2.5 focus:outline-none focus:border-terra transition-colors placeholder:text-dust'

export default async function EditarProductoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: producto }, { data: config }] = await Promise.all([
    supabase.from('products_catalog').select('*').eq('id', id).single(),
    supabase.from('shop_config').select('min_margin_pct').single(),
  ])

  if (!producto) notFound()

  const minMargin = Number(config?.min_margin_pct ?? 35)
  const s = SEMAFORO_STYLE[producto.margin_status ?? 'gris'] ?? SEMAFORO_STYLE.gris

  return (
    <>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/costos" className="text-dust hover:text-bark transition-colors">←</Link>
        <p className="text-xs font-medium text-dust uppercase tracking-widest">Editar Producto</p>
      </div>

      <div className={`border border-warm p-4 mb-4 ${s.bg}`}>
        <p className="text-xs font-medium text-dust uppercase tracking-widest mb-1">Rentabilidad actual · mín. {minMargin}%</p>
        <p className={`text-lg font-semibold ${s.text}`}>{s.label}</p>
        {producto.margin_status !== 'gris' && (
          <p className={`text-sm ${s.text}`}>Margen: {Number(producto.margin_pct).toFixed(1)}%</p>
        )}
      </div>

      <form action={updateProducto} className="bg-white border border-warm p-5 space-y-5">
        <input type="hidden" name="id" value={id} />

        <div>
          <label className="block text-xs font-medium text-umber uppercase tracking-widest mb-2">Nombre *</label>
          <input name="name" required maxLength={255} defaultValue={producto.name} className={inputCls} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-umber uppercase tracking-widest mb-2">Precio de venta ($)</label>
            <input name="sale_price" type="number" min="0" step="0.01" defaultValue={Number(producto.sale_price).toFixed(2)} className={inputCls} />
          </div>
          <div>
            <label className="block text-xs font-medium text-umber uppercase tracking-widest mb-2">Costo estimado ($)</label>
            <input name="estimated_cost" type="number" min="0" step="0.01" defaultValue={Number(producto.estimated_cost).toFixed(2)} className={inputCls} />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-umber uppercase tracking-widest mb-2">Notas</label>
          <textarea name="notes" rows={2} defaultValue={producto.notes ?? ''} className={`${inputCls} resize-none`} />
        </div>

        <button type="submit" className="w-full bg-terra hover:bg-terra-dark text-white font-medium py-2.5 px-4 text-sm tracking-wide transition-colors">
          Guardar y recalcular
        </button>
      </form>
    </>
  )
}
