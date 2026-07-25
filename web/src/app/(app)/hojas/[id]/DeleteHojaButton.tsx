'use client'
import { deleteHoja } from '../actions'

export default function DeleteHojaButton({ hojaId, folio }: { hojaId: string; folio: string }) {
  async function handleDelete(formData: FormData) {
    if (!confirm(`¿Eliminar la orden ${folio}? Esta acción no se puede deshacer.`)) return
    await deleteHoja(formData)
  }

  return (
    <form action={handleDelete}>
      <input type="hidden" name="id" value={hojaId} />
      <button type="submit" className="text-xs text-dust hover:text-rust transition-colors uppercase tracking-widest">
        Eliminar
      </button>
    </form>
  )
}
