import { createMaterial } from '../actions'
import Link from 'next/link'

const UNITS = ['tablero', 'pza', 'lts', 'kg', 'caja', 'm2']
const inputCls = 'w-full border border-warm bg-white text-bark text-sm px-3 py-2.5 focus:outline-none focus:border-terra transition-colors placeholder:text-dust'

export default function NuevoMaterialPage() {
  return (
    <>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/materiales" className="text-dust hover:text-bark transition-colors">←</Link>
        <p className="text-xs font-medium text-dust uppercase tracking-widest">Nuevo Material</p>
      </div>

      <form action={createMaterial} className="bg-white border border-warm p-5 space-y-5">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-umber uppercase tracking-widest mb-2">Código *</label>
            <input name="code" required maxLength={50} placeholder="MDF-15MM" className={inputCls} />
          </div>
          <div>
            <label className="block text-xs font-medium text-umber uppercase tracking-widest mb-2">Categoría *</label>
            <select name="category" required className={inputCls}>
              <option value="A">A — Alta rotación</option>
              <option value="B">B — Media</option>
              <option value="C">C — Baja rotación</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-umber uppercase tracking-widest mb-2">Nombre *</label>
          <input name="name" required maxLength={255} placeholder="Ej. MDF 15mm Maple" className={inputCls} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-umber uppercase tracking-widest mb-2">Unidad *</label>
            <select name="unit" required className={inputCls}>
              {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-umber uppercase tracking-widest mb-2">Precio/u ($MXN)</label>
            <input name="cost_unit" type="number" min="0" step="0.01" defaultValue="0" className={inputCls} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-umber uppercase tracking-widest mb-2">Stock inicial</label>
            <input name="stock_current" type="number" min="0" step="0.001" defaultValue="0" className={inputCls} />
          </div>
          <div>
            <label className="block text-xs font-medium text-umber uppercase tracking-widest mb-2">Stock mínimo</label>
            <input name="stock_min" type="number" min="0" step="0.001" defaultValue="0" className={inputCls} />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-umber uppercase tracking-widest mb-2">Notas</label>
          <textarea name="notes" rows={2} className={`${inputCls} resize-none`} />
        </div>

        <button type="submit" className="w-full bg-terra hover:bg-terra-dark text-white font-medium py-2.5 px-4 text-sm tracking-wide transition-colors">
          Crear Material
        </button>
      </form>
    </>
  )
}
