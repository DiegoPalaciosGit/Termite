import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { updateStatus, addStage, deleteStage } from '../actions'

const STAGES: Record<string, string> = {
  corte: 'Corte (CNC / Sierra)',
  lijado: 'Lijado / Porosidad',
  laca: 'Laca / Pintura',
  ensamble: 'Ensamble / Herrajes',
  emplayado: 'Emplayado y Almacén',
}
const STATUS_BADGE: Record<string, string> = {
  en_proceso: 'bg-blue-100 text-blue-700',
  retrabajo: 'bg-red-100 text-red-700',
  terminado: 'bg-green-100 text-green-700',
}
const STATUS_LABEL: Record<string, string> = {
  en_proceso: 'En proceso',
  retrabajo: 'Retrabajo',
  terminado: 'Terminado',
}

function formatDuration(minutes: number | null) {
  if (!minutes) return '—'
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return h > 0 ? `${h}h ${m}m` : `${m}m`
}

function formatDatetime(dt: string | null) {
  if (!dt) return '—'
  return new Date(dt).toLocaleString('es-MX', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

type Stage = {
  id: number
  stage: string
  worker_name: string | null
  started_at: string | null
  finished_at: string | null
  duration_minutes: number | null
  notes: string | null
}

export default async function HojaDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: hoja }, { data: stages }] = await Promise.all([
    supabase
      .from('hojas_viajeras')
      .select('*, clients(name)')
      .eq('id', id)
      .single(),
    supabase
      .from('hoja_stages')
      .select('*')
      .eq('hoja_viajera_id', id)
      .order('created_at', { ascending: true }),
  ])

  if (!hoja) notFound()

  const clientName = (hoja.clients as { name: string } | null)?.name ?? 'Sin cliente'
  const stageList = (stages ?? []) as Stage[]

  return (
    <>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <Link href="/hojas" className="text-gray-400 hover:text-gray-600 text-lg">←</Link>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-xs font-mono text-gray-400">{hoja.folio}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_BADGE[hoja.status]}`}>
                {STATUS_LABEL[hoja.status]}
              </span>
            </div>
            <h1 className="text-xl font-bold text-gray-900">{hoja.product_name}</h1>
            <p className="text-sm text-gray-500">{clientName} · ×{hoja.quantity}</p>
            {hoja.estimated_end_date && (
              <p className="text-xs text-gray-400 mt-0.5">
                Entrega: {new Date(hoja.estimated_end_date).toLocaleDateString('es-MX', { dateStyle: 'medium' })}
              </p>
            )}
          </div>
        </div>
        <Link href={`/hojas/${id}/editar`} className="text-sm text-amber-600 hover:underline shrink-0">
          Editar
        </Link>
      </div>

      {hoja.notes && (
        <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-2 mb-4 text-sm text-gray-600">
          {hoja.notes}
        </div>
      )}

      {/* Status change */}
      {hoja.status !== 'terminado' && (
        <div className="bg-white rounded-xl border border-gray-100 p-4 mb-4">
          <p className="text-xs font-medium text-gray-400 mb-2">Cambiar status</p>
          <div className="flex gap-2 flex-wrap">
            {(['en_proceso', 'retrabajo', 'terminado'] as const)
              .filter(s => s !== hoja.status)
              .map(s => (
                <form key={s} action={updateStatus}>
                  <input type="hidden" name="id" value={id} />
                  <input type="hidden" name="status" value={s} />
                  <button
                    type="submit"
                    className={`text-sm px-3 py-1.5 rounded-lg font-medium transition-colors ${
                      s === 'retrabajo' ? 'bg-red-100 text-red-700 hover:bg-red-200' :
                      s === 'terminado' ? 'bg-green-100 text-green-700 hover:bg-green-200' :
                      'bg-blue-100 text-blue-700 hover:bg-blue-200'
                    }`}
                  >
                    → {STATUS_LABEL[s]}
                  </button>
                </form>
              ))}
          </div>
        </div>
      )}

      {/* Stages log */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 mb-4">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Bitácora de etapas</h3>
        {stageList.length === 0 ? (
          <p className="text-sm text-gray-400">Sin etapas registradas.</p>
        ) : (
          <div className="overflow-x-auto -mx-1">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-400 border-b border-gray-100">
                  <th className="pb-2 pr-3 font-medium">Etapa</th>
                  <th className="pb-2 pr-3 font-medium">Trabajador</th>
                  <th className="pb-2 pr-3 font-medium">Inicio</th>
                  <th className="pb-2 pr-3 font-medium">Fin</th>
                  <th className="pb-2 pr-3 font-medium">Duración</th>
                  <th className="pb-2" />
                </tr>
              </thead>
              <tbody>
                {stageList.map(s => (
                  <tr key={s.id} className="border-b border-gray-50 last:border-0">
                    <td className="py-2 pr-3 font-medium text-gray-700 whitespace-nowrap">
                      {STAGES[s.stage] ?? s.stage}
                    </td>
                    <td className="py-2 pr-3 text-gray-500">{s.worker_name ?? '—'}</td>
                    <td className="py-2 pr-3 text-gray-500 whitespace-nowrap text-xs">{formatDatetime(s.started_at)}</td>
                    <td className="py-2 pr-3 text-gray-500 whitespace-nowrap text-xs">{formatDatetime(s.finished_at)}</td>
                    <td className="py-2 pr-3 font-medium text-gray-700">{formatDuration(s.duration_minutes)}</td>
                    <td className="py-2">
                      <form action={deleteStage}>
                        <input type="hidden" name="hoja_id" value={id} />
                        <input type="hidden" name="stage_id" value={s.id} />
                        <button type="submit" className="text-xs text-red-300 hover:text-red-500">✕</button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add stage form */}
      <div className="bg-white rounded-xl border border-gray-100 p-4">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Registrar etapa</h3>
        <form action={addStage} className="space-y-3">
          <input type="hidden" name="hoja_id" value={id} />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Etapa *</label>
              <select
                name="stage"
                required
                className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-amber-400"
              >
                {Object.entries(STAGES).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Trabajador</label>
              <input
                name="worker_name"
                placeholder="Nombre"
                className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Inicio</label>
              <input
                name="started_at"
                type="datetime-local"
                className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Fin</label>
              <input
                name="finished_at"
                type="datetime-local"
                className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Notas</label>
            <input
              name="notes"
              placeholder="Opcional"
              className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-amber-500 hover:bg-amber-600 text-white font-medium py-2 rounded-lg text-sm transition-colors"
          >
            Guardar etapa
          </button>
        </form>
      </div>
    </>
  )
}
