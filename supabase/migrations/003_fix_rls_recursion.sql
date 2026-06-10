-- =====================================================================
-- N's Lavandería - Fix: recursión infinita en políticas RLS
-- Migration: 003_fix_rls_recursion
--
-- Problema: las políticas que comprueban "es admin" consultan
-- public.users dentro de su USING. Al evaluar la policy de SELECT de
-- users, Postgres vuelve a aplicar esa misma policy sobre la subquery
-- → "infinite recursion detected in policy for relation users" (42P17).
-- El error rompe cualquier query cuya policy toque users (machines,
-- reservations, payments incluidos).
--
-- Solución: función SECURITY DEFINER que lee users SIN pasar por RLS.
-- =====================================================================

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.id = auth.uid() AND u.role = 'admin'
  );
$$;

-- Solo lectura para roles de cliente; el cuerpo corre como owner (bypass RLS)
REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated, anon, service_role;

-- ---------- Recrear políticas afectadas ----------

DROP POLICY IF EXISTS "users_select_own" ON public.users;
CREATE POLICY "users_select_own" ON public.users
  FOR SELECT USING (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS "machines_admin_all" ON public.machines;
CREATE POLICY "machines_admin_all" ON public.machines
  FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "reservations_select_own" ON public.reservations;
CREATE POLICY "reservations_select_own" ON public.reservations
  FOR SELECT USING (user_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "payments_select_own" ON public.payments;
CREATE POLICY "payments_select_own" ON public.payments
  FOR SELECT USING (user_id = auth.uid() OR public.is_admin());
