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
  A: 'Materiales principales · Alta rotación',
  B: 'Materiales secundarios · Rotación media',
  C: 'Materiales eventuales · Baja rotación',
}

function StockBadge({ m }: { m: Material }) {
  if (Number(m.stock_current) <= Number(m.stock_min)) {
    return <span className="text-xs px-1.5 py-0.5 rounded bg-rust-light text-rust font-medium">En alerta</span>
  }
  if (Number(m.cost_unit) === 0) {
    return <span className="text-xs px-1.5 py-0.5 rounded bg-amber-light text-amber font-medium">Sin precio</span>
  }
  return <span className="text-xs px-1.5 py-0.5 rounded bg-pine-light text-pine font-medium">OK</span>
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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-semibold text-bark">Inventario</h1>
          {alertas > 0 ? (
            <p className="text-sm text-rust font-medium mt-0.5">{alertas} material{alertas !== 1 ? 'es' : ''} por reabastecer</p>
          ) : (
            <p className="text-sm text-dust mt-0.5">Todos los materiales y existencias</p>
          )}
        </div>
        <Link
          href="/materiales/nuevo"
          className="bg-terra hover:bg-terra-dark text-white font-medium py-2 px-4 text-xs tracking-wide transition-colors shrink-0"
        >
          + Nuevo
        </Link>
      </div>

      {(['A', 'B', 'C'] as const).map(cat => {
        const items = grouped[cat]
        if (items.length === 0) return null
        return (
          <div key={cat} className="mb-6">
            <p className="text-xs font-medium text-dust uppercase tracking-widest mb-2">{CAT_LABEL[cat]}</p>
            <div className="space-y-px">
              {items.map(m => (
                <Link
                  key={m.id}
                  href={`/materiales/${m.id}`}
                  className="block bg-white border border-warm px-4 py-3 hover:bg-linen transition-colors"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono text-dust">{m.code}</span>
                        <StockBadge m={m} />
                      </div>
                      <p className="font-medium text-bark truncate">{m.name}</p>
                      <p className="text-sm text-umber">
                        ${Number(m.cost_unit).toFixed(2)}/{m.unit} · mín. {m.stock_min}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className={`text-2xl font-bold tabular-nums ${Number(m.stock_current) <= Number(m.stock_min) ? 'text-rust' : 'text-bark'}`}>
                        {Number(m.stock_current)}
                      </p>
                      <p className="text-xs text-dust">{m.unit}</p>
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
