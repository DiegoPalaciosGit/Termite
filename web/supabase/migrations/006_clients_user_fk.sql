-- Migration 006: clients.user_id → ON DELETE SET NULL
--
-- El FK original (004) no tenía cláusula ON DELETE, así que borrar un usuario
-- de auth (via admin.deleteUser en /usuarios) fallaba con FK violation cuando
-- el usuario estaba vinculado a un cliente, dejando usuarios zombie sin correo.
-- Con SET NULL, borrar la cuenta simplemente desvincula el registro del cliente.

ALTER TABLE public.clients
  DROP CONSTRAINT IF EXISTS clients_user_id_fkey;

ALTER TABLE public.clients
  ADD CONSTRAINT clients_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;
