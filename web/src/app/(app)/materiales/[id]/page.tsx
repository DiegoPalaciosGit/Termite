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
          <Link href="/materiales" className="text-gray-400 hover:text-gray-600 text-lg">←</Link>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-xs font-mono text-gray-400">{material.code}</span>
              <span className="text-xs px-1.5 py-0.5 rounded bg-gray-100 text-gray-500">{material.category}</span>
              {isLow && <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-medium">En alerta</span>}
              {noPrecio && <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-medium">Precio pendiente</span>}
            </div>
            <h1 className="text-xl font-bold text-gray-900">{material.name}</h1>
            <p className="text-sm text-gray-500">${Number(material.cost_unit).toFixed(2)}/{material.unit} · mín. {material.stock_min}</p>
          </div>
        </div>
        <Link href={`/materiales/${id}/editar`} className="text-sm text-amber-600 hover:underline shrink-0">Editar</Link>
      </div>

      {/* Stock actual */}
      <div className={`rounded-xl border p-5 mb-4 ${isLow ? 'bg-red-50 border-red-200' : 'bg-white border-gray-100'}`}>
        <p className="text-sm text-gray-500 mb-1">Stock actual</p>
        <p className={`text-5xl font-bold ${isLow ? 'text-red-600' : 'text-gray-900'}`}>
          {Number(material.stock_current)}
        </p>
        <p className="text-sm text-gray-400 mt-1">{material.unit}</p>
      </div>

      {error === 'stock' && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4 text-sm text-red-700">
          Stock insuficiente para registrar esa salida.
        </div>
      )}

      {/* Entrada / Salida forms */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <h3 className="text-sm font-semibold text-green-700 mb-3">+ Entrada</h3>
          <form action={registrarEntrada} className="space-y-3">
            <input type="hidden" name="material_id" value={id} />
            <div>
              <label className="block text-xs text-gray-500 mb-1">Cantidad ({material.unit}) *</label>
              <input name="quantity" type="number" min="0.001" step="0.001" required
                className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Costo unitario ($) *</label>
              <input name="unit_cost" type="number" min="0" step="0.01" defaultValue={Number(material.cost_unit).toFixed(2)}
                className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Notas</label>
              <input name="notes" placeholder="Ej. Factura #123"
                className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400" />
            </div>
            <button type="submit" className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-2 rounded-lg text-sm transition-colors">
              Registrar entrada
            </button>
          </form>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <h3 className="text-sm font-semibold text-red-700 mb-3">− Salida</h3>
          <form action={registrarSalida} className="space-y-3">
            <input type="hidden" name="material_id" value={id} />
            <div>
              <label className="block text-xs text-gray-500 mb-1">Cantidad ({material.unit}) *</label>
              <input name="quantity" type="number" min="0.001" step="0.001" required
                className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Tipo</label>
              <select name="reference_type" className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-red-400">
                <option value="manual">Manual / Uso en taller</option>
                <option value="ajuste">Ajuste de inventario</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Notas</label>
              <input name="notes" placeholder="Opcional"
                className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400" />
            </div>
            <button type="submit" className="w-full bg-red-500 hover:bg-red-600 text-white font-medium py-2 rounded-lg text-sm transition-colors">
              Registrar salida
            </button>
          </form>
        </div>
      </div>

      {/* Movements history */}
      <div className="bg-white rounded-xl border border-gray-100 p-4">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Historial de movimientos</h3>
        {(movements ?? []).length === 0 ? (
          <p className="text-sm text-gray-400">Sin movimientos registrados.</p>
        ) : (
          <div className="overflow-x-auto -mx-1">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-400 border-b border-gray-100">
                  <th className="pb-2 pr-3 font-medium">Fecha</th>
                  <th className="pb-2 pr-3 font-medium">Tipo</th>
                  <th className="pb-2 pr-3 font-medium">Cant.</th>
                  <th className="pb-2 pr-3 font-medium">$/u</th>
                  <th className="pb-2 font-medium">Notas</th>
                </tr>
              </thead>
              <tbody>
                {(movements as Movement[]).map(mv => (
                  <tr key={mv.id} className="border-b border-gray-50 last:border-0">
                    <td className="py-2 pr-3 text-xs text-gray-400 whitespace-nowrap">
                      {new Date(mv.created_at).toLocaleDateString('es-MX', { month: 'short', day: 'numeric' })}
                    </td>
                    <td className="py-2 pr-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        mv.type === 'entrada' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {mv.type === 'entrada' ? '+' : '−'} {mv.type}
                      </span>
                    </td>
                    <td className="py-2 pr-3 font-medium text-gray-700">{Number(mv.quantity)}</td>
                    <td className="py-2 pr-3 text-gray-500">${Number(mv.unit_cost).toFixed(2)}</td>
                    <td className="py-2 text-gray-400 text-xs">{mv.notes ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  )
}
