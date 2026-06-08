---
allowed-tools: Read, Write, Edit, Bash, Grep, Glob
argument-hint: [tarea de DB]
description: Diseñar/optimizar esquema SQL + RLS en Supabase
---

# /database — Diseño + Optimización SQL + RLS

Diseña, optimiza esquemas SQL y crea políticas de RLS (Row-Level Security) en Supabase.

## Ejemplo de invocación

```
/database diseña esquema de reservas con restricción de no-overlaps y índices
/database crea RLS para usuarios (solo ven/editan sus reservas)
/database optimiza query de máquinas disponibles por horario
/database añade audit log de accesos (quién abrió qué máquina)
```

## Responsabilidades

1. **Esquema:** tablas, columnas, tipos de datos, constraints, relaciones
2. **Índices:** para optimizar queries comunes (búsqueda, filtrado, rango)
3. **RLS Policies:** SELECT/INSERT/UPDATE/DELETE por rol (user, admin)
4. **Migraciones:** archivos SQL versionados en `supabase/migrations/`
5. **Tipos TS:** generación automática desde Postgres (Supabase CLI)

## Patrón de Migración

```sql
-- supabase/migrations/001_init_schema.sql
-- Crear tabla users
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Crear tabla machines
CREATE TABLE machines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  status TEXT DEFAULT 'available',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Crear tabla reservations con constraint no-overlap
CREATE TABLE reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  machine_id UUID REFERENCES machines(id),
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW(),
  -- Constraint: no dos reservas en mismo machine en mismo horario
  CONSTRAINT no_overlap EXCLUDE USING gist (
    machine_id WITH =,
    tsrange(start_time, end_time) WITH &&
  )
);

-- Índices para performance
CREATE INDEX idx_reservations_user ON reservations(user_id);
CREATE INDEX idx_reservations_machine ON reservations(machine_id);
CREATE INDEX idx_reservations_time ON reservations(start_time, end_time);

-- RLS: activar en tabla
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;

-- Policy: usuarios ven sus propias reservas
CREATE POLICY "Users can read own reservations" ON reservations
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: usuarios crean reservas para sí mismos
CREATE POLICY "Users can create own reservations" ON reservations
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: usuarios editan solo reservas pending
CREATE POLICY "Users can update own pending reservations" ON reservations
  FOR UPDATE
  USING (auth.uid() = user_id AND status = 'pending')
  WITH CHECK (auth.uid() = user_id AND status IN ('pending', 'cancelled'));

-- Policy: admins ven todo
CREATE POLICY "Admins can read all reservations" ON reservations
  FOR SELECT
  USING ((
    SELECT role FROM users WHERE id = auth.uid()
  ) = 'admin');
```

## Deploy Migraciones

```bash
# Local development
supabase migration new create_reservations_table
# Editar el archivo .sql creado
supabase db push

# Producción (vía Supabase dashboard)
# Subir archivo SQL + ejecutar
```

## RLS Debugging

```sql
-- Ver políticas de una tabla
SELECT * FROM pg_policies WHERE schemaname='public' AND tablename='reservations';

-- Test RLS (como user específico)
SET request.jwt.claim.sub TO 'user-uuid-aqui';
SELECT * FROM reservations;
```

## Generación de Tipos TS

```bash
supabase gen types typescript --schema public > src/types/database.ts
```

Resultado: tipos 100% en sync con tu DB.

## No Incluye

- Migrations de schema cambios mayor (usar Alter Table con cuidado)
- Data migrations (INSERT/UPDATE masivo) — reportar como tarea separada
- Backup/restore — fuera de scope
