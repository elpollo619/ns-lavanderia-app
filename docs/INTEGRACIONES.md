# Integraciones — N's Lavandería

**Actualizado:** 11 junio 2026
Guía de configuración de control de acceso (SALTO KS), pagos (Stripe) y backend.

---

## 1. Control de Acceso — SALTO KS

### Referencia de mercado: cómo lo hace LikeMagic (likemagic.tech)

LikeMagic (plataforma suiza de guest journey, p. ej. Stay KooooK) lista **SALTO entre sus
13 integraciones de "Keys"** (junto a 4Suites, dormakaba, Nuki, RemoteLock…) con una
"arquitectura modular e interface-open": integran **directamente la API de cada fabricante**
y orquestan con eventos (Camunda BPMN): *check-in confirmado → proceso abre la puerta
principal → segundo proceso autoriza la puerta de la habitación*.

**La lección clave para nosotros:** su flujo principal NO es "abrir remoto al pulsar un
botón", sino **provisionar credenciales al confirmar la reserva**:

> Reserva confirmada → crear/asegurar usuario en SALTO KS → asignarlo a un access group
> con ventana de validez (inicio−15 min → fin+15 min) → el cliente abre la puerta él mismo
> por BLE con la app Salto KS / Digital Key.

Ventajas de ese modelo frente al remote-open puro:
- **Evita el waiver de remote opening** (que SALTO deshabilita por defecto) — la apertura
  BLE local con credencial propia no lo necesita.
- Funciona sin conexión del teléfono al backend en el momento de abrir.
- Coincide con lo que ya promete la web landing ("te registramos en Salto KS, abres con la app").

**✅ Implementado (11 jun 2026):** `reservation-grant-access` + `reservation-revoke-access`
hacen exactamente esto. Pipeline completa: reserva confirmada (vorort en la app, o
pago online vía webhook) → ACS user en Seam con `access_schedule` inicio−15/fin+15 +
access group(s) → registro en la tabla `access_grants` (auditoría/idempotencia) →
revocación automática al cancelar. Sin proveedor configurado, el grant queda `skipped`
y nada se rompe. Para activar:

```bash
supabase secrets set SEAM_API_KEY=seam_xxx SEAM_ACS_SYSTEM_ID=xxx SEAM_ACCESS_GROUP_ID=xxx
# opcional por máquina: UPDATE machines SET access_group_id='...' WHERE id='...';
```

Fase 2: mobile credential de Seam (llave en wallet) y rama SALTO directa (TODO[SALTO]
en el código, pendiente de la spec del Connect API).

### Dos caminos posibles

| | **A. Seam API (recomendado para empezar)** | **B. SALTO Connect API directo** |
|---|---|---|
| Qué es | Plataforma que abstrae SALTO KS (y otros locks) tras una API única | API REST oficial de SALTO (OpenID Connect) |
| Credenciales necesarias | API key de Seam + el dueño del sistema conecta su cuenta SALTO KS vía "Connect Webview" | Client ID + Client Secret del **Business Unit local de SALTO** |
| Unlock remoto | Sí, pero SALTO KS lo **deshabilita por defecto** → requiere waiver/pass-through que Seam configura en los IQ hubs | Sí (mismo requisito de waiver de SALTO) |
| Usuarios + grupos de acceso | Sí (ACS users, access groups) | Sí (60+ endpoints) |
| Credenciales móviles (BLE) | Sí, vía Seam mobile key | SALTO Mobile SDK (JustIN) — SDK nativo iOS/Android |
| PIN codes | Sí (SALTO genera el PIN, no personalizable) | Según hardware |
| Requisito de cuenta | Cuenta SALTO KS de **producción** (`app.saltoks.com`, NO `app-accept`) | Acceso de desarrollador al Business Unit |
| Costo | Free hasta 3 dispositivos; **$5/dispositivo/mes** (Unit Access); $50/disp./mes High Traffic | Sin costo de API conocido; licencia SALTO KS aparte |
| Esfuerzo de integración | Bajo (REST simple, docs públicas excelentes) | Medio (OAuth, spec privada, sin sandbox documentado) |

### Decisión recomendada

**Empezar con Seam** si el laundromat tiene pocas puertas/locks (1 puerta + quizá locks de máquina):
con 3 dispositivos o menos es **gratis**, y la integración son ~30 líneas (ya implementadas
en `supabase/functions/machine-open`). Migrar a SALTO directo solo si los costos por
dispositivo crecen o si se necesita algo que Seam no exponga.

### Qué preguntar a N (el hotel) — bloqueante

1. ¿El sistema es **SALTO KS** (cloud, app.saltoks.com) o SALTO Space (on-premise)?
   → Seam y Connect API solo funcionan con **KS**.
2. ¿Las puertas del laundromat están en el **mismo site/Business Unit** que el hotel, o se puede crear un site aparte?
   (Ideal: site propio para la lavandería = permisos y facturación separados, coherente con que son negocios distintos.)
3. ¿Quién es el **admin de SALTO** que puede: (a) autorizar el waiver de remote opening, (b) conectar la cuenta vía Seam Connect Webview o pedir Client ID/Secret al Business Unit?
4. ¿Los locks tienen **IQ hub** conectado? (necesario para operaciones remotas)

### Pasos de configuración (camino Seam)

