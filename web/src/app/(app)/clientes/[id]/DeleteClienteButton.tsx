'use client'
import { deleteCliente } from '../actions'

export default function DeleteClienteButton({ clientId, name }: { clientId: string; name: string }) {
  async function handleDelete(formData: FormData) {
    if (!confirm(`¿Eliminar a ${name}? Si tiene acceso al portal, su cuenta también se elimina.`)) return
    await deleteCliente(formData)
  }

  return (
    <form action={handleDelete}>
      <input type="hidden" name="client_id" value={clientId} />
      <button type="submit" className="text-xs text-dust hover:text-rust transition-colors uppercase tracking-widest">
        Eliminar
      </button>
    </form>
  )
}
