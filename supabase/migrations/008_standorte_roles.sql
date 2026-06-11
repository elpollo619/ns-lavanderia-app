-- =====================================================================
-- N's Lavandería - Multi-Standort + modelo de roles
-- Migration: 008_standorte_roles
--
-- N's Lavandería es un negocio independiente con ambición multi-ubicación
-- (el N's Hotel Kerzers es solo el primer Standort). Este esquema:
--   - standorte: las ubicaciones (seed: N's Hotel Kerzers)
--   - machines.standort_id: cada máquina pertenece a un Standort
--   - Roles: user (cliente) · admin/superadmin (global) ·
--            standort_admins (gestor de una ubicación concreta)
--   - Vista pública standort_live_status para la web (disponibilidad live)
-- =====================================================================

-- 'superadmin' = dueño global (Cristian). Nota: el valor no puede usarse
-- en esta misma transacción, solo declararse — los helpers lo referencian
-- como texto, así que no hay problema.
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'superadmin';

-- ---------- STANDORTE ----------
CREATE TABLE public.standorte (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        TEXT UNIQUE NOT NULL,
  name        TEXT NOT NULL,
  street      TEXT,
  postal_code TEXT,
  city        TEXT,
  status      TEXT NOT NULL DEFAULT 'active'
              CHECK (status IN ('active', 'coming_soon', 'inactive')),
  wewash_url  TEXT,           -- puente Scan2Wash mientras no haya control propio
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO public.standorte (slug, name, street, postal_code, city, wewash_url) VALUES
  ('ns-hotel-kerzers', 'N''s Hotel Kerzers', 'Allmendstrasse 14', '3210', 'Kerzers',
   'https://app.we-wash.com/rooms?qr_id=6X3U1');

ALTER TABLE public.machines
  ADD COLUMN IF NOT EXISTS standort_id UUID REFERENCES public.standorte(id);

UPDATE public.machines
  SET standort_id = (SELECT id FROM public.standorte WHERE slug = 'ns-hotel-kerzers')
  WHERE standort_id IS NULL;

ALTER TABLE public.machines ALTER COLUMN standort_id SET NOT NULL;
CREATE INDEX idx_machines_standort ON public.machines(standort_id);

-- ---------- ADMINS POR STANDORT ----------
CREATE TABLE public.standort_admins (
  standort_id UUID NOT NULL REFERENCES public.standorte(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (standort_id, user_id)
);

-- ---------- HELPERS (SECURITY DEFINER: sin recursión RLS) ----------
-- is_admin() ahora cubre admin global Y superadmin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean LANGUAGE sql SECURITY DEFINER SET search_path = public STABLE AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.id = auth.uid() AND u.role::text IN ('admin', 'superadmin')
  );
$$;

CREATE OR REPLACE FUNCTION public.is_superadmin()
RETURNS boolean LANGUAGE sql SECURITY DEFINER SET search_path = public STABLE AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.id = auth.uid() AND u.role::text = 'superadmin'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_standort_admin(sid uuid)
RETURNS boolean LANGUAGE sql SECURITY DEFINER SET search_path = public STABLE AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.standort_admins sa
    WHERE sa.user_id = auth.uid() AND sa.standort_id = sid
  );
$$;

REVOKE ALL ON FUNCTION public.is_superadmin() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.is_standort_admin(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_superadmin() TO authenticated, anon, service_role;
GRANT EXECUTE ON FUNCTION public.is_standort_admin(uuid) TO authenticated, anon, service_role;

-- ---------- RLS ----------
ALTER TABLE public.standorte      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.standort_admins ENABLE ROW LEVEL SECURITY;

-- Standorte: lectura para usuarios autenticados; gestión solo superadmin
CREATE POLICY "standorte_select_all" ON public.standorte
  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "standorte_superadmin_write" ON public.standorte
  FOR ALL USING (public.is_superadmin()) WITH CHECK (public.is_superadmin());

-- standort_admins: cada uno ve sus asignaciones; admins globales ven todas;
-- solo superadmin asigna/quita
CREATE POLICY "standort_admins_select" ON public.standort_admins
  FOR SELECT USING (user_id = auth.uid() OR public.is_admin());
CREATE POLICY "standort_admins_superadmin_write" ON public.standort_admins
  FOR ALL USING (public.is_superadmin()) WITH CHECK (public.is_superadmin());

-- Máquinas: gestión por admin global O admin del Standort de la máquina
DROP POLICY IF EXISTS "machines_admin_all" ON public.machines;
CREATE POLICY "machines_admin_all" ON public.machines
  FOR ALL USING (public.is_admin() OR public.is_standort_admin(standort_id));

-- Reservas: el admin de un Standort ve las reservas de sus máquinas
DROP POLICY IF EXISTS "reservations_select_own" ON public.reservations;
CREATE POLICY "reservations_select_own" ON public.reservations
  FOR SELECT USING (
    user_id = auth.uid()
    OR public.is_admin()
    OR public.is_standort_admin(
         (SELECT m.standort_id FROM public.machines m WHERE m.id = machine_id)
       )
  );

-- ---------- VISTA PÚBLICA PARA LA WEB ----------
-- Disponibilidad live por Standort (solo agregados, sin datos sensibles).
-- Las vistas ejecutan con permisos del owner → lectura anon segura.
CREATE OR REPLACE VIEW public.standort_live_status AS
SELECT
  s.slug,
  s.name,
  s.city,
  s.status,
  COUNT(m.id)::int                                            AS machines_total,
  COUNT(m.id) FILTER (WHERE m.status = 'available')::int      AS machines_free
FROM public.standorte s
LEFT JOIN public.machines m
  ON m.standort_id = s.id AND m.status <> 'offline'
WHERE s.status <> 'inactive'
GROUP BY s.id;

GRANT SELECT ON public.standort_live_status TO anon, authenticated;
