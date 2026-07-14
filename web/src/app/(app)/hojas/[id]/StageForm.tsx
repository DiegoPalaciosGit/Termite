'use client'
import { useState } from 'react'
import { addStage } from '../actions'

const inputCls = 'w-full border border-warm bg-white text-bark text-sm px-3 py-2.5 focus:outline-none focus:border-terra transition-colors placeholder:text-dust'

export default function StageForm({
  hojaId,
  estimatedEndDate,
  existingStages,
  stages,
}: {
  hojaId: string
  estimatedEndDate: string | null
  existingStages: string[]
  stages: Record<string, string>
}) {
  const stageKeys = Object.keys(stages)
  const [stage, setStage] = useState(stageKeys[0])
  const [startedAt, setStartedAt] = useState('')
  const [finishedAt, setFinishedAt] = useState('')

  // datetime-local es YYYY-MM-DDTHH:mm; comparar solo la fecha (ISO ordena bien como string)
  const afterDelivery =
    !!estimatedEndDate &&
    ((!!startedAt && startedAt.slice(0, 10) > estimatedEndDate) ||
      (!!finishedAt && finishedAt.slice(0, 10) > estimatedEndDate))

  const duplicateStage = existingStages.includes(stage)

  const entregaFmt = estimatedEndDate
    ? new Date(estimatedEndDate + 'T00:00:00').toLocaleDateString('es-MX', {
        day: '2-digit', month: '2-digit', year: 'numeric',
      })
    : ''

  return (
    <form action={addStage} className="space-y-4">
      <input type="hidden" name="hoja_id" value={hojaId} />
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-umber font-medium mb-2 uppercase tracking-widest">Etapa *</label>
          <select name="stage" required value={stage} onChange={e => setStage(e.target.value)} className={inputCls}>
            {Object.entries(stages).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-umber font-medium mb-2 uppercase tracking-widest">Trabajador</label>
          <input name="worker_name" placeholder="Nombre del trabajador" className={inputCls} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-umber font-medium mb-2 uppercase tracking-widest">Inicio</label>
          <input name="started_at" type="datetime-local" value={startedAt} onChange={e => setStartedAt(e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className="block text-xs text-umber font-medium mb-2 uppercase tracking-widest">Fin</label>
          <input name="finished_at" type="datetime-local" value={finishedAt} onChange={e => setFinishedAt(e.target.value)} className={inputCls} />
        </div>
      </div>

      {duplicateStage && (
        <div className="bg-amber-light border border-amber/20 px-4 py-3 text-sm text-amber">
          Estás registrando dos etapas idénticas, guarda una nota si es un retrabajo o revisa si el trabajo ya se concluyó.
        </div>
      )}
      {afterDelivery && (
        <div className="bg-amber-light border border-amber/20 px-4 py-3 text-sm text-amber">
          La entrega está pactada para antes del {entregaFmt}, aplaza la fecha de entrega o ajusta el avance de la etapa.
        </div>
      )}

      <div>
        <label className="block text-xs text-umber font-medium mb-2 uppercase tracking-widest">Notas</label>
        <input name="notes" placeholder="Observaciones opcionales" className={inputCls} />
      </div>
      <button type="submit" className="w-full bg-terra hover:bg-terra-dark text-white font-medium py-2.5 px-4 text-sm tracking-wide transition-colors">
        Guardar etapa
      </button>
    </form>
  )
}
