-- Migration 002: Enable RLS on all app tables
-- Policy: authenticated users can do everything (single-tenant, Escobar pilot).
-- Multi-tenant isolation (taller_id) is handled in migration 003.

-- ─── clients ──────────────────────────────────────────────────────────────────
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authenticated full access" ON public.clients
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ─── hojas_viajeras ───────────────────────────────────────────────────────────
ALTER TABLE public.hojas_viajeras ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authenticated full access" ON public.hojas_viajeras
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ─── hoja_stages ──────────────────────────────────────────────────────────────
ALTER TABLE public.hoja_stages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authenticated full access" ON public.hoja_stages
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ─── materials ────────────────────────────────────────────────────────────────
ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authenticated full access" ON public.materials
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ─── material_movements ───────────────────────────────────────────────────────
ALTER TABLE public.material_movements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authenticated full access" ON public.material_movements
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ─── products_catalog ─────────────────────────────────────────────────────────
ALTER TABLE public.products_catalog ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authenticated full access" ON public.products_catalog
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ─── shop_config ──────────────────────────────────────────────────────────────
ALTER TABLE public.shop_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authenticated full access" ON public.shop_config
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
