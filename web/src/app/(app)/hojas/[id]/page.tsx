import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { updateStatus, deleteStage, aprobarHoja } from '../actions'
import StageForm from './StageForm'
import DeleteHojaButton from './DeleteHojaButton'

const STAGES: Record<string, string> = {
  corte:     'Corte (CNC / Sierra)',
  lijado:    'Lijado / Porosidad',
  laca:      'Laca / Pintura',
  ensamble:  'Ensamble / Herrajes',
  emplayado: 'Emplayado y Almacén',
}
const STATUS_BADGE: Record<string, string> = {
  pendiente_aprobacion: 'bg-amber-light text-amber',
  en_proceso:           'bg-terra-light text-terra-text',
  retrabajo:            'bg-rust-light text-rust',
  terminado:            'bg-pine-light text-pine',
}
const STATUS_LABEL: Record<string, string> = {
  pendiente_aprobacion: 'Pendiente aprobación',
  en_proceso:           'En proceso',
  retrabajo:            'Necesita corrección',
  terminado:            'Terminado',
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
    supabase.from('hojas_viajeras').select('*, clients(name)').eq('id', id).single(),
    supabase.from('hoja_stages').select('*').eq('hoja_viajera_id', id).order('created_at', { ascending: true }),
  ])

  if (!hoja) notFound()

  const clientName = (hoja.clients as { name: string } | null)?.name ?? 'Sin cliente'
  const stageList = (stages ?? []) as Stage[]
  const isPendiente = hoja.status === 'pendiente_aprobacion'
  const isTerminado = hoja.status === 'terminado'

  return (
    <>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3">
          <Link href="/hojas" className="text-dust hover:text-bark transition-colors mt-1">←</Link>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono text-dust">{hoja.folio}</span>
              <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${STATUS_BADGE[hoja.status]}`}>
                {STATUS_LABEL[hoja.status]}
              </span>
            </div>
            <h1 className="text-lg font-semibold text-bark">{hoja.product_name}</h1>
            <p className="text-sm text-umber">{clientName} · ×{hoja.quantity}</p>
            {hoja.estimated_end_date && (
              <p className="text-xs text-dust mt-0.5">
                Entrega: {new Date(hoja.estimated_end_date).toLocaleDateString('es-MX', { dateStyle: 'medium' })}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-4 shrink-0 mt-1">
          <Link href={`/hojas/${id}/editar`} className="text-xs text-dust hover:text-bark uppercase tracking-widest transition-colors">
            Editar
          </Link>
          <DeleteHojaButton hojaId={id} folio={hoja.folio} />
        </div>
      </div>

      {hoja.notes && (
        <div className="bg-terra-light border border-terra/20 px-4 py-3 mb-4 text-sm text-terra-text">
          {hoja.notes}
        </div>
      )}

      {/* Aprobar solicitud de cliente */}
      {isPendiente && (
        <div className="bg-amber-light border border-amber/20 p-4 mb-4">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs font-medium text-amber uppercase tracking-widest">Solicitud de cliente</p>
            <p className="text-xs text-umber font-mono">
              {new Date(hoja.created_at).toLocaleString('es-MX', {
                day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
              })}
            </p>
          </div>
          <p className="text-sm text-bark mb-3">
            Revisa los detalles, pacta precio y fecha con el cliente, luego aprueba para iniciar producción.
          </p>
          <form action={aprobarHoja} className="flex gap-2">
            <input type="hidden" name="id" value={id} />
            <button
              type="submit"
              className="bg-bark hover:bg-bark/80 text-white font-medium text-xs px-4 py-2 tracking-wide transition-colors"
            >
              Aprobar e iniciar producción
            </button>
          </form>
        </div>
      )}

      {/* Cambiar estado (solo para órdenes activas no pendientes) */}
      {!isPendiente && !isTerminado && (
        <div className="bg-white border border-warm p-4 mb-4">
          <p className="text-xs font-medium text-dust uppercase tracking-widest mb-3">Cambiar estado</p>
          <div className="flex gap-2 flex-wrap">
            {(['en_proceso', 'retrabajo', 'terminado'] as const)
              .filter(s => s !== hoja.status)
              .map(s => (
                <form key={s} action={updateStatus}>
                  <input type="hidden" name="id" value={id} />
                  <input type="hidden" name="status" value={s} />
                  <button
                    type="submit"
                    className={`text-xs px-4 py-2 font-medium tracking-wide transition-colors ${
                      s === 'retrabajo' ? 'bg-rust-light text-rust hover:bg-rust/20' :
                      s === 'terminado' ? 'bg-pine-light text-pine hover:bg-pine/20' :
                      'bg-terra-light text-terra-text hover:bg-terra/20'
                    }`}
                  >
                    Marcar como: {STATUS_LABEL[s]}
                  </button>
                </form>
              ))}
          </div>
        </div>
      )}

      {/* Registro de avance (no mostrar si está pendiente) */}
      {!isPendiente && (
        <>
          <div className="bg-white border border-warm p-4 mb-4">
            <p className="text-xs font-medium text-dust uppercase tracking-widest mb-3">
              Registro de avance
              {stageList.length > 0 && (
                <span className="ml-2 font-normal normal-case tracking-normal text-dust">
                  ({stageList.length} etapa{stageList.length !== 1 ? 's' : ''})
                </span>
              )}
            </p>
            {stageList.length === 0 ? (
              <p className="text-sm text-dust">Sin etapas registradas todavía.</p>
            ) : (
              <div>
                {stageList.map(s => (
                  <div key={s.id} className="flex items-start justify-between gap-3 py-3 border-b border-warm/60 last:border-0">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-bark">{STAGES[s.stage] ?? s.stage}</p>
                      <p className="text-xs text-umber mt-0.5">
                        {s.worker_name ?? 'Sin trabajador asignado'}
                        {s.duration_minutes ? <span className="ml-2 text-dust">· {formatDuration(s.duration_minutes)}</span> : null}
                      </p>
                      {(s.started_at || s.finished_at) && (
                        <p className="text-xs text-dust mt-0.5 font-mono">
                          {formatDatetime(s.started_at)} → {formatDatetime(s.finished_at)}
                        </p>
                      )}
                      {s.notes && <p className="text-xs text-dust mt-0.5 italic">{s.notes}</p>}
                    </div>
                    <form action={deleteStage} className="shrink-0">
                      <input type="hidden" name="hoja_id" value={id} />
                      <input type="hidden" name="stage_id" value={s.id} />
                      <button type="submit" className="text-xs text-dust hover:text-rust transition-colors p-1" aria-label="Eliminar etapa">✕</button>
                    </form>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white border border-warm p-4">
            <p className="text-xs font-medium text-dust uppercase tracking-widest mb-4">Registrar etapa de producción</p>
            <StageForm
              hojaId={id}
              estimatedEndDate={hoja.estimated_end_date}
              existingStages={stageList.map(s => s.stage)}
              stages={STAGES}
            />
          </div>
        </>
      )}
    </>
  )
}
