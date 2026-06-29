import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createClient()

  const [
    { count: hojasActivas },
    { count: hojasRetrabajo },
    { data: materiales },
    { data: hojasRecientes },
  ] = await Promise.all([
    supabase.from('hojas_viajeras').select('*', { count: 'exact', head: true }).eq('status', 'en_proceso'),
    supabase.from('hojas_viajeras').select('*', { count: 'exact', head: true }).eq('status', 'retrabajo'),
    supabase.from('materials').select('name, stock_current, stock_min').eq('is_active', true),
    supabase.from('hojas_viajeras').select('id, folio, product_name, status, clients(name)').neq('status', 'terminado').order('created_at', { ascending: false }).limit(5),
  ])

  const alertasStock = materiales?.filter(m => Number(m.stock_current) <= Number(m.stock_min)) ?? []

  return (
    <>
      <div className="mb-6">
        <h1 className="text-lg font-semibold text-bark">Panel de producción</h1>
        <p className="text-sm text-dust mt-0.5">Vista general del taller</p>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-8">
        <KPICard
          label="En producción"
          value={hojasActivas ?? 0}
          variant="neutral"
        />
        <KPICard
          label="Con retrabajo"
          value={hojasRetrabajo ?? 0}
          variant={hojasRetrabajo ? 'warn' : 'neutral'}
        />
        <KPICard
          label="Stock escaso"
          value={alertasStock.length}
          variant={alertasStock.length > 0 ? 'danger' : 'neutral'}
        />
      </div>

      {alertasStock.length > 0 && (
        <div className="bg-rust-light border border-rust/20 p-4 mb-6">
          <p className="text-xs font-semibold text-rust uppercase tracking-widest mb-2">Materiales por reabastecer</p>
          <ul className="space-y-1">
            {alertasStock.map(m => (
              <li key={m.name} className="text-sm text-rust flex justify-between">
                <span>{m.name}</span>
                <span className="text-rust/60 font-mono text-xs">{m.stock_current} / mín. {m.stock_min}</span>
              </li>
            ))}
          </ul>
          <Link href="/materiales" className="text-xs text-rust font-semibold mt-3 inline-block hover:underline">
            Ver inventario →
          </Link>
        </div>
      )}

      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs text-dust uppercase tracking-widest font-medium">Órdenes en curso</p>
        <Link href="/hojas/nueva" className="text-xs text-terra hover:text-terra-dark font-medium transition-colors">
          + Nueva orden
        </Link>
      </div>

      {(hojasRecientes ?? []).length === 0 ? (
        <div className="text-center py-12 text-dust border border-dashed border-warm">
          <p className="text-sm mb-2">No hay órdenes activas</p>
          <Link href="/hojas/nueva" className="text-terra hover:text-terra-dark text-sm font-medium">
            Crear la primera orden →
          </Link>
        </div>
      ) : (
        <div className="space-y-px">
          {(hojasRecientes ?? []).map(h => {
            const STATUS_LABEL: Record<string, string> = { en_proceso: 'En proceso', retrabajo: 'Corrección' }
            const STATUS_BADGE: Record<string, string> = {
              en_proceso: 'bg-terra-light text-terra-text',
              retrabajo: 'bg-rust-light text-rust',
            }
            return (
              <Link
                key={h.id}
                href={`/hojas/${h.id}`}
                className="flex items-center justify-between bg-white border border-warm px-4 py-3 hover:bg-linen transition-colors gap-3"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-mono text-dust">{h.folio}</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${STATUS_BADGE[h.status] ?? 'bg-warm text-umber'}`}>
                      {STATUS_LABEL[h.status] ?? h.status}
                    </span>
                  </div>
                  <p className="font-medium text-bark text-sm truncate">{h.product_name}</p>
                  <p className="text-xs text-dust">{(h.clients as unknown as { name: string } | null)?.name ?? 'Sin cliente'}</p>
                </div>
                <span className="text-dust text-sm shrink-0">›</span>
              </Link>
            )
          })}
          <Link href="/hojas" className="block text-center text-xs text-dust hover:text-umber py-3 transition-colors">
            Ver todas las órdenes →
          </Link>
        </div>
      )}
    </>
  )
}

function KPICard({
  label,
  value,
  variant,
}: {
  label: string
  value: number
  variant: 'neutral' | 'warn' | 'danger'
}) {
  const styles = {
    neutral: 'bg-white border-warm text-bark',
    warn:    'bg-amber-light border-amber/20 text-amber',
    danger:  'bg-rust-light border-rust/20 text-rust',
  }
  return (
    <div className={`border p-3 ${styles[variant]}`}>
      <p className="text-3xl font-bold tabular-nums">{value}</p>
      <p className="text-xs mt-1.5 leading-tight font-medium text-dust uppercase tracking-widest">{label}</p>
    </div>
  )
}
