-- Migration 003: Multi-tenant isolation via taller_id
-- Creates talleres + profiles tables, adds taller_id to all app tables,
-- backfills existing rows with Escobar's taller, updates RLS policies.

-- ─── 1. talleres ──────────────────────────────────────────────────────────────
CREATE TABLE public.talleres (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  slug       TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.talleres ENABLE ROW LEVEL SECURITY;

-- Members can read their own taller only
CREATE POLICY "members read own taller" ON public.talleres
  FOR SELECT
  TO authenticated
  USING (
    id IN (SELECT taller_id FROM public.profiles WHERE user_id = auth.uid())
  );

-- ─── 2. profiles (auth.users → taller_id) ────────────────────────────────────
CREATE TABLE public.profiles (
  user_id    UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  taller_id  UUID NOT NULL REFERENCES public.talleres(id) ON DELETE CASCADE,
  role       TEXT NOT NULL DEFAULT 'worker' CHECK (role IN ('admin', 'worker', 'viewer')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Users can only read their own profile
CREATE POLICY "read own profile" ON public.profiles
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- ─── 3. Seed Carpintería Escobar ──────────────────────────────────────────────
-- Run this block, then copy the generated UUID to use in step 4.
INSERT INTO public.talleres (id, name, slug)
VALUES ('79494691-05ee-4b83-a291-b30fc1ef391e', 'Carpintería Escobar', 'escobar');

-- ─── 4. Add taller_id to app tables ──────────────────────────────────────────
ALTER TABLE public.clients            ADD COLUMN taller_id UUID REFERENCES public.talleres(id);
ALTER TABLE public.hojas_viajeras     ADD COLUMN taller_id UUID REFERENCES public.talleres(id);
ALTER TABLE public.hoja_stages        ADD COLUMN taller_id UUID REFERENCES public.talleres(id);
ALTER TABLE public.materials          ADD COLUMN taller_id UUID REFERENCES public.talleres(id);
ALTER TABLE public.material_movements ADD COLUMN taller_id UUID REFERENCES public.talleres(id);
ALTER TABLE public.products_catalog   ADD COLUMN taller_id UUID REFERENCES public.talleres(id);
ALTER TABLE public.shop_config        ADD COLUMN taller_id UUID REFERENCES public.talleres(id);

-- Backfill all existing rows with Escobar's taller_id
UPDATE public.clients            SET taller_id = '79494691-05ee-4b83-a291-b30fc1ef391e';
UPDATE public.hojas_viajeras     SET taller_id = '79494691-05ee-4b83-a291-b30fc1ef391e';
UPDATE public.hoja_stages        SET taller_id = '79494691-05ee-4b83-a291-b30fc1ef391e';
UPDATE public.materials          SET taller_id = '79494691-05ee-4b83-a291-b30fc1ef391e';
UPDATE public.material_movements SET taller_id = '79494691-05ee-4b83-a291-b30fc1ef391e';
UPDATE public.products_catalog   SET taller_id = '79494691-05ee-4b83-a291-b30fc1ef391e';
UPDATE public.shop_config        SET taller_id = '79494691-05ee-4b83-a291-b30fc1ef391e';

-- Make NOT NULL after backfill
ALTER TABLE public.clients            ALTER COLUMN taller_id SET NOT NULL;
ALTER TABLE public.hojas_viajeras     ALTER COLUMN taller_id SET NOT NULL;
ALTER TABLE public.hoja_stages        ALTER COLUMN taller_id SET NOT NULL;
ALTER TABLE public.materials          ALTER COLUMN taller_id SET NOT NULL;
ALTER TABLE public.material_movements ALTER COLUMN taller_id SET NOT NULL;
ALTER TABLE public.products_catalog   ALTER COLUMN taller_id SET NOT NULL;
ALTER TABLE public.shop_config        ALTER COLUMN taller_id SET NOT NULL;

-- ─── 5. Add Carlos and Diego to Escobar's profiles ───────────────────────────
INSERT INTO public.profiles (user_id, taller_id, role)
VALUES ('1496ce35-6418-4ccf-8475-2eb5b9b0341c', '79494691-05ee-4b83-a291-b30fc1ef391e', 'admin');

INSERT INTO public.profiles (user_id, taller_id, role)
VALUES ('a0444edf-feb1-4d45-afd7-466f2ea33f98', '79494691-05ee-4b83-a291-b30fc1ef391e', 'admin');

-- ─── 6. Drop old RLS policies and replace with taller-scoped ones ─────────────
DROP POLICY "authenticated full access" ON public.clients;
DROP POLICY "authenticated full access" ON public.hojas_viajeras;
DROP POLICY "authenticated full access" ON public.hoja_stages;
DROP POLICY "authenticated full access" ON public.materials;
DROP POLICY "authenticated full access" ON public.material_movements;
DROP POLICY "authenticated full access" ON public.products_catalog;
DROP POLICY "authenticated full access" ON public.shop_config;

-- Helper: returns the taller_id of the current user
CREATE OR REPLACE FUNCTION public.my_taller_id()
RETURNS UUID
LANGUAGE sql STABLE
AS $$
  SELECT taller_id FROM public.profiles WHERE user_id = auth.uid()
$$;

-- New scoped policies
CREATE POLICY "taller isolation" ON public.clients
  FOR ALL TO authenticated
  USING (taller_id = public.my_taller_id())
  WITH CHECK (taller_id = public.my_taller_id());

CREATE POLICY "taller isolation" ON public.hojas_viajeras
  FOR ALL TO authenticated
  USING (taller_id = public.my_taller_id())
  WITH CHECK (taller_id = public.my_taller_id());

CREATE POLICY "taller isolation" ON public.hoja_stages
  FOR ALL TO authenticated
  USING (taller_id = public.my_taller_id())
  WITH CHECK (taller_id = public.my_taller_id());

CREATE POLICY "taller isolation" ON public.materials
  FOR ALL TO authenticated
  USING (taller_id = public.my_taller_id())
  WITH CHECK (taller_id = public.my_taller_id());

CREATE POLICY "taller isolation" ON public.material_movements
  FOR ALL TO authenticated
  USING (taller_id = public.my_taller_id())
  WITH CHECK (taller_id = public.my_taller_id());

CREATE POLICY "taller isolation" ON public.products_catalog
  FOR ALL TO authenticated
  USING (taller_id = public.my_taller_id())
  WITH CHECK (taller_id = public.my_taller_id());

CREATE POLICY "taller isolation" ON public.shop_config
  FOR ALL TO authenticated
  USING (taller_id = public.my_taller_id())
  WITH CHECK (taller_id = public.my_taller_id());
