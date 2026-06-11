-- =====================================================================
-- N's Lavandería - Provisioning de acceso (modelo LikeMagic)
-- Migration: 007_access_grants
--
-- Al confirmar una reserva se provisiona una credencial en el sistema de
-- acceso (Seam → SALTO KS) con ventana de validez inicio−15 → fin+15 min.
-- El cliente abre por BLE con la app Salto KS (sin waiver de remote open).
-- Esta tabla registra cada grant para auditoría y revocación.
-- =====================================================================

CREATE TYPE access_grant_status AS ENUM ('granted', 'revoked', 'failed', 'skipped');

CREATE TABLE public.access_grants (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_id UUID NOT NULL REFERENCES public.reservations(id) ON DELETE CASCADE,
  user_id        UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  provider       TEXT NOT NULL CHECK (provider IN ('seam', 'salto')),
  acs_user_id    TEXT,            -- id del usuario creado en el proveedor
  access_group_id TEXT,           -- access group asignado
  starts_at      TIMESTAMPTZ NOT NULL,
  ends_at        TIMESTAMPTZ NOT NULL,
  status         access_grant_status NOT NULL DEFAULT 'granted',
  provider_response JSONB,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  revoked_at     TIMESTAMPTZ,

  CONSTRAINT uq_grant_per_reservation UNIQUE (reservation_id)
);

CREATE INDEX idx_access_grants_user ON public.access_grants(user_id);
CREATE INDEX idx_access_grants_ends ON public.access_grants(ends_at) WHERE status = 'granted';

-- RLS: el usuario ve sus propios grants; escritura solo service_role
ALTER TABLE public.access_grants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "access_grants_select_own" ON public.access_grants
  FOR SELECT USING (user_id = auth.uid() OR public.is_admin());

-- Access group por máquina (la puerta del local usa el default por env)
ALTER TABLE public.machines
  ADD COLUMN IF NOT EXISTS access_group_id TEXT;

COMMENT ON COLUMN public.machines.access_group_id IS
  'Access group del proveedor para esta máquina; NULL = solo puerta del local (default por env)';
