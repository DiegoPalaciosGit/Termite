'use server'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

const VALID_STAGES = ['corte', 'lijado', 'laca', 'ensamble', 'emplayado'] as const
const VALID_STATUSES = ['en_proceso', 'retrabajo', 'terminado'] as const

export async function createHoja(formData: FormData) {
  const supabase = await createClient()

  const year = new Date().getFullYear()
  const { count } = await supabase
    .from('hojas_viajeras')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', `${year}-01-01`)

  const folio = `HV-${year}-${String((count ?? 0) + 1).padStart(3, '0')}`
  const clientId = (formData.get('client_id') as string) || null
  const estimatedEnd = (formData.get('estimated_end_date') as string) || null

  await supabase.from('hojas_viajeras').insert({
    folio,
    product_name: formData.get('product_name') as string,
    quantity: Number(formData.get('quantity')) || 1,
    client_id: clientId,
    notes: (formData.get('notes') as string) || null,
    estimated_end_date: estimatedEnd,
    status: 'en_proceso',
  })

  redirect('/hojas')
}

export async function updateHoja(formData: FormData) {
  const supabase = await createClient()
  const id = formData.get('id') as string
  const clientId = (formData.get('client_id') as string) || null

  await supabase
    .from('hojas_viajeras')
    .update({
      product_name: formData.get('product_name') as string,
      quantity: Number(formData.get('quantity')) || 1,
      client_id: clientId,
      notes: (formData.get('notes') as string) || null,
      estimated_end_date: (formData.get('estimated_end_date') as string) || null,
    })
    .eq('id', id)

  redirect(`/hojas/${id}`)
}

export async function updateStatus(formData: FormData) {
  const supabase = await createClient()
  const id = formData.get('id') as string
  const status = formData.get('status') as string

  if (!VALID_STATUSES.includes(status as typeof VALID_STATUSES[number])) return

  const { data: hoja } = await supabase
    .from('hojas_viajeras')
    .select('status')
    .eq('id', id)
    .single()

  if (hoja?.status === 'terminado') return

  const update: Record<string, unknown> = { status }
  if (status === 'terminado') update.actual_end_date = new Date().toISOString().split('T')[0]

  await supabase.from('hojas_viajeras').update(update).eq('id', id)
  revalidatePath(`/hojas/${id}`)
  redirect(`/hojas/${id}`)
}

export async function addStage(formData: FormData) {
  const supabase = await createClient()
  const hojaId = formData.get('hoja_id') as string
  const stage = formData.get('stage') as string

  if (!VALID_STAGES.includes(stage as typeof VALID_STAGES[number])) return

  const startedAt = (formData.get('started_at') as string) || null
  const finishedAt = (formData.get('finished_at') as string) || null

  let durationMinutes: number | null = null
  if (startedAt && finishedAt) {
    durationMinutes = Math.round(
      (new Date(finishedAt).getTime() - new Date(startedAt).getTime()) / 60000
    )
  }

  await supabase.from('hoja_stages').insert({
    hoja_viajera_id: hojaId,
    stage,
    worker_name: (formData.get('worker_name') as string) || null,
    started_at: startedAt,
    finished_at: finishedAt,
    duration_minutes: durationMinutes,
    notes: (formData.get('notes') as string) || null,
    created_at: new Date().toISOString(),
  })

  revalidatePath(`/hojas/${hojaId}`)
  redirect(`/hojas/${hojaId}`)
}

export async function deleteStage(formData: FormData) {
  const supabase = await createClient()
  const hojaId = formData.get('hoja_id') as string
  const stageId = formData.get('stage_id') as string

  await supabase
    .from('hoja_stages')
    .delete()
    .eq('id', stageId)
    .eq('hoja_viajera_id', hojaId)

  revalidatePath(`/hojas/${hojaId}`)
  redirect(`/hojas/${hojaId}`)
}
