-- =====================================================================
-- N's Lavandería - GRANTs estándar de Supabase
-- Migration: 009_table_grants
--
-- Las tablas creadas por migraciones carecían de los privilegios de
-- tabla para los roles de la API (42501 "permission denied for table
-- machines" incluso autenticado). RLS sigue siendo quien decide QUÉ
-- filas; estos GRANTs solo permiten llegar a las tablas, como en el
-- setup por defecto de Supabase.
-- =====================================================================

GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated, service_role;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated, service_role;

-- Futuras tablas creadas por migraciones (rol postgres)
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT ALL ON TABLES TO authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT USAGE, SELECT ON SEQUENCES TO authenticated, service_role;
