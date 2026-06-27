import { createClient } from '@/lib/supabase/server'

export default async function DashboardPage() {
  const supabase = await createClient()

  const [
    { count: hojasActivas },
    { count: hojasRetrabajo },
    { data: materiales },
  ] = await Promise.all([
    supabase.from('hojas_viajeras').select('*', { count: 'exact', head: true }).eq('status', 'en_proceso'),
    supabase.from('hojas_viajeras').select('*', { count: 'exact', head: true }).eq('status', 'retrabajo'),
    supabase.from('materials').select('name, stock_current, stock_min').eq('is_active', true),
  ])

  const alertasStock = materiales?.filter(m => Number(m.stock_current) <= Number(m.stock_min)) ?? []

  return (
    <>
      <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-4">Resumen</h2>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <KPICard label="Órdenes en proceso" value={hojasActivas ?? 0} color="blue" />
        <KPICard label="En retrabajo" value={hojasRetrabajo ?? 0} color={hojasRetrabajo ? 'red' : 'gray'} />
        <KPICard label="Alertas de stock" value={alertasStock.length} color={alertasStock.length > 0 ? 'red' : 'gray'} />
      </div>

      {alertasStock.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-red-700 mb-2">Stock bajo</h3>
          <ul className="space-y-1">
            {alertasStock.map(m => (
              <li key={m.name} className="text-sm text-red-600">
                {m.name} — {m.stock_current} (mín. {m.stock_min})
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  )
}

function KPICard({ label, value, color }: { label: string; value: number; color: string }) {
  const colors: Record<string, string> = {
    blue: 'bg-blue-50 border-blue-100 text-blue-700',
    red: 'bg-red-50 border-red-100 text-red-700',
    gray: 'bg-white border-gray-100 text-gray-700',
  }
  return (
    <div className={`rounded-xl border p-5 ${colors[color]}`}>
      <p className="text-3xl font-bold">{value}</p>
      <p className="text-sm mt-1 opacity-75">{label}</p>
    </div>
  )
}
