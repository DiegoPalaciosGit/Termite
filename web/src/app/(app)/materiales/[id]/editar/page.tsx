import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { updateMaterial } from '../../actions'

const UNITS = ['tablero', 'pza', 'lts', 'kg', 'caja', 'm2']
const inputCls = 'w-full border border-warm bg-white text-bark text-sm px-3 py-2.5 focus:outline-none focus:border-terra transition-colors placeholder:text-dust'

export default async function EditarMaterialPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: material } = await supabase.from('materials').select('*').eq('id', id).single()
  if (!material) notFound()

  return (
    <>
      <div className="flex items-center gap-3 mb-6">
        <Link href={`/materiales/${id}`} className="text-dust hover:text-bark transition-colors">←</Link>
        <div>
          <p className="text-xs font-mono text-dust">{material.code}</p>
          <p className="text-xs font-medium text-dust uppercase tracking-widest">Editar Material</p>
        </div>
      </div>

      <form action={updateMaterial} className="bg-white border border-warm p-5 space-y-5">
        <input type="hidden" name="id" value={id} />

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-umber uppercase tracking-widest mb-2">Código *</label>
            <input name="code" required maxLength={50} defaultValue={material.code} className={inputCls} />
          </div>
          <div>
            <label className="block text-xs font-medium text-umber uppercase tracking-widest mb-2">Categoría *</label>
            <select name="category" required defaultValue={material.category} className={inputCls}>
              <option value="A">A — Alta rotación</option>
              <option value="B">B — Media</option>
              <option value="C">C — Baja rotación</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-umber uppercase tracking-widest mb-2">Nombre *</label>
          <input name="name" required maxLength={255} defaultValue={material.name} className={inputCls} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-umber uppercase tracking-widest mb-2">Unidad *</label>
            <select name="unit" required defaultValue={material.unit} className={inputCls}>
              {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-umber uppercase tracking-widest mb-2">Precio/u ($MXN)</label>
            <input name="cost_unit" type="number" min="0" step="0.01" defaultValue={Number(material.cost_unit).toFixed(2)} className={inputCls} />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-umber uppercase tracking-widest mb-2">Stock mínimo</label>
          <input name="stock_min" type="number" min="0" step="0.001" defaultValue={Number(material.stock_min)} className={inputCls} />
          <p className="text-xs text-dust mt-1.5">Stock actual: {Number(material.stock_current)} {material.unit} — cambia solo vía entradas/salidas</p>
        </div>

        <div>
          <label className="block text-xs font-medium text-umber uppercase tracking-widest mb-2">Notas</label>
          <textarea name="notes" rows={2} defaultValue={material.notes ?? ''} className={`${inputCls} resize-none`} />
        </div>

        <button type="submit" className="w-full bg-terra hover:bg-terra-dark text-white font-medium py-2.5 px-4 text-sm tracking-wide transition-colors">
          Guardar cambios
        </button>
      </form>
    </>
  )
}
