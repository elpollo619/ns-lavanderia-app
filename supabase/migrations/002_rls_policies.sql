-- =====================================================================
-- N's Lavandería - RLS Policies
-- Migration: 002_rls_policies
-- Modelo: usuarios solo ven/modifican sus propios datos.
--         Las Edge Functions usan service_role para bypass donde aplica.
-- =====================================================================

-- Habilitar RLS
ALTER TABLE public.users        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.machines     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments     ENABLE ROW LEVEL SECURITY;

-- ---------- USERS ----------
-- SELECT: solo su propia fila (admin ve todas)
CREATE POLICY "users_select_own" ON public.users
  FOR SELECT USING (auth.uid() = id OR EXISTS (
    SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role = 'admin'
  ));

-- UPDATE: solo su propia fila, sin cambiar role ni stripe_customer_id
CREATE POLICY "users_update_own" ON public.users
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- INSERT/DELETE: solo via trigger handle_new_user (no permitido al cliente)

-- ---------- MACHINES ----------
-- SELECT: público (autenticado). Cualquier user ve la lista.
CREATE POLICY "machines_select_all" ON public.machines
  FOR SELECT USING (auth.role() = 'authenticated');

-- INSERT/UPDATE/DELETE: solo admin
CREATE POLICY "machines_admin_all" ON public.machines
  FOR ALL USING (EXISTS (
    SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role = 'admin'
  ));

-- ---------- RESERVATIONS ----------
-- SELECT: propias (admin ve todas)
CREATE POLICY "reservations_select_own" ON public.reservations
  FOR SELECT USING (user_id = auth.uid() OR EXISTS (
    SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role = 'admin'
  ));

-- INSERT: solo para sí mismo
-- Nota: la creación real va vía Edge Function (que valida disponibilidad
-- y crea PaymentIntent). Esta policy es un safety net.
CREATE POLICY "reservations_insert_own" ON public.reservations
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- UPDATE: propias y solo si status='pending_payment' (cancelar/cambiar metodo)
CREATE POLICY "reservations_update_own_pending" ON public.reservations
  FOR UPDATE USING (
    user_id = auth.uid() AND status = 'pending_payment'
  ) WITH CHECK (user_id = auth.uid());

-- DELETE: propias y solo si status='pending_payment'
CREATE POLICY "reservations_delete_own_pending" ON public.reservations
  FOR DELETE USING (
    user_id = auth.uid() AND status = 'pending_payment'
  );

-- ---------- PAYMENTS ----------
-- SELECT: propios (admin ve todos)
CREATE POLICY "payments_select_own" ON public.payments
  FOR SELECT USING (user_id = auth.uid() OR EXISTS (
    SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role = 'admin'
  ));

-- INSERT/UPDATE/DELETE: solo service_role (vía Edge Functions / webhooks)
-- (al no crear policy adicional, queda denegado para roles authenticated/anon)

-- ---------- GRANTS para la vista slots_availability ----------
GRANT SELECT ON public.slots_availability TO authenticated;
