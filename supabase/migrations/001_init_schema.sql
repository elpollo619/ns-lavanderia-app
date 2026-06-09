-- =====================================================================
-- N's Lavandería - Initial Schema
-- Migration: 001_init_schema
-- Descripción: users, machines, reservations, payments, slots view.
-- =====================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "btree_gist";

-- ENUMS
CREATE TYPE user_role          AS ENUM ('user', 'admin');
CREATE TYPE machine_type       AS ENUM ('washer', 'dryer');
CREATE TYPE machine_status     AS ENUM ('available', 'in_use', 'maintenance', 'offline');
CREATE TYPE reservation_status AS ENUM ('pending_payment', 'confirmed', 'active', 'completed', 'cancelled', 'noshowed');
CREATE TYPE payment_status     AS ENUM ('pending', 'requires_capture', 'succeeded', 'failed', 'refunded', 'cancelled');
CREATE TYPE payment_type       AS ENUM ('reservation', 'noshow_fee');

-- USERS (enlazado a auth.users)
CREATE TABLE public.users (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT UNIQUE NOT NULL,
  phone       TEXT,
  full_name   TEXT,
  role        user_role NOT NULL DEFAULT 'user',
  stripe_customer_id TEXT UNIQUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email) VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- MACHINES
CREATE TABLE public.machines (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name         TEXT NOT NULL,
  machine_type machine_type NOT NULL,
  status       machine_status NOT NULL DEFAULT 'available',
  location     TEXT,
  salto_lock_id TEXT,
  iot_device_id TEXT,
  price_cents_30min  INTEGER NOT NULL DEFAULT 400,
  price_cents_60min  INTEGER NOT NULL DEFAULT 700,
  price_cents_120min INTEGER NOT NULL DEFAULT 1200,
  noshow_fee_cents   INTEGER NOT NULL DEFAULT 500,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_machines_status ON public.machines(status);
CREATE INDEX idx_machines_type   ON public.machines(machine_type);

-- RESERVATIONS (constraint clave: no overlap activo por máquina)
CREATE TABLE public.reservations (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  machine_id    UUID NOT NULL REFERENCES public.machines(id) ON DELETE RESTRICT,
  start_time    TIMESTAMPTZ NOT NULL,
  end_time      TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER NOT NULL,
  status        reservation_status NOT NULL DEFAULT 'pending_payment',
  payment_intent_id TEXT UNIQUE,
  payment_method    TEXT,
  amount_cents      INTEGER NOT NULL,
  currency          TEXT NOT NULL DEFAULT 'chf',
  noshow_checked_at TIMESTAMPTZ,
  noshow_fee_captured BOOLEAN NOT NULL DEFAULT FALSE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  cancelled_at TIMESTAMPTZ,

  CONSTRAINT chk_times    CHECK (end_time > start_time),
  CONSTRAINT chk_duration CHECK (duration_minutes IN (30, 60, 120)),
  CONSTRAINT chk_future   CHECK (start_time > created_at - INTERVAL '1 minute'),
  CONSTRAINT chk_amount   CHECK (amount_cents > 0),

  CONSTRAINT no_overlap EXCLUDE USING gist (
    machine_id WITH =,
    tstzrange(start_time, end_time, '[)') WITH &&
  ) WHERE (status NOT IN ('cancelled', 'noshowed'))
);

CREATE INDEX idx_reservations_user        ON public.reservations(user_id);
CREATE INDEX idx_reservations_machine     ON public.reservations(machine_id);
CREATE INDEX idx_reservations_status      ON public.reservations(status);
CREATE INDEX idx_reservations_machine_time ON public.reservations(machine_id, start_time, end_time);
CREATE INDEX idx_reservations_noshow_check
  ON public.reservations(start_time)
  WHERE status = 'confirmed' AND noshow_checked_at IS NULL;

-- PAYMENTS (audit / history)
CREATE TABLE public.payments (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_id    UUID NOT NULL REFERENCES public.reservations(id) ON DELETE CASCADE,
  user_id           UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  stripe_intent_id  TEXT NOT NULL,
  stripe_charge_id  TEXT,
  amount_cents      INTEGER NOT NULL,
  currency          TEXT NOT NULL DEFAULT 'chf',
  status            payment_status NOT NULL,
  type              payment_type NOT NULL,
  payment_method    TEXT,
  failure_reason    TEXT,
  stripe_event_id   TEXT UNIQUE,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_payments_reservation ON public.payments(reservation_id);
CREATE INDEX idx_payments_user        ON public.payments(user_id);
CREATE INDEX idx_payments_intent      ON public.payments(stripe_intent_id);

-- SLOTS_AVAILABILITY view
CREATE OR REPLACE VIEW public.slots_availability AS
SELECT
  m.id AS machine_id, m.name AS machine_name, m.machine_type,
  m.status AS machine_status,
  slot.slot_start,
  slot.slot_start + INTERVAL '30 minutes' AS slot_end,
  NOT EXISTS (
    SELECT 1 FROM public.reservations r
    WHERE r.machine_id = m.id
      AND r.status NOT IN ('cancelled', 'noshowed')
      AND tstzrange(r.start_time, r.end_time, '[)')
        && tstzrange(slot.slot_start, slot.slot_start + INTERVAL '30 minutes', '[)')
  ) AS is_available
FROM public.machines m
CROSS JOIN LATERAL (
  SELECT generate_series(
    date_trunc('hour', NOW()),
    date_trunc('hour', NOW()) + INTERVAL '7 days',
    INTERVAL '30 minutes'
  ) AS slot_start
) slot
WHERE m.status != 'offline';

-- updated_at triggers
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated        BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_machines_updated     BEFORE UPDATE ON public.machines
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_reservations_updated BEFORE UPDATE ON public.reservations
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- SEED: 4 máquinas
INSERT INTO public.machines (name, machine_type, location) VALUES
  ('Lavadora 1', 'washer', 'Planta baja - izquierda'),
  ('Lavadora 2', 'washer', 'Planta baja - izquierda'),
  ('Secadora A', 'dryer',  'Planta baja - derecha'),
  ('Secadora B', 'dryer',  'Planta baja - derecha');
