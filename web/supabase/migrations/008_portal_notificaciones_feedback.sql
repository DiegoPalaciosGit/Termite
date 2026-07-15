-- Migration 008: notificaciones del portal + feedback de compras
--
-- client_notifications: se generan por triggers en la DB (no en código de app)
-- para que cualquier vía de escritura las dispare:
--   - INSERT en hoja_stages  → "Tu mueble X pasó a la etapa Y"
--   - UPDATE de status en hojas_viajeras → aprobado / corrección / terminado
-- client_feedback: una reseña (rating + comentario) por pedido entregado.

-- ─── 1. client_notifications ─────────────────────────────────────────────────
CREATE TABLE public.client_notifications (
  id              BIGSERIAL PRIMARY KEY,
  taller_id       UUID   NOT NULL REFERENCES public.talleres(id) ON DELETE CASCADE,
  client_id       BIGINT NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  hoja_viajera_id BIGINT NOT NULL REFERENCES public.hojas_viajeras(id) ON DELETE CASCADE,
  message         TEXT   NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_client_notifications_client ON public.client_notifications (client_id, created_at DESC);

ALTER TABLE public.client_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "client read own" ON public.client_notifications
  FOR SELECT TO authenticated
  USING (client_id IN (SELECT id FROM public.clients WHERE user_id = auth.uid()));

CREATE POLICY "client delete own" ON public.client_notifications
  FOR DELETE TO authenticated
  USING (client_id IN (SELECT id FROM public.clients WHERE user_id = auth.uid()));

CREATE POLICY "staff read" ON public.client_notifications
  FOR SELECT TO authenticated
  USING (taller_id = public.my_taller_id() AND public.my_role() != 'client');

-- ─── 2. client_feedback ──────────────────────────────────────────────────────
CREATE TABLE public.client_feedback (
  id              BIGSERIAL PRIMARY KEY,
  taller_id       UUID   NOT NULL REFERENCES public.talleres(id) ON DELETE CASCADE,
  client_id       BIGINT NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  hoja_viajera_id BIGINT NOT NULL UNIQUE REFERENCES public.hojas_viajeras(id) ON DELETE CASCADE,
  rating          INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment         TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.client_feedback ENABLE ROW LEVEL SECURITY;

-- El cliente crea/edita/lee solo feedback de sus propios pedidos
CREATE POLICY "client manage own" ON public.client_feedback
  FOR ALL TO authenticated
  USING (client_id IN (SELECT id FROM public.clients WHERE user_id = auth.uid()))
  WITH CHECK (
    client_id IN (SELECT id FROM public.clients WHERE user_id = auth.uid())
    AND hoja_viajera_id IN (
      SELECT id FROM public.hojas_viajeras
      WHERE client_id IN (SELECT id FROM public.clients WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "staff read" ON public.client_feedback
  FOR SELECT TO authenticated
  USING (taller_id = public.my_taller_id() AND public.my_role() != 'client');

-- ─── 3. Trigger: notificar etapa registrada ──────────────────────────────────
CREATE OR REPLACE FUNCTION public.notify_stage()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  h RECORD;
  stage_label TEXT;
BEGIN
  SELECT id, client_id, taller_id, product_name INTO h
    FROM public.hojas_viajeras WHERE id = NEW.hoja_viajera_id;

  IF h.client_id IS NULL THEN RETURN NEW; END IF;

  stage_label := CASE NEW.stage
    WHEN 'corte'     THEN 'Corte (CNC / Sierra)'
    WHEN 'lijado'    THEN 'Lijado / Porosidad'
    WHEN 'laca'      THEN 'Laca / Pintura'
    WHEN 'ensamble'  THEN 'Ensamble / Herrajes'
    WHEN 'emplayado' THEN 'Emplayado y Almacén'
    ELSE NEW.stage
  END;

  INSERT INTO public.client_notifications (taller_id, client_id, hoja_viajera_id, message)
  VALUES (h.taller_id, h.client_id, h.id,
          'Tu mueble ' || h.product_name || ' pasó a la etapa ' || stage_label);

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_stage ON public.hoja_stages;
CREATE TRIGGER trg_notify_stage
  AFTER INSERT ON public.hoja_stages
  FOR EACH ROW EXECUTE FUNCTION public.notify_stage();

-- ─── 4. Trigger: notificar cambio de estado ──────────────────────────────────
CREATE OR REPLACE FUNCTION public.notify_status()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  msg TEXT;
BEGIN
  IF NEW.client_id IS NULL OR NEW.status = OLD.status THEN RETURN NEW; END IF;

  msg := CASE NEW.status
    WHEN 'en_proceso' THEN
      CASE WHEN OLD.status = 'pendiente_aprobacion'
        THEN 'Tu pedido ' || NEW.product_name || ' fue aprobado y entró a producción'
        ELSE 'Tu mueble ' || NEW.product_name || ' volvió a producción'
      END
    WHEN 'retrabajo' THEN 'Tu mueble ' || NEW.product_name || ' está en corrección para asegurar la calidad'
    WHEN 'terminado' THEN 'Tu mueble ' || NEW.product_name || ' está terminado y listo para entrega'
    ELSE NULL
  END;

  IF msg IS NOT NULL THEN
    INSERT INTO public.client_notifications (taller_id, client_id, hoja_viajera_id, message)
    VALUES (NEW.taller_id, NEW.client_id, NEW.id, msg);
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_status ON public.hojas_viajeras;
CREATE TRIGGER trg_notify_status
  AFTER UPDATE OF status ON public.hojas_viajeras
  FOR EACH ROW EXECUTE FUNCTION public.notify_status();
