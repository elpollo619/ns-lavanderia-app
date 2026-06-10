-- =====================================================================
-- N's Lavandería - Reservas del flujo de diseño
-- Migration: 006_design_bookings
--
-- 1) Los programas del diseño duran 35/45/60 min → relajar chk_duration
--    (antes solo permitía 30/60/120).
-- 2) Guardar programa y extras elegidos.
-- 3) Permitir al usuario cancelar sus reservas futuras (la política de 002
--    solo cubría status='pending_payment'; las de "Vor Ort" nacen 'confirmed').
-- =====================================================================

ALTER TABLE public.reservations
  DROP CONSTRAINT IF EXISTS chk_duration;
ALTER TABLE public.reservations
  ADD CONSTRAINT chk_duration CHECK (duration_minutes BETWEEN 15 AND 180);

ALTER TABLE public.reservations
  ADD COLUMN IF NOT EXISTS program TEXT,
  ADD COLUMN IF NOT EXISTS extras JSONB NOT NULL DEFAULT '[]'::jsonb;

-- Cancelación: el usuario puede pasar sus reservas futuras (aún no iniciadas)
-- de pending_payment/confirmed a cancelled. WITH CHECK fija el único destino.
DROP POLICY IF EXISTS "reservations_cancel_own_future" ON public.reservations;
CREATE POLICY "reservations_cancel_own_future" ON public.reservations
  FOR UPDATE
  USING (
    user_id = auth.uid()
    AND status IN ('pending_payment', 'confirmed')
    AND start_time > NOW()
  )
  WITH CHECK (
    user_id = auth.uid()
    AND status = 'cancelled'
  );
