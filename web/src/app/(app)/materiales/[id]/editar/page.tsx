import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { updateMaterial } from '../../actions'

const UNITS = ['tablero', 'pza', 'lts', 'kg', 'caja', 'm2']

export default async function EditarMaterialPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: material } = await supabase.from('materials').select('*').eq('id', id).single()
  if (!material) notFound()

  return (
    <>
      <div className="flex items-center gap-3 mb-6">
        <Link href={`/materiales/${id}`} className="text-gray-400 hover:text-gray-600 text-lg">←</Link>
        <div>
          <p className="text-xs font-mono text-gray-400">{material.code}</p>
          <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Editar Material</h2>
        </div>
      </div>

      <form action={updateMaterial} className="bg-white rounded-xl border border-gray-100 p-5 space-y-4 max-w-lg">
        <input type="hidden" name="id" value={id} />

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Código *</label>
            <input name="code" required maxLength={50} defaultValue={material.code}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Categoría *</label>
            <select name="category" required defaultValue={material.category} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-amber-400">
              <option value="A">A — Alta rotación</option>
              <option value="B">B — Media</option>
              <option value="C">C — Baja rotación</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
          <input name="name" required maxLength={255} defaultValue={material.name}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Unidad *</label>
            <select name="unit" required defaultValue={material.unit} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-amber-400">
              {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Precio/u ($MXN)</label>
            <input name="cost_unit" type="number" min="0" step="0.01" defaultValue={Number(material.cost_unit).toFixed(2)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Stock mínimo</label>
          <input name="stock_min" type="number" min="0" step="0.001" defaultValue={Number(material.stock_min)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
          <p className="text-xs text-gray-400 mt-1">Stock actual: {Number(material.stock_current)} {material.unit} (solo cambia vía entradas/salidas)</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
          <textarea name="notes" rows={2} defaultValue={material.notes ?? ''}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none" />
        </div>

        <button type="submit" className="w-full bg-amber-500 hover:bg-amber-600 text-white font-medium py-2.5 rounded-lg transition-colors">
          Guardar cambios
        </button>
      </form>
    </>
  )
}