```bash
# 1. Crear cuenta en https://console.seam.co (workspace de producción)
# 2. Crear Connect Webview con provider 'salto_ks' y enviársela al admin SALTO de N
#    → él conecta la cuenta SALTO KS de producción
# 3. Pedir a Seam (support@seam.co) el pass-through waiver para remote unlock
#    en los IQ hubs del site
# 4. Listar dispositivos y copiar device_ids:
curl https://connect.getseam.com/devices/list -H "Authorization: Bearer $SEAM_API_KEY"
# 5. Configurar secrets + mapear máquinas:
supabase secrets set SEAM_API_KEY=seam_xxxx
#    UPDATE machines SET lock_provider='seam', lock_device_id='<device_id>' WHERE id='...';
```

### Pasos de configuración (camino SALTO directo)

```bash
# 1. Contactar al Business Unit local de SALTO (via N o support@saltosystems.com)
#    y pedir Client ID + Client Secret para integración "backend server" (non-interactive)
# 2. Revisar la spec: https://developer.saltosystems.com/ks/connect-api/reference/
# 3. Configurar secrets:
supabase secrets set SALTO_CLIENT_ID=xxx SALTO_CLIENT_SECRET=xxx SALTO_SITE_ID=xxx
# 4. Confirmar el endpoint exacto de locking en machine-open/index.ts (TODO[SALTO])
# 5. UPDATE machines SET lock_provider='salto', lock_device_id='<lock_id>' WHERE id='...';
```

### Lo ya implementado en este repo

- `supabase/functions/machine-open` — Edge Function que valida reserva activa,
  abre vía Seam **o** SALTO según `machines.lock_provider`, y audita en `access_logs`
- Migración `004_machine_lock_mapping.sql` — columnas `lock_provider` + `lock_device_id`

---

## 2. Pagos — Stripe + TWINT

### Pasos (requieren al dueño de la cuenta)

1. **Crear cuenta** en https://dashboard.stripe.com/register (país: Suiza, moneda CHF).
   Datos del negocio: N's Lavandería / Hans Amonn AG.
2. **Activar TWINT:** Dashboard → Settings → Payment methods → TWINT → Enable.
   (Revisión de Stripe: 1–2 días hábiles normalmente.)
3. **Copiar claves** (Developers → API keys):
   - `pk_test_...` → `EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY` en `.env.local`
   - `sk_test_...` → `supabase secrets set STRIPE_SECRET_KEY=sk_test_...`
4. **Webhook:** Dashboard → Developers → Webhooks → Add endpoint:
   - URL: `https://upqdfimcddratmleaqay.supabase.co/functions/v1/payment-webhook`
   - Eventos: `payment_intent.succeeded`, `payment_intent.amount_capturable_updated`,
     `charge.captured`, `payment_intent.payment_failed`, `payment_intent.canceled`
   - Copiar el signing secret: `supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...`
5. **Apple Pay / Google Pay:** solo funcionan en development build
   (`eas build --profile development`), no en Expo Go.

### Recordatorios suizos

- TWINT: pre-auth máx. **7 días** (tarjetas: 30). Estrategia del proyecto:
  guardar método de pago y **cobrar no-show solo si ocurre** (función
  `payment-capture-noshow`, cron diario 03:00).
- El webhook ya valida la firma (`stripe-signature`) y corre con
  `verify_jwt = false` (configurado en `supabase/config.toml`).

---

## 3. Backend — Edge Functions

7 funciones en `supabase/functions/`:

| Función | Auth | Secrets que necesita |
|---|---|---|
| `reservations-create` | JWT | `STRIPE_SECRET_KEY` |
| `reservations-confirm` | JWT | — |
| `reservations-check-noshows` | cron/service | `STRIPE_SECRET_KEY` |
| `payment-create-intent` | JWT | `STRIPE_SECRET_KEY` |
| `payment-webhook` | firma Stripe (sin JWT) | `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` |
| `payment-capture-noshow` | cron/service | `STRIPE_SECRET_KEY` |
| `machine-open` | JWT | `SEAM_API_KEY` **o** `SALTO_*` |
| `reservation-grant-access` | JWT dueño o service | `SEAM_API_KEY`, `SEAM_ACS_SYSTEM_ID`, `SEAM_ACCESS_GROUP_ID` |
| `reservation-revoke-access` | JWT dueño o service | `SEAM_API_KEY` |

```bash
# Deploy (todas):
supabase functions deploy

# Secrets pendientes de configurar:
supabase secrets set STRIPE_SECRET_KEY=sk_...
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...
supabase secrets set SEAM_API_KEY=seam_...        # o SALTO_CLIENT_ID/SECRET/SITE_ID

# Cron del no-show (en el SQL editor de Supabase, requiere pg_cron):
# SELECT cron.schedule('check-noshows', '0 3 * * *',
#   $$ SELECT net.http_post('https://upqdfimcddratmleaqay.supabase.co/functions/v1/reservations-check-noshows',
#      headers => '{"Authorization": "Bearer <service_role_key>"}'::jsonb) $$);
```

---

## 4. Máquinas (decisión aún abierta)

Sin cambios: **Schulthess washMaster vs sistema IoT propio** sigue pendiente de la
respuesta de Schulthess (info@schulthess.com). El control de acceso de arriba (SALTO/Seam)
cubre la **puerta** y puede cubrir locks de máquina; el arranque/parada de las máquinas
en sí depende de esta decisión.
