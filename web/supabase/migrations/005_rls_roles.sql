-- Migration 005: RLS por rol — cierra fugas del rol 'client' y arregla invite.
--
-- Problemas que corrige:
--   a) profiles.role CHECK no incluía 'client' → el upsert del invite de portal
--      fallaba con check violation (bug del commit 86e62b7).
--   b) Las policies "taller isolation" daban a los clientes acceso total
--      (lectura Y escritura) a materials, material_movements, hoja_stages,
--      shop_config y products_catalog. Ahora cada tabla se limita por rol.
--   c) is_visible_to_clients existía solo en el dashboard, no en migraciones.
--
-- Matriz resultante:
--   admin   → todo su taller
--   worker  → hojas/etapas/materiales/movimientos (todo), clients solo lectura,
--             catálogo solo lectura, shop_config sin acceso
--   viewer  → solo lectura de tablas operativas
--   client  → su registro en clients, sus hojas (leer + crear solicitud),
--             catálogo solo productos visibles

-- ─── 1. profiles: permitir rol 'client' ──────────────────────────────────────
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('admin', 'worker', 'viewer', 'client'));

-- ─── 2. Helper: rol del usuario actual ───────────────────────────────────────
CREATE OR REPLACE FUNCTION public.my_role()
RETURNS TEXT
LANGUAGE sql STABLE
AS $$
  SELECT role FROM public.profiles WHERE user_id = auth.uid()
$$;

-- ─── 3. products_catalog: columna de visibilidad (idempotente) ───────────────
ALTER TABLE public.products_catalog
  ADD COLUMN IF NOT EXISTS is_visible_to_clients BOOLEAN NOT NULL DEFAULT false;

-- ─── 4. materials: solo staff ────────────────────────────────────────────────
DROP POLICY IF EXISTS "taller isolation" ON public.materials;

CREATE POLICY "staff full access" ON public.materials
  FOR ALL TO authenticated
  USING (taller_id = public.my_taller_id() AND public.my_role() IN ('admin', 'worker'))
  WITH CHECK (taller_id = public.my_taller_id() AND public.my_role() IN ('admin', 'worker'));

CREATE POLICY "viewer read" ON public.materials
  FOR SELECT TO authenticated
  USING (taller_id = public.my_taller_id() AND public.my_role() = 'viewer');

-- ─── 5. material_movements: solo staff ───────────────────────────────────────
DROP POLICY IF EXISTS "taller isolation" ON public.material_movements;

CREATE POLICY "staff full access" ON public.material_movements
  FOR ALL TO authenticated
  USING (taller_id = public.my_taller_id() AND public.my_role() IN ('admin', 'worker'))
  WITH CHECK (taller_id = public.my_taller_id() AND public.my_role() IN ('admin', 'worker'));

CREATE POLICY "viewer read" ON public.material_movements
  FOR SELECT TO authenticated
  USING (taller_id = public.my_taller_id() AND public.my_role() = 'viewer');

-- ─── 6. hoja_stages: solo staff ──────────────────────────────────────────────
DROP POLICY IF EXISTS "taller isolation" ON public.hoja_stages;

CREATE POLICY "staff full access" ON public.hoja_stages
  FOR ALL TO authenticated
  USING (taller_id = public.my_taller_id() AND public.my_role() IN ('admin', 'worker'))
  WITH CHECK (taller_id = public.my_taller_id() AND public.my_role() IN ('admin', 'worker'));

CREATE POLICY "viewer read" ON public.hoja_stages
  FOR SELECT TO authenticated
  USING (taller_id = public.my_taller_id() AND public.my_role() = 'viewer');

-- ─── 7. shop_config: solo admin (tarifas y costos son sensibles) ─────────────
DROP POLICY IF EXISTS "taller isolation" ON public.shop_config;

CREATE POLICY "admin full access" ON public.shop_config
  FOR ALL TO authenticated
  USING (taller_id = public.my_taller_id() AND public.my_role() = 'admin')
  WITH CHECK (taller_id = public.my_taller_id() AND public.my_role() = 'admin');

-- ─── 8. products_catalog: admin escribe, staff lee, cliente ve visibles ──────
DROP POLICY IF EXISTS "taller isolation" ON public.products_catalog;

CREATE POLICY "admin full access" ON public.products_catalog
  FOR ALL TO authenticated
  USING (taller_id = public.my_taller_id() AND public.my_role() = 'admin')
  WITH CHECK (taller_id = public.my_taller_id() AND public.my_role() = 'admin');

CREATE POLICY "staff read" ON public.products_catalog
  FOR SELECT TO authenticated
  USING (taller_id = public.my_taller_id() AND public.my_role() IN ('worker', 'viewer'));

CREATE POLICY "client read visible" ON public.products_catalog
  FOR SELECT TO authenticated
  USING (
    taller_id = public.my_taller_id()
    AND public.my_role() = 'client'
    AND is_visible_to_clients = true
  );

-- ─── 9. clients: admin escribe, staff lee, cliente lee su registro ───────────
-- (reemplaza "staff clients access" de 004, que dejaba escribir a workers)
DROP POLICY IF EXISTS "staff clients access" ON public.clients;

CREATE POLICY "admin full access" ON public.clients
  FOR ALL TO authenticated
  USING (taller_id = public.my_taller_id() AND public.my_role() = 'admin')
  WITH CHECK (taller_id = public.my_taller_id() AND public.my_role() = 'admin');

CREATE POLICY "staff read" ON public.clients
  FOR SELECT TO authenticated
  USING (taller_id = public.my_taller_id() AND public.my_role() IN ('worker', 'viewer'));

-- "client own record" (SELECT propio) de 004 se conserva tal cual.

-- ─── 10. hojas_viajeras: separar staff por rol + endurecer insert de cliente ─
DROP POLICY IF EXISTS "staff hojas access" ON public.hojas_viajeras;

CREATE POLICY "staff full access" ON public.hojas_viajeras
  FOR ALL TO authenticated
  USING (taller_id = public.my_taller_id() AND public.my_role() IN ('admin', 'worker'))
  WITH CHECK (taller_id = public.my_taller_id() AND public.my_role() IN ('admin', 'worker'));

CREATE POLICY "viewer read" ON public.hojas_viajeras
  FOR SELECT TO authenticated
  USING (taller_id = public.my_taller_id() AND public.my_role() = 'viewer');

-- Cliente solo puede crear solicitudes pendientes, no órdenes ya aprobadas
DROP POLICY IF EXISTS "client create hoja" ON public.hojas_viajeras;

CREATE POLICY "client create hoja" ON public.hojas_viajeras
  FOR INSERT TO authenticated
  WITH CHECK (
    client_id IN (SELECT id FROM public.clients WHERE user_id = auth.uid())
    AND taller_id = public.my_taller_id()
    AND status = 'pendiente_aprobacion'
  );

-- "client own hojas" (SELECT) de 004 se conserva tal cual.
