import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function ClientesPage() {
  const supabase = await createClient()
  const { data: clientes } = await supabase
    .from('clients')
    .select('id, name, phone, email')
    .order('name')

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-semibold text-bark">Clientes</h1>
          <p className="text-sm text-dust mt-0.5">Directorio y historial de órdenes</p>
        </div>
        <Link
          href="/clientes/nuevo"
          className="bg-terra hover:bg-terra-dark text-white font-medium py-2 px-4 text-xs tracking-wide transition-colors shrink-0"
        >
          + Nuevo
        </Link>
      </div>

      {(clientes ?? []).length === 0 ? (
        <div className="text-center py-16 text-dust border border-dashed border-warm">
          <p className="text-sm mb-2">Sin clientes todavía</p>
          <Link href="/clientes/nuevo" className="text-terra hover:text-terra-dark text-sm font-medium">
            Agregar el primero →
          </Link>
        </div>
      ) : (
        <div className="space-y-px">
          {(clientes ?? []).map(c => (
            <Link
              key={c.id}
              href={`/clientes/${c.id}`}
              className="block bg-white border border-warm px-4 py-3 hover:bg-linen transition-colors"
            >
              <p className="font-medium text-bark">{c.name}</p>
              <div className="flex gap-4 mt-0.5">
                {c.phone && <p className="text-sm text-umber">{c.phone}</p>}
                {c.email && <p className="text-sm text-dust">{c.email}</p>}
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  )
}
