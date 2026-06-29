import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { updateConfig } from '../actions'

type FieldConfig = { name: string; label: string; defaultVal: number }

const inputCls = 'w-full border border-warm bg-white text-bark text-sm px-3 py-2 focus:outline-none focus:border-terra transition-colors'

export default async function ConfigTallerPage() {
  const supabase = await createClient()
  const { data: config } = await supabase.from('shop_config').select('*').single()

  if (!config) {
    return <p className="text-rust text-sm">Error: shop_config no encontrada en la base de datos.</p>
  }

  const costoIndirectoDiario = (
    Number(config.monthly_rent) + Number(config.monthly_electricity) + Number(config.monthly_machinery_depreciation)
  ) / 22

  const tarifas: FieldConfig[] = [
    { name: 'rate_carpintero',     label: 'Carpintero',       defaultVal: Number(config.rate_carpintero) },
    { name: 'rate_laqueador',      label: 'Laqueador',        defaultVal: Number(config.rate_laqueador) },
    { name: 'rate_cnc',            label: 'CNC',              defaultVal: Number(config.rate_cnc) },
    { name: 'rate_auxiliar_carp',  label: 'Aux. Carpintería', defaultVal: Number(config.rate_auxiliar_carp) },
    { name: 'rate_auxiliar_laq',   label: 'Aux. Laqueado',    defaultVal: Number(config.rate_auxiliar_laq) },
    { name: 'rate_administrativo', label: 'Administrativo',   defaultVal: Number(config.rate_administrativo) },
  ]

  const fijos: FieldConfig[] = [
    { name: 'monthly_rent',                   label: 'Renta mensual',           defaultVal: Number(config.monthly_rent) },
    { name: 'monthly_electricity',            label: 'Luz mensual',             defaultVal: Number(config.monthly_electricity) },
    { name: 'monthly_machinery_depreciation', label: 'Depreciación maquinaria', defaultVal: Number(config.monthly_machinery_depreciation) },
  ]

  return (
    <>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/costos" className="text-dust hover:text-bark transition-colors">←</Link>
        <p className="text-xs font-medium text-dust uppercase tracking-widest">Configuración del Taller</p>
      </div>

      <form action={updateConfig} className="space-y-4">
        <div className="bg-white border border-warm p-5">
          <p className="text-xs font-medium text-dust uppercase tracking-widest mb-4">Tarifas de Mano de Obra ($/hora)</p>
          <div className="space-y-3">
            {tarifas.map(f => (
              <div key={f.name} className="flex items-center gap-3">
                <label className="text-sm text-umber w-36 shrink-0">{f.label}</label>
                <div className="flex items-center gap-1 flex-1">
                  <span className="text-sm text-dust">$</span>
                  <input name={f.name} type="number" min="0" step="0.01" defaultValue={f.defaultVal.toFixed(2)} className={inputCls} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-warm p-5">
          <p className="text-xs font-medium text-dust uppercase tracking-widest mb-4">Costos Fijos Mensuales ($MXN)</p>
          <div className="space-y-3">
            {fijos.map(f => (
              <div key={f.name} className="flex items-center gap-3">
                <label className="text-sm text-umber w-36 shrink-0">{f.label}</label>
                <div className="flex items-center gap-1 flex-1">
                  <span className="text-sm text-dust">$</span>
                  <input name={f.name} type="number" min="0" step="0.01" defaultValue={f.defaultVal.toFixed(2)} className={inputCls} />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-warm">
            <p className="text-xs text-dust uppercase tracking-widest mb-1">Costo indirecto diario (÷22 días hábiles)</p>
            <p className="text-2xl font-bold text-bark">${costoIndirectoDiario.toFixed(2)} <span className="text-sm font-normal text-dust">/ día</span></p>
          </div>
        </div>

        <div className="bg-white border border-warm p-5">
          <p className="text-xs font-medium text-dust uppercase tracking-widest mb-3">Umbral de Margen Mínimo</p>
          <div className="flex items-center gap-3">
            <input name="min_margin_pct" type="number" min="1" max="100" step="0.1"
              defaultValue={Number(config.min_margin_pct).toFixed(1)}
              className="w-24 border border-warm bg-white text-bark text-sm px-3 py-2 focus:outline-none focus:border-terra transition-colors" />
            <span className="text-sm text-umber">% mínimo para margen verde</span>
          </div>
          <p className="text-xs text-dust mt-2">
            Al cambiar este valor se recalcula la rentabilidad de todos los productos.
          </p>
        </div>

        <button type="submit" className="w-full bg-terra hover:bg-terra-dark text-white font-medium py-2.5 px-4 text-sm tracking-wide transition-colors">
          Guardar configuración
        </button>
      </form>
    </>
  )
}
