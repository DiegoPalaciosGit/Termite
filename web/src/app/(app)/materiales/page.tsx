import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

type Material = {
  id: number
  code: string
  name: string
  category: string
  unit: string
  cost_unit: number
  stock_current: number
  stock_min: number
}

const CAT_LABEL: Record<string, string> = {
  A: 'Categoría A — Alta rotación',
  B: 'Categoría B — Rotación media',
  C: 'Categoría C — Baja rotación',
}

function stockBadge(m: Material) {
  if (Number(m.stock_current) <= Number(m.stock_min)) {
    return <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-medium">En alerta</span>
  }
  if (Number(m.cost_unit) === 0) {
    return <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-medium">Precio pendiente</span>
  }
  return <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">OK</span>
}

export default async function MaterialesPage() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('materials')
    .select('id, code, name, category, unit, cost_unit, stock_current, stock_min')
    .eq('is_active', true)
    .order('category')
    .order('name')

  const materiales = (data ?? []) as Material[]
  const alertas = materiales.filter(m => Number(m.stock_current) <= Number(m.stock_min)).length

  const grouped = {
    A: materiales.filter(m => m.category === 'A'),
    B: materiales.filter(m => m.category === 'B'),
    C: materiales.filter(m => m.category === 'C'),
  }

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Materiales</h2>
          {alertas > 0 && (
            <p className="text-sm text-red-600 font-medium mt-0.5">{alertas} en alerta de stock</p>
          )}
        </div>
        <Link
          href="/materiales/nuevo"
          className="bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          + Nuevo
        </Link>
      </div>

      {(['A', 'B', 'C'] as const).map(cat => {
        const items = grouped[cat]
        if (items.length === 0) return null
        return (
          <div key={cat} className="mb-6">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">{CAT_LABEL[cat]}</p>
            <div className="space-y-2">
              {items.map(m => (
                <Link
                  key={m.id}
                  href={`/materiales/${m.id}`}
                  className="block bg-white rounded-xl border border-gray-100 px-4 py-3 hover:border-amber-200 transition-colors"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-xs font-mono text-gray-400">{m.code}</span>
                        {stockBadge(m)}
                      </div>
                      <p className="font-medium text-gray-900 truncate">{m.name}</p>
                      <p className="text-sm text-gray-500">
                        ${Number(m.cost_unit).toFixed(2)}/{m.unit} · mín. {m.stock_min}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className={`text-2xl font-bold ${Number(m.stock_current) <= Number(m.stock_min) ? 'text-red-600' : 'text-gray-900'}`}>
                        {Number(m.stock_current)}
                      </p>
                      <p className="text-xs text-gray-400">{m.unit}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )
      })}
    </>
  )
}
