import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { registrarEntrada, registrarSalida } from '../actions'

type Movement = {
  id: number
  type: string
  quantity: number
  unit_cost: number
  reference_type: string | null
  notes: string | null
  created_at: string
}

const inputCls = 'w-full border border-warm bg-white text-bark text-sm px-3 py-2.5 focus:outline-none focus:border-terra transition-colors placeholder:text-dust'

export default async function MaterialDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ error?: string }>
}) {
  const { id } = await params
  const { error } = await searchParams
  const supabase = await createClient()

  const [{ data: material }, { data: movements }] = await Promise.all([
    supabase.from('materials').select('*').eq('id', id).single(),
    supabase.from('material_movements').select('*').eq('material_id', id).order('created_at', { ascending: false }).limit(30),
  ])

  if (!material) notFound()

  const isLow = Number(material.stock_current) <= Number(material.stock_min)
  const noPrecio = Number(material.cost_unit) === 0

  return (
    <>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <Link href="/materiales" className="text-dust hover:text-bark transition-colors">←</Link>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono text-dust">{material.code}</span>
              <span className="text-xs px-1.5 py-0.5 bg-warm text-umber font-medium">{material.category}</span>
              {isLow && <span className="text-xs px-1.5 py-0.5 bg-rust-light text-rust font-medium">Stock bajo</span>}
              {noPrecio && <span className="text-xs px-1.5 py-0.5 bg-amber-light text-amber font-medium">Sin precio</span>}
            </div>
            <h1 className="text-lg font-semibold text-bark">{material.name}</h1>
            <p className="text-sm text-umber">${Number(material.cost_unit).toFixed(2)}/{material.unit} · mínimo: {material.stock_min}</p>
          </div>
        </div>
        <Link href={`/materiales/${id}/editar`} className="text-xs text-dust hover:text-bark uppercase tracking-widest shrink-0 transition-colors">Editar</Link>
      </div>

      <div className={`border p-5 mb-4 ${isLow ? 'bg-rust-light border-rust/20' : 'bg-white border-warm'}`}>
        <p className="text-xs font-medium text-dust uppercase tracking-widest mb-1">Existencias actuales</p>
        <p className={`text-5xl font-bold tabular-nums ${isLow ? 'text-rust' : 'text-bark'}`}>
          {Number(material.stock_current)}
        </p>
        <p className="text-sm text-dust mt-1">{material.unit} en stock</p>
      </div>

      {error === 'stock' && (
        <div className="bg-rust-light border border-rust/20 px-4 py-3 mb-4 text-sm text-rust">
          No hay suficiente stock para registrar esa salida.
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div className="bg-white border border-warm p-4">
          <p className="text-xs font-medium text-pine uppercase tracking-widest mb-3">Registrar entrada</p>
          <form action={registrarEntrada} className="space-y-3">
            <input type="hidden" name="material_id" value={id} />
            <div>
              <label className="block text-xs text-umber font-medium mb-2 uppercase tracking-widest">Cantidad ({material.unit}) *</label>
              <input name="quantity" type="number" min="0.001" step="0.001" required className={inputCls} />
            </div>
            <div>
              <label className="block text-xs text-umber font-medium mb-2 uppercase tracking-widest">Costo unitario ($)</label>
              <input name="unit_cost" type="number" min="0" step="0.01" defaultValue={Number(material.cost_unit).toFixed(2)} className={inputCls} />
            </div>
            <div>
              <label className="block text-xs text-umber font-medium mb-2 uppercase tracking-widest">Notas</label>
              <input name="notes" placeholder="Ej. Factura #123" className={inputCls} />
            </div>
            <button type="submit" className="w-full bg-pine hover:bg-pine/90 text-white font-medium py-2.5 text-sm tracking-wide transition-colors">
              Registrar entrada
            </button>
          </form>
        </div>

        <div className="bg-white border border-warm p-4">
          <p className="text-xs font-medium text-rust uppercase tracking-widest mb-3">Registrar salida</p>
          <form action={registrarSalida} className="space-y-3">
            <input type="hidden" name="material_id" value={id} />
            <div>
              <label className="block text-xs text-umber font-medium mb-2 uppercase tracking-widest">Cantidad ({material.unit}) *</label>
              <input name="quantity" type="number" min="0.001" step="0.001" required className={inputCls} />
            </div>
            <div>
              <label className="block text-xs text-umber font-medium mb-2 uppercase tracking-widest">Motivo</label>
              <select name="reference_type" className={inputCls}>
                <option value="manual">Uso en producción</option>
                <option value="ajuste">Ajuste de inventario</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-umber font-medium mb-2 uppercase tracking-widest">Notas</label>
              <input name="notes" placeholder="Opcional" className={inputCls} />
            </div>
            <button type="submit" className="w-full bg-rust hover:bg-rust/90 text-white font-medium py-2.5 text-sm tracking-wide transition-colors">
              Registrar salida
            </button>
          </form>
        </div>
      </div>

      <div className="bg-white border border-warm p-4">
        <p className="text-xs font-medium text-dust uppercase tracking-widest mb-3">Historial de movimientos</p>
        {(movements ?? []).length === 0 ? (
          <p className="text-sm text-dust">Sin movimientos registrados todavía.</p>
        ) : (
          <div>
            {(movements as Movement[]).map(mv => (
              <div key={mv.id} className="flex items-start justify-between gap-3 py-3 border-b border-warm/60 last:border-0">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                      mv.type === 'entrada' ? 'bg-pine-light text-pine' : 'bg-rust-light text-rust'
                    }`}>
                      {mv.type === 'entrada' ? '+ Entrada' : '− Salida'}
                    </span>
                    <span className="text-xs text-dust font-mono">
                      {new Date(mv.created_at).toLocaleDateString('es-MX', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  {mv.notes && <p className="text-xs text-dust">{mv.notes}</p>}
                </div>
                <div className="text-right shrink-0">
                  <p className={`text-base font-bold tabular-nums ${mv.type === 'entrada' ? 'text-pine' : 'text-rust'}`}>
                    {mv.type === 'entrada' ? '+' : '−'}{Number(mv.quantity)} {material.unit}
                  </p>
                  {Number(mv.unit_cost) > 0 && (
                    <p className="text-xs text-dust">${Number(mv.unit_cost).toFixed(2)}/u</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
