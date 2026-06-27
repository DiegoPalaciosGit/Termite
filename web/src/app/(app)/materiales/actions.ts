'use server'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function createMaterial(formData: FormData) {
  const supabase = await createClient()

  await supabase.from('materials').insert({
    code: formData.get('code') as string,
    name: formData.get('name') as string,
    category: formData.get('category') as string,
    unit: formData.get('unit') as string,
    cost_unit: Number(formData.get('cost_unit')) || 0,
    stock_current: Number(formData.get('stock_current')) || 0,
    stock_min: Number(formData.get('stock_min')) || 0,
    notes: (formData.get('notes') as string) || null,
    is_active: true,
  })

  redirect('/materiales')
}

export async function updateMaterial(formData: FormData) {
  const supabase = await createClient()
  const id = formData.get('id') as string

  await supabase.from('materials').update({
    code: formData.get('code') as string,
    name: formData.get('name') as string,
    category: formData.get('category') as string,
    unit: formData.get('unit') as string,
    cost_unit: Number(formData.get('cost_unit')) || 0,
    stock_min: Number(formData.get('stock_min')) || 0,
    notes: (formData.get('notes') as string) || null,
  }).eq('id', id)

  redirect(`/materiales/${id}`)
}

export async function registrarEntrada(formData: FormData) {
  const supabase = await createClient()
  const id = formData.get('material_id') as string
  const cantidad = Number(formData.get('quantity'))
  const costoEntrada = Number(formData.get('unit_cost')) || 0

  const { data: material } = await supabase
    .from('materials')
    .select('stock_current, cost_unit')
    .eq('id', id)
    .single()

  if (!material) return

  const stockActual = Number(material.stock_current)
  const costoActual = Number(material.cost_unit)

  // Weighted average cost
  const nuevoCosto = stockActual > 0 || costoActual > 0
    ? (stockActual * costoActual + cantidad * costoEntrada) / (stockActual + cantidad)
    : costoEntrada

  await supabase.from('materials').update({
    stock_current: stockActual + cantidad,
    cost_unit: Math.round(nuevoCosto * 100) / 100,
  }).eq('id', id)

  await supabase.from('material_movements').insert({
    material_id: id,
    type: 'entrada',
    quantity: cantidad,
    unit_cost: costoEntrada,
    reference_type: 'manual',
    notes: (formData.get('notes') as string) || null,
    created_at: new Date().toISOString(),
  })

  revalidatePath(`/materiales/${id}`)
  redirect(`/materiales/${id}`)
}

export async function registrarSalida(formData: FormData) {
  const supabase = await createClient()
  const id = formData.get('material_id') as string
  const cantidad = Number(formData.get('quantity'))

  const { data: material } = await supabase
    .from('materials')
    .select('stock_current, cost_unit, unit')
    .eq('id', id)
    .single()

  if (!material) return

  const stockActual = Number(material.stock_current)
  if (cantidad > stockActual) {
    redirect(`/materiales/${id}?error=stock`)
  }

  await supabase.from('materials').update({
    stock_current: stockActual - cantidad,
  }).eq('id', id)

  await supabase.from('material_movements').insert({
    material_id: id,
    type: 'salida',
    quantity: cantidad,
    unit_cost: Number(material.cost_unit),
    reference_type: (formData.get('reference_type') as string) || 'manual',
    notes: (formData.get('notes') as string) || null,
    created_at: new Date().toISOString(),
  })

  revalidatePath(`/materiales/${id}`)
  redirect(`/materiales/${id}`)
}
