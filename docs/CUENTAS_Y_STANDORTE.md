# Cuentas, Roles y Standorte — N's Lavandería

**Actualizado:** 11 junio 2026 · Esquema desde la migración 008.

---

## El modelo en una imagen

```
                    ┌─────────────────────────────┐
                    │  SUPERADMIN (Cristian)       │  users.role = 'superadmin'
                    │  · todo lo de admin          │
                    │  · crear/editar Standorte    │
                    │  · asignar admins por Standort│
                    └──────────────┬──────────────┘
                                   │
            ┌──────────────────────┼──────────────────────┐
            ▼                      ▼                      ▼
  ┌──────────────────┐   ┌──────────────────┐   ┌──────────────────┐
  │ ADMIN (global)    │   │ STANDORT-ADMIN    │   │ USER (cliente)    │
  │ users.role='admin'│   │ tabla             │   │ users.role='user' │
  │ ve/gestiona TODO  │   │ standort_admins   │   │ (default)         │
  │ en todas las      │   │ ve/gestiona SOLO  │   │ reserva, paga,    │
  │ ubicaciones       │   │ su(s) Standort(e) │   │ abre, cancela     │
  └──────────────────┘   └──────────────────┘   └──────────────────┘
```

---

## 1. Clientes (users)

- **Alta:** self-service en la app (Registrieren) → Supabase Auth crea `auth.users`
  y el trigger `handle_new_user` crea la fila espejo en `public.users` con `role='user'`.
- **Qué pueden hacer:** ver máquinas y disponibilidad, reservar (vorort u online),
  cancelar sus reservas futuras, ver Meine Buchungen, abrir la puerta (machine-open /
  credencial SALTO provisionada), fidelidad (5.ª carga gratis).
- **Qué ven (RLS):** solo sus propias reservas/pagos/grants. Máquinas y Standorte:
  lectura para cualquier usuario autenticado.

## 2. Standort-Admins (gestores de una ubicación)

- **Alta:** el superadmin los asigna en la app — Admin-Bereich → Standorte →
  "Admin +" → email de la persona (debe tener cuenta registrada antes).
  Equivalente SQL: `INSERT INTO standort_admins (standort_id, user_id) VALUES (...);`
- **Qué pueden:** entrar al Admin-Bereich; gestionar las **máquinas de su Standort**
  (Wartung/Freigeben); ver las **reservas de su Standort**.
- **Qué NO pueden:** crear Standorte, asignar admins, tocar otras ubicaciones.

## 3. Admin global y Superadmin

- **admin** (`users.role='admin'`): todo lo operativo en TODAS las ubicaciones.
- **superadmin** (`users.role='superadmin'`): además crea/edita Standorte y asigna
  Standort-Admins. Reservado para el dueño.
- **Cómo nombrar el primero** (no hay UI para auto-promoverse, a propósito):
  ```sql
  -- En Supabase → SQL editor:
  UPDATE users SET role = 'superadmin' WHERE email = 'cristian-amaya@hotmail.com';
  ```

## 4. Standorte (ubicaciones)

- **Tabla `standorte`:** slug, nombre, dirección, `status`
  (`active` · `coming_soon` · `inactive`), `wewash_url` (puente Scan2Wash si esa
  ubicación aún opera con WeWash).
- **Seed:** `ns-hotel-kerzers` (N's Hotel, Allmendstrasse 14, 3210 Kerzers) con
  las 4 máquinas asignadas.
- **Crear uno nuevo (superadmin):** App → Profil → Admin-Bereich → "Neuer Standort"
  (nace como `coming_soon`; cambiar a `active` cuando esté listo). Después:
  1. Crear sus máquinas: `INSERT INTO machines (name, machine_type, standort_id, price_cents, capacity_kg) VALUES (...);`
  2. Asignar su Standort-Admin (botón "Admin +").
  3. Configurar locks (`machines.lock_provider/lock_device_id` + access group).
- **Toda máquina pertenece a un Standort** (`machines.standort_id NOT NULL`).

## 5. Sincronización con la web (likemagic-style, sin servidor extra)

La web (`~/Desktop/ns-lavanderia`) lee la vista pública **`standort_live_status`**
(slug, nombre, ciudad, total y libres por Standort — solo agregados, cero datos
personales; accesible con la anon key porque la vista corre con permisos de owner):

```
GET {SUPABASE_URL}/rest/v1/standort_live_status?slug=eq.ns-hotel-kerzers
→ [{"machines_free": 4, "machines_total": 4, ...}]
```

El Hero muestra "X / Y Maschinen frei" **en vivo** (refresco cada 60 s, fallback al
mock si no hay red/env). Config en la web: `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY`
(`.env.local` local; en Netlify como Environment Variables). La misma vista sirve
para una futura página "Standorte" con todas las ubicaciones.

## 6. Resumen de permisos (RLS)

| Recurso | user | standort-admin | admin/superadmin |
|---|---|---|---|
| machines SELECT | ✓ (auth) | ✓ | ✓ |
| machines UPDATE | — | ✓ su Standort | ✓ |
| reservations SELECT | propias | las de su Standort | todas |
| reservations INSERT/cancel | propias | propias | propias |
| payments SELECT | propios | — | todos |
| access_grants SELECT | propios | — | todos |
| standorte SELECT | ✓ (auth) | ✓ | ✓ |
| standorte INSERT/UPDATE | — | — | solo superadmin |
| standort_admins gestionar | — | — | solo superadmin |
| standort_live_status (vista) | ✓ incluso anon (web) | ✓ | ✓ |
