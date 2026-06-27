import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { updateConfig } from '../actions'

type FieldConfig = { name: string; label: string; defaultVal: number }

export default async function ConfigTallerPage() {
  const supabase = await createClient()
  const { data: config } = await supabase.from('shop_config').select('*').single()

  if (!config) {
    return <p className="text-red-600 text-sm">Error: shop_config no encontrada en la base de datos.</p>
  }

  const costoIndirectoDiario = (
    Number(config.monthly_rent) + Number(config.monthly_electricity) + Number(config.monthly_machinery_depreciation)
  ) / 22

  const tarifas: FieldConfig[] = [
    { name: 'rate_carpintero',    label: 'Carpintero',          defaultVal: Number(config.rate_carpintero) },
    { name: 'rate_laqueador',     label: 'Laqueador',           defaultVal: Number(config.rate_laqueador) },
    { name: 'rate_cnc',           label: 'CNC',                 defaultVal: Number(config.rate_cnc) },
    { name: 'rate_auxiliar_carp', label: 'Aux. Carpintería',    defaultVal: Number(config.rate_auxiliar_carp) },
    { name: 'rate_auxiliar_laq',  label: 'Aux. Laqueado',       defaultVal: Number(config.rate_auxiliar_laq) },
    { name: 'rate_administrativo',label: 'Administrativo',      defaultVal: Number(config.rate_administrativo) },
  ]

  const fijos: FieldConfig[] = [
    { name: 'monthly_rent',                   label: 'Renta mensual',          defaultVal: Number(config.monthly_rent) },
    { name: 'monthly_electricity',            label: 'Luz mensual',            defaultVal: Number(config.monthly_electricity) },
    { name: 'monthly_machinery_depreciation', label: 'Depreciación maquinaria',defaultVal: Number(config.monthly_machinery_depreciation) },
  ]

  return (
    <>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/costos" className="text-gray-400 hover:text-gray-600 text-lg">←</Link>
        <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Configuración del Taller</h2>
      </div>

      <form action={updateConfig} className="space-y-5 max-w-lg">
        {/* Tarifas MO */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Tarifas de Mano de Obra ($/hora)</h3>
          <div className="space-y-3">
            {tarifas.map(f => (
              <div key={f.name} className="flex items-center gap-3">
                <label className="text-sm text-gray-600 w-36 shrink-0">{f.label}</label>
                <div className="flex items-center gap-1 flex-1">
                  <span className="text-sm text-gray-400">$</span>
                  <input name={f.name} type="number" min="0" step="0.01" defaultValue={f.defaultVal.toFixed(2)}
                    className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Costos fijos */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Costos Fijos Mensuales ($MXN)</h3>
          <div className="space-y-3">
            {fijos.map(f => (
              <div key={f.name} className="flex items-center gap-3">
                <label className="text-sm text-gray-600 w-36 shrink-0">{f.label}</label>
                <div className="flex items-center gap-1 flex-1">
                  <span className="text-sm text-gray-400">$</span>
                  <input name={f.name} type="number" min="0" step="0.01" defaultValue={f.defaultVal.toFixed(2)}
                    className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-500">Costo indirecto diario estimado (÷22 días hábiles)</p>
            <p className="text-lg font-bold text-gray-900">${costoIndirectoDiario.toFixed(2)} / día</p>
          </div>
        </div>

        {/* Umbral margen */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Umbral de Margen Mínimo</h3>
          <div className="flex items-center gap-3">
            <input name="min_margin_pct" type="number" min="1" max="100" step="0.1"
              defaultValue={Number(config.min_margin_pct).toFixed(1)}
              className="w-24 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
            <span className="text-sm text-gray-500">% mínimo para margen verde</span>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            Cambiar esto recalcula el semáforo de todos los productos.
          </p>
        </div>

        <button type="submit" className="w-full bg-amber-500 hover:bg-amber-600 text-white font-medium py-2.5 rounded-lg transition-colors">
          Guardar configuración
        </button>
      </form>
    </>
  )
}
