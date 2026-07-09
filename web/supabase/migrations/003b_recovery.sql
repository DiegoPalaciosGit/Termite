-- Migration 003b: Recovery — continues from where 003 was cut off.
-- talleres + profiles already exist. Picks up from step 4 onward.

-- ─── Drop ALL remaining Laravel tables ───────────────────────────────────────
DROP TABLE IF EXISTS public.cache;
DROP TABLE IF EXISTS public.cache_locks;
DROP TABLE IF EXISTS public.failed_jobs;
DROP TABLE IF EXISTS public.job_batches;
DROP TABLE IF EXISTS public.jobs;
DROP TABLE IF EXISTS public.migrations;
DROP TABLE IF EXISTS public.password_reset_tokens;
DROP TABLE IF EXISTS public.sessions;
DROP TABLE IF EXISTS public.users CASCADE;

-- ─── Seed Escobar (skip if already inserted) ─────────────────────────────────
INSERT INTO public.talleres (id, name, slug)
VALUES ('79494691-05ee-4b83-a291-b30fc1ef391e', 'Carpintería Escobar', 'escobar')
ON CONFLICT (id) DO NOTHING;

-- ─── Add taller_id to app tables ─────────────────────────────────────────────
ALTER TABLE public.clients            ADD COLUMN IF NOT EXISTS taller_id UUID REFERENCES public.talleres(id);
ALTER TABLE public.hojas_viajeras     ADD COLUMN IF NOT EXISTS taller_id UUID REFERENCES public.talleres(id);
ALTER TABLE public.hoja_stages        ADD COLUMN IF NOT EXISTS taller_id UUID REFERENCES public.talleres(id);
ALTER TABLE public.materials          ADD COLUMN IF NOT EXISTS taller_id UUID REFERENCES public.talleres(id);
ALTER TABLE public.material_movements ADD COLUMN IF NOT EXISTS taller_id UUID REFERENCES public.talleres(id);
ALTER TABLE public.products_catalog   ADD COLUMN IF NOT EXISTS taller_id UUID REFERENCES public.talleres(id);
ALTER TABLE public.shop_config        ADD COLUMN IF NOT EXISTS taller_id UUID REFERENCES public.talleres(id);

-- ─── Backfill ─────────────────────────────────────────────────────────────────
UPDATE public.clients            SET taller_id = '79494691-05ee-4b83-a291-b30fc1ef391e' WHERE taller_id IS NULL;
UPDATE public.hojas_viajeras     SET taller_id = '79494691-05ee-4b83-a291-b30fc1ef391e' WHERE taller_id IS NULL;
UPDATE public.hoja_stages        SET taller_id = '79494691-05ee-4b83-a291-b30fc1ef391e' WHERE taller_id IS NULL;
UPDATE public.materials          SET taller_id = '79494691-05ee-4b83-a291-b30fc1ef391e' WHERE taller_id IS NULL;
UPDATE public.material_movements SET taller_id = '79494691-05ee-4b83-a291-b30fc1ef391e' WHERE taller_id IS NULL;
UPDATE public.products_catalog   SET taller_id = '79494691-05ee-4b83-a291-b30fc1ef391e' WHERE taller_id IS NULL;
UPDATE public.shop_config        SET taller_id = '79494691-05ee-4b83-a291-b30fc1ef391e' WHERE taller_id IS NULL;

-- ─── Make NOT NULL ────────────────────────────────────────────────────────────
ALTER TABLE public.clients            ALTER COLUMN taller_id SET NOT NULL;
ALTER TABLE public.hojas_viajeras     ALTER COLUMN taller_id SET NOT NULL;
ALTER TABLE public.hoja_stages        ALTER COLUMN taller_id SET NOT NULL;
ALTER TABLE public.materials          ALTER COLUMN taller_id SET NOT NULL;
ALTER TABLE public.material_movements ALTER COLUMN taller_id SET NOT NULL;
ALTER TABLE public.products_catalog   ALTER COLUMN taller_id SET NOT NULL;
ALTER TABLE public.shop_config        ALTER COLUMN taller_id SET NOT NULL;

-- ─── Profiles para Carlos y Diego ────────────────────────────────────────────
INSERT INTO public.profiles (user_id, taller_id, role)
VALUES ('1496ce35-6418-4ccf-8475-2eb5b9b0341c', '79494691-05ee-4b83-a291-b30fc1ef391e', 'admin')
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO public.profiles (user_id, taller_id, role)
VALUES ('a0444edf-feb1-4d45-afd7-466f2ea33f98', '79494691-05ee-4b83-a291-b30fc1ef391e', 'admin')
ON CONFLICT (user_id) DO NOTHING;

-- ─── Drop old policies (IF EXISTS para no tronar si ya fueron dropeadas) ──────
DROP POLICY IF EXISTS "authenticated full access" ON public.clients;
DROP POLICY IF EXISTS "authenticated full access" ON public.hojas_viajeras;
DROP POLICY IF EXISTS "authenticated full access" ON public.hoja_stages;
DROP POLICY IF EXISTS "authenticated full access" ON public.materials;
DROP POLICY IF EXISTS "authenticated full access" ON public.material_movements;
DROP POLICY IF EXISTS "authenticated full access" ON public.products_catalog;
DROP POLICY IF EXISTS "authenticated full access" ON public.shop_config;

-- ─── Helper function ──────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.my_taller_id()
RETURNS UUID
LANGUAGE sql STABLE
AS $$
  SELECT taller_id FROM public.profiles WHERE user_id = auth.uid()
$$;

-- ─── Taller-scoped RLS policies ───────────────────────────────────────────────
DROP POLICY IF EXISTS "taller isolation" ON public.clients;
CREATE POLICY "taller isolation" ON public.clients
  FOR ALL TO authenticated
  USING (taller_id = public.my_taller_id())
  WITH CHECK (taller_id = public.my_taller_id());

DROP POLICY IF EXISTS "taller isolation" ON public.hojas_viajeras;
CREATE POLICY "taller isolation" ON public.hojas_viajeras
  FOR ALL TO authenticated
  USING (taller_id = public.my_taller_id())
  WITH CHECK (taller_id = public.my_taller_id());

DROP POLICY IF EXISTS "taller isolation" ON public.hoja_stages;
CREATE POLICY "taller isolation" ON public.hoja_stages
  FOR ALL TO authenticated
  USING (taller_id = public.my_taller_id())
  WITH CHECK (taller_id = public.my_taller_id());

DROP POLICY IF EXISTS "taller isolation" ON public.materials;
CREATE POLICY "taller isolation" ON public.materials
  FOR ALL TO authenticated
  USING (taller_id = public.my_taller_id())
  WITH CHECK (taller_id = public.my_taller_id());

DROP POLICY IF EXISTS "taller isolation" ON public.material_movements;
CREATE POLICY "taller isolation" ON public.material_movements
  FOR ALL TO authenticated
  USING (taller_id = public.my_taller_id())
  WITH CHECK (taller_id = public.my_taller_id());

DROP POLICY IF EXISTS "taller isolation" ON public.products_catalog;
CREATE POLICY "taller isolation" ON public.products_catalog
  FOR ALL TO authenticated
  USING (taller_id = public.my_taller_id())
  WITH CHECK (taller_id = public.my_taller_id());

DROP POLICY IF EXISTS "taller isolation" ON public.shop_config;
CREATE POLICY "taller isolation" ON public.shop_config
  FOR ALL TO authenticated
  USING (taller_id = public.my_taller_id())
  WITH CHECK (taller_id = public.my_taller_id());
