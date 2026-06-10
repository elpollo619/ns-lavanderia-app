-- =====================================================================
-- N's Lavandería - Campos del diseño + datos en alemán + realtime
-- Migration: 005_machines_design_fields
--
-- El diseño (design_handoff README) muestra por máquina:
--   "{cap} · CHF x.xx / Gang" → necesitamos precio y capacidad.
-- UI en alemán → renombrar el seed inicial.
-- =====================================================================

ALTER TABLE public.machines
  ADD COLUMN IF NOT EXISTS price_cents INTEGER NOT NULL DEFAULT 450,
  ADD COLUMN IF NOT EXISTS capacity_kg INTEGER NOT NULL DEFAULT 8;

-- Renombrar seed inicial a alemán + precios del diseño
-- (washer: CHF 4.50 / 8 kg · dryer: CHF 3.50 / 7 kg)
UPDATE public.machines SET name = 'Waschmaschine 01', price_cents = 450, capacity_kg = 8
  WHERE name = 'Lavadora 1';
UPDATE public.machines SET name = 'Waschmaschine 02', price_cents = 450, capacity_kg = 8
  WHERE name = 'Lavadora 2';
UPDATE public.machines SET name = 'Trockner 01', price_cents = 350, capacity_kg = 7
  WHERE name = 'Secadora A';
UPDATE public.machines SET name = 'Trockner 02', price_cents = 350, capacity_kg = 7
  WHERE name = 'Secadora B';

-- Disponibilidad en tiempo real (handoff: "Real-time availability")
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.machines;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
