-- =====================================================================
-- N's Lavandería - Mapeo máquina ↔ lock de control de acceso
-- Migration: 004_machine_lock_mapping
--
-- lock_provider: 'seam' | 'salto' (NULL = sin lock conectado todavía)
-- lock_device_id: id del dispositivo en el proveedor
--   - Seam:  device_id del lock (UUID de Seam)
--   - SALTO: lock id del Connect API
-- =====================================================================

ALTER TABLE public.machines
  ADD COLUMN IF NOT EXISTS lock_provider TEXT
    CHECK (lock_provider IN ('seam', 'salto')),
  ADD COLUMN IF NOT EXISTS lock_device_id TEXT;

COMMENT ON COLUMN public.machines.lock_provider IS
  'Proveedor de control de acceso del lock de esta máquina/puerta';
COMMENT ON COLUMN public.machines.lock_device_id IS
  'ID del lock en el proveedor (Seam device_id o SALTO lock id)';
