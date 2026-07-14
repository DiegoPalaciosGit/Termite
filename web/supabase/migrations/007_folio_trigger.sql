-- Migration 007: generación de folio en la base de datos
--
-- Antes el folio se calculaba en el server action contando filas visibles.
-- Dos bugs: (a) un cliente del portal solo ve SUS hojas bajo RLS, así que el
-- count queda corto y el folio colisiona con la constraint UNIQUE; (b) dos
-- requests simultáneos generan el mismo folio (race condition).
--
-- Solución: trigger BEFORE INSERT. SECURITY DEFINER para contar todas las
-- hojas del taller sin que RLS recorte la vista; advisory lock por
-- taller+año para serializar inserts concurrentes.

CREATE OR REPLACE FUNCTION public.assign_folio()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  yr TEXT := to_char(now(), 'YYYY');
  next_n INTEGER;
BEGIN
  IF NEW.folio IS NULL OR NEW.folio = '' THEN
    PERFORM pg_advisory_xact_lock(hashtext('folio:' || NEW.taller_id::text || ':' || yr));

    SELECT COALESCE(MAX(substring(folio from '\d+$')::int), 0) + 1
      INTO next_n
      FROM public.hojas_viajeras
     WHERE taller_id = NEW.taller_id
       AND folio LIKE 'HV-' || yr || '-%';

    NEW.folio := 'HV-' || yr || '-' || lpad(next_n::text, 3, '0');
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_assign_folio ON public.hojas_viajeras;
CREATE TRIGGER trg_assign_folio
  BEFORE INSERT ON public.hojas_viajeras
  FOR EACH ROW EXECUTE FUNCTION public.assign_folio();
