'use client'
import { deleteUsuario } from './actions'

export default function DeleteUserButton({ userId, email }: { userId: string; email: string }) {
  async function handleDelete(formData: FormData) {
    if (!confirm(`¿Eliminar a ${email}?`)) return
    await deleteUsuario(formData)
  }

  return (
    <form action={handleDelete}>
      <input type="hidden" name="user_id" value={userId} />
      <button type="submit" className="text-xs text-dust hover:text-rust transition-colors uppercase tracking-widest">
        Eliminar
      </button>
    </form>
  )
}
