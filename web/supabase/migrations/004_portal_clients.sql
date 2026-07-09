-- Portal de clientes: user_id en clients + RLS granular por rol

-- 1. Columna user_id en clients (vincula cuenta auth → registro de cliente)
ALTER TABLE public.clients
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) UNIQUE;

-- 2. RLS clients: staff ve todos en su taller; cliente solo su propio registro
DROP POLICY IF EXISTS "taller isolation" ON public.clients;

CREATE POLICY "staff clients access" ON public.clients
  FOR ALL TO authenticated
  USING (
    taller_id = public.my_taller_id()
    AND (SELECT role FROM public.profiles WHERE user_id = auth.uid()) != 'client'
  )
  WITH CHECK (
    taller_id = public.my_taller_id()
    AND (SELECT role FROM public.profiles WHERE user_id = auth.uid()) != 'client'
  );

CREATE POLICY "client own record" ON public.clients
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- 3. RLS hojas_viajeras: staff full access; clientes solo sus hojas + crear nuevas
DROP POLICY IF EXISTS "taller isolation" ON public.hojas_viajeras;

CREATE POLICY "staff hojas access" ON public.hojas_viajeras
  FOR ALL TO authenticated
  USING (
    taller_id = public.my_taller_id()
    AND (SELECT role FROM public.profiles WHERE user_id = auth.uid()) != 'client'
  )
  WITH CHECK (
    taller_id = public.my_taller_id()
    AND (SELECT role FROM public.profiles WHERE user_id = auth.uid()) != 'client'
  );

CREATE POLICY "client own hojas" ON public.hojas_viajeras
  FOR SELECT TO authenticated
  USING (
    client_id IN (SELECT id FROM public.clients WHERE user_id = auth.uid())
  );

CREATE POLICY "client create hoja" ON public.hojas_viajeras
  FOR INSERT TO authenticated
  WITH CHECK (
    client_id IN (SELECT id FROM public.clients WHERE user_id = auth.uid())
    AND taller_id = public.my_taller_id()
  );
