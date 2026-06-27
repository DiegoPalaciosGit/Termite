'use server'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

function calcularSemaforo(salePrice: number, estimatedCost: number, minMargin: number) {
  if (!salePrice || !estimatedCost) return { margin_pct: 0, margin_status: 'gris' }
  const margin_pct = ((salePrice - estimatedCost) / salePrice) * 100
  const margin_status =
    margin_pct >= minMargin ? 'verde' :
    margin_pct >= (minMargin - 10) ? 'amarillo' : 'rojo'
  return { margin_pct: Math.round(margin_pct * 100) / 100, margin_status }
}

export async function createProducto(formData: FormData) {
  const supabase = await createClient()

  const { data: config } = await supabase.from('shop_config').select('min_margin_pct').single()
  const minMargin = Number(config?.min_margin_pct ?? 35)
  const salePrice = Number(formData.get('sale_price')) || 0
  const estimatedCost = Number(formData.get('estimated_cost')) || 0
  const { margin_pct, margin_status } = calcularSemaforo(salePrice, estimatedCost, minMargin)

  await supabase.from('products_catalog').insert({
    name: formData.get('name') as string,
    sale_price: salePrice,
    estimated_cost: estimatedCost,
    margin_pct,
    margin_status,
    notes: (formData.get('notes') as string) || null,
    is_active: true,
  })

  redirect('/costos')
}

export async function updateProducto(formData: FormData) {
  const supabase = await createClient()
  const id = formData.get('id') as string

  const { data: config } = await supabase.from('shop_config').select('min_margin_pct').single()
  const minMargin = Number(config?.min_margin_pct ?? 35)
  const salePrice = Number(formData.get('sale_price')) || 0
  const estimatedCost = Number(formData.get('estimated_cost')) || 0
  const { margin_pct, margin_status } = calcularSemaforo(salePrice, estimatedCost, minMargin)

  await supabase.from('products_catalog').update({
    name: formData.get('name') as string,
    sale_price: salePrice,
    estimated_cost: estimatedCost,
    margin_pct,
    margin_status,
    notes: (formData.get('notes') as string) || null,
  }).eq('id', id)

  redirect('/costos')
}

export async function updateConfig(formData: FormData) {
  const supabase = await createClient()

  const { data: config } = await supabase.from('shop_config').select('id').single()
  if (!config) return

  await supabase.from('shop_config').update({
    rate_carpintero: Number(formData.get('rate_carpintero')) || 0,
    rate_laqueador: Number(formData.get('rate_laqueador')) || 0,
    rate_cnc: Number(formData.get('rate_cnc')) || 0,
    rate_auxiliar_carp: Number(formData.get('rate_auxiliar_carp')) || 0,
    rate_auxiliar_laq: Number(formData.get('rate_auxiliar_laq')) || 0,
    rate_administrativo: Number(formData.get('rate_administrativo')) || 0,
    monthly_rent: Number(formData.get('monthly_rent')) || 0,
    monthly_electricity: Number(formData.get('monthly_electricity')) || 0,
    monthly_machinery_depreciation: Number(formData.get('monthly_machinery_depreciation')) || 0,
    min_margin_pct: Number(formData.get('min_margin_pct')) || 35,
    updated_at: new Date().toISOString(),
  }).eq('id', config.id)

  // Recalculate all products with new min margin
  const minMargin = Number(formData.get('min_margin_pct')) || 35
  const { data: productos } = await supabase.from('products_catalog').select('id, sale_price, estimated_cost')
  for (const p of productos ?? []) {
    const { margin_pct, margin_status } = calcularSemaforo(Number(p.sale_price), Number(p.estimated_cost), minMargin)
    await supabase.from('products_catalog').update({ margin_pct, margin_status }).eq('id', p.id)
  }

  revalidatePath('/costos')
  redirect('/costos/config')
}
