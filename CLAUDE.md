# CLAUDE.md — N's Lavandería (App Móvil)

**Última actualización:** junio 2026  
**Equipo:** Cristian Amaya (individual)  
**Idioma:** Español (siempre)  

---

## Resumen Ejecutivo

**N's Lavandería** es una app móvil React Native + Expo para un Waschsalon (laundromat) suizo. Permite:
- Reservar máquinas de lavado/secado por calendario en tiempo real
- Pagar con **TWINT + Apple Pay + Google Pay + tarjeta** (CHF) vía Stripe
- Abrir puertas y máquinas con Digital Key (BLE) desde el teléfono
- Cobrar fees automáticos de no-show
- Dashboard simple para el dueño (máquinas, reservas, ingresos)

**Stack elegido:** React Native + Expo (managed) + Supabase + Stripe + SALTO KS + EAS Build/Submit

**Por qué este stack:**
- ✅ Máxima reutilización: equipo ya tiene React + TypeScript en web
- ✅ Publicación sin Mac local (EAS Build cloud)
- ✅ Supabase: Postgres relacional (ideal para reservas), RLS, Edge Functions, realtime
- ✅ Stripe: TWINT nativo + Apple/Google Pay + manual capture para no-show
- ✅ SALTO KS: acceso profesional integrado con el hotel/laundromat
- ✅ Expo Go para testing rápido; development build para AP/GP

---

## 🎯 Decisiones Críticas (Semana 1)

### 1. Sistema de Máquinas
**Estado:** 🔴 **Pendiente confirmación**

Tres opciones:

| Opción | Proveedor | Ventajas | Desventajas | Acción |
|--------|-----------|----------|-------------|--------|
| **A. Schulthess washMaster** | Suiza, washMaster AG | Nativo suizo, TWINT + reservas, "puede integrarse", máquinas cualquier marca | API privada (sin docs públicas), requiere confirmar alcance real de integración | **Contactar:** info@schulthess.com o WashMaster support — preguntar si las reservas pueden vivir dentro de TU app o solo deep-link |
| **B. Miele 3rd Party API** | Alemania, Miele | API REST oficial (Swagger), máquinas conectadas profesionales | No es específica para reservas públicas; orientada a smart-home/energía | **Evaluar solo si** las máquinas son Miele Professional conectadas. Docs: developer.miele.com |
| **C. Sistema IoT propio** | Propio (relés + ESP32/Shelly + backend custom) | Control total, máximas máquinas, sin dependencias de terceros, ideal para laundromat público | Más trabajo de implementación (drivers, mantenimiento), requiere electricista | **Recomendado si** Schulthess no permite integración nativa en tu app o si quieres máxima flexibilidad |

**Umbral de decisión:** Si Schulthess dice "la reserva puede estar en tu app" → **usa washMaster (opción A)**. Si dice "solo deep-link a nuestra app" → **ve por sistema IoT (opción C)** para no depender de su UI.

**Siguiente paso:** Enviar correo a Schulthess esta semana.

---

### 2. Control de Acceso
**Estado:** 🟡 **Confirmar modelo en el hotel de N**

Casi seguro es **SALTO KS** (Keys as a Service). Acciones:
1. **Preguntar a N:** ¿es SALTO KS? Si sí, pedir **Client ID + Client Secret** de su Business Unit SALTO
2. **Entender el modelo:**
   - ¿Las puertas del laundromat están en la misma SALTO BU que el hotel?
   - ¿Se puede abrir remoto sin NFC? (requiere waiver especial)
   - ¿Hay un admin de SALTO en el hotel que pueda crear grupos de acceso?
3. **Evaluación técnica:**
   - **Si es SALTO:** integrar Connect API (REST) + Mobile SDK (Digital Key BLE)
   - **Si NO es SALTO:** evaluar Nuki Web API (más barato para 1-2 puertas)

**Deep dive técnico:**
- **SALTO KS Connect API:** REST, OAuth/OpenID; endpoints para crear usuarios, asignarles credenciales, abrir puertas remotamente
- **SALTO Mobile SDK (JustIN Mobile / Digital Key):** iOS (CocoaPods) + Android; abre por BLE (proximidad)
- **Alternativa más simple:** integrar vía **Seam API** (abstrae SALTO KS) con SDK de JS

**Siguiente paso:** Preguntar a N esta semana qué sistema tiene.

---

### 3. Pagos
**Estado:** 🟢 **Confirmado: Stripe + TWINT**

**Decisión:** Stripe PaymentSheet + `@stripe/stripe-react-native`

**Por qué:**
- ✅ TWINT nativo en CHF (sin conversión)
- ✅ Apple Pay + Google Pay + tarjeta en 1 SDK
- ✅ Excelente DX, docs claras
- ✅ Manual capture para pre-auth de no-show
- ✅ Webhooks robustos

**Flujo:**
1. Usuario reserva máquina → backend crea PaymentIntent con `capture_method=manual`
2. Frontend muestra PaymentSheet (TWINT, tarjeta, AP/GP)
3. Usuario paga → intent en estado `requires_capture`
4. Si no-show → backend captura el fee (tarjeta) o usa TWINT UoF (User on File)
5. Si show → liberar hold sin mover dinero

**Detalles suizos:**
- **TWINT:** pre-auth máximo **7 días** (vs 30 en tarjetas)
- **Tarjeta:** extended auth hasta 30 días (Visa/MC/Amex)
- **Estrategia:** guardar método de pago al reservar + **cobrar no-show solo si no se presenta** (más fiable que hold largo)

**Alternativas evaluadas pero NO recomendadas:**
- Datatrans/Saferpay: más baratos para acquiring local, pero SDK más complejo
- PostFinance Checkout: demasiado orientado a e-commerce
- WeWash: **NO sirve** (FAQ: "no opera laundromats públicos")

**Implementación:**
- Backend: Edge Functions de Supabase (`POST /api/payment/create-intent`, `POST /api/payment/capture-noshowfee`)
- Frontend: Stripe React Native PaymentSheet component
- Webhook: Stripe → Edge Function para actualizar estado de reserva

**Siguiente paso:** Crear cuenta Stripe (https://stripe.com/ch) esta semana; habilitar TWINT en métodos de pago.

---

## 📱 Stack Técnico

### Frontend (Cliente)
```
React Native + Expo (managed)
├── Expo Router (deep linking, universal links)
├── @stripe/stripe-react-native (PaymentSheet)
├── @supabase/supabase-js (auth, realtime)
├── @react-navigation (si Expo Router no cubre todo)
├── TailwindCSS (via NativeWind) o React Native Paper
└── TypeScript (100% strict)
```

**Por qué Expo (managed):**
- EAS Build cloud (sin Mac local)
- Expo Go para testing rápido
- Community bien establecida
- Expo Router para navigation + deep linking out-of-the-box
- ⚠️ **Nota:** Apple Pay/Google Pay no funcionan en Expo Go; requieren development build (`eas build --dev`)

**Alternativa rechazada:** Flutter
- Razón: aprendizaje Dart, no reutiliza React/TypeScript, más gráficos pero innecesarios para este caso

---

### Backend (Servidor)
```
Supabase (PostgreSQL + Auth + Realtime + Edge Functions)
├── Postgres (esquema: users, machines, reservations, payments, access_logs, etc.)
├── RLS (Row-Level Security) para aislamiento de datos
├── Auth (JWT, social login)
├── Storage (fotos de máquinas/documentos)
├── Realtime (reservas en vivo)
└── Edge Functions (Node.js) para:
    ├── POST /api/payment/create-intent (PaymentIntent Stripe)
    ├── POST /api/payment/capture-noshowfee (capturar fee de no-show)
    ├── POST /api/payment/webhook (webhook Stripe)
    ├── POST /api/machine/open (abrir máquina vía SALTO)
    └── POST /api/reservation/cancel (liberar slot)
```

**Por qué Supabase:**
- ✅ Postgres relacional (reservas, slots de calendario, máquinas)
- ✅ RLS en SQL (usuario solo ve sus reservas + máquinas públicas)
- ✅ Auth incorporado con JWT
- ✅ Edge Functions (Node.js) para webhooks + lógica backend
- ✅ Integración nativa con Expo (no requiere bridge)
- ✅ Free tier: 500MB DB, auth, realtime, 144,000 requests/mes

**Alternativa evaluada:** Firebase
- Rechazada: NoSQL (complicado para reservas/slots), requiere `@react-native-firebase` (no Expo Go), costos menos predecibles

---

### Integraciones Externas

| Servicio | Uso | Docs | Status |
|----------|-----|------|--------|
| **Stripe** | Pagos (TWINT, AP/GP, tarjeta, CHF) | stripe.com/docs/payments/stripe-react-native | ✅ Confirmado |
| **SALTO KS Connect API** | Abrir puertas/máquinas remotamente | Contacto: support@saltosystems.com | 🟡 Pendiente confirmación del cliente |
| **SALTO Mobile SDK** | Digital Key (BLE) | Incluido en SALTO KS Connect | 🟡 Pendiente |
| **Schulthess washMaster** | Reservas + control de máquinas (TBD) | washmaster.ch (API privada) | 🟡 Pendiente investigación |
| **EAS** (Expo) | Build + submit a tiendas | docs.expo.dev/eas | ✅ Confirmado |

---

## 📊 Esquema de Datos (Supabase)

```sql
-- Users
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  role TEXT DEFAULT 'user' -- 'user' | 'admin'
);

-- Machines
CREATE TABLE machines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL (e.g., "Lavadora 1", "Secadora A"),
  machine_type TEXT NOT NULL, -- 'washer' | 'dryer'
  status TEXT DEFAULT 'available', -- 'available' | 'in_use' | 'maintenance'
  location TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Reservations
CREATE TABLE reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  machine_id UUID REFERENCES machines(id),
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP NOT NULL,
  status TEXT DEFAULT 'pending', -- 'pending' | 'active' | 'completed' | 'cancelled' | 'noshowed'
  payment_intent_id TEXT (Stripe),
  created_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT no_overlap EXCLUDE USING gist (
    machine_id WITH =,
    tsrange(start_time, end_time) WITH &&
  )
);

-- Payments
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_id UUID REFERENCES reservations(id),
  stripe_intent_id TEXT,
  amount_cents INTEGER,
  currency TEXT DEFAULT 'chf',
  status TEXT, -- 'pending' | 'succeeded' | 'failed'
  type TEXT, -- 'reservation' | 'noshowfee'
  created_at TIMESTAMP DEFAULT NOW()
);

-- Access Logs (auditoría)
CREATE TABLE access_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  machine_id UUID REFERENCES machines(id),
  action TEXT, -- 'unlock' | 'lock'
  salto_response TEXT (JSON),
  created_at TIMESTAMP DEFAULT NOW()
);

-- RLS Policies
-- users: SELECT only own row + machines (read-only)
-- reservations: SELECT own + machines (read-only), INSERT own, UPDATE/DELETE own if status='pending'
-- payments: SELECT own + admin full access
-- access_logs: admin full access (auditoría)
```

---

## 🛠️ Setup Inicial (Comandos Concretos)

### 1. Crear repo + proyecto Expo
```bash
# Crear repo en GitHub (web UI)
# https://github.com/new → repository name: ns-lavanderia-app

# Clonar localmente
git clone https://github.com/tu-usuario/ns-lavanderia-app.git
cd ns-lavanderia-app

# Crear proyecto Expo
npx create-expo-app@latest . --template

# Instalar dependencias
npm install @stripe/stripe-react-native @supabase/supabase-js expo-router expo-secure-store expo-calendar expo-contacts
# (o `pnpm install` si prefieres pnpm)
```

### 2. Configurar Supabase
```bash
# Crear cuenta en supabase.com
# Crear proyecto nuevo (región: eu-west-1 o similar cercana a Suiza)

# Instalar Supabase CLI (opcional, pero útil)
npm install -g supabase

# Crear tipos TS desde DB remota
npx @supabase/supabase-js typegen
```

### 3. Configurar Stripe
```bash
# Crear cuenta en stripe.com/ch
# Habilitar TWINT en Payment Methods
# Copiar API keys (Public + Secret) a .env.local

# En tu backend (Edge Function):
# npm install stripe @stripe/stripe-js
```

### 4. Configurar EAS Build
```bash
# Instalar EAS CLI
npm install -g eas-cli

# Login con Expo account (crea una si no tienes)
eas login

# Configurar EAS para el proyecto
eas build:configure

# (Se crearán archivos eas.json + app.json)
```

### 5. Crear archivos de configuración
```bash
# Copiar template .env
cp .env.example .env.local

# Variables requeridas:
# EXPO_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
# EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJxxxxxxxx
# EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxxxxx (o pk_test_)
# SALTO_CLIENT_ID=xxxxx (una vez confirmado)
# SALTO_CLIENT_SECRET=xxxxx (secreto, no en .env público)
```

---

## 📋 Estructura de Carpetas

```
ns-lavanderia-app/
├── app/                          # Expo Router (navegación)
│   ├── (auth)/
│   │   ├── login.tsx
│   │   └── signup.tsx
│   ├── (app)/
│   │   ├── _layout.tsx           # Drawer/Tab navigation
│   │   ├── index.tsx             # Home (máquinas disponibles)
│   │   ├── reservations/         # Mis reservas
│   │   ├── payment/
│   │   │   └── checkout.tsx
│   │   ├── settings/
│   │   └── admin/                # Admin dashboard (si role=admin)
│   ├── _layout.tsx               # Root layout
│   └── +html.tsx                 # Web (si se expande a web)
│
├── src/
│   ├── api/                      # Supabase queries + mutations
│   │   ├── machines.ts
│   │   ├── reservations.ts
│   │   ├── payments.ts
│   │   └── salto.ts
│   ├── components/               # UI components (reutilizable)
│   │   ├── MachineCard.tsx
│   │   ├── ReservationForm.tsx
│   │   ├── PaymentSheet.tsx
│   │   └── ...
│   ├── hooks/                    # Custom hooks
│   │   ├── useAuth.ts
│   │   ├── useReservations.ts
│   │   └── usePayments.ts
│   ├── utils/
│   │   ├── stripe.ts
│   │   ├── salto.ts
│   │   └── calendar.ts
│   ├── types/                    # TypeScript types (generados de Supabase idealmente)
│   │   └── database.ts
│   └── contexts/                 # React Context (auth, user, etc.)
│       └── AuthContext.tsx
│
├── supabase/
│   ├── migrations/               # SQL migrations
│   │   └── 001_init_schema.sql
│   └── functions/                # Edge Functions (Node.js)
│       ├── payment/
│       │   ├── create-intent/
│       │   ├── capture-fee/
│       │   └── webhook/
│       ├── machine/
│       │   └── open/
│       └── reservation/
│           └── cancel/
│
├── .claude/                      # Claude Code setup
│   ├── CLAUDE.md                 # Este archivo
│   ├── agents/
│   │   ├── mobile-developer.md
│   │   ├── backend-architect.md
│   │   └── payment-integrator.md
│   ├── commands/
│   │   ├── debug.md
│   │   ├── api.md
│   │   ├── database.md
│   │   ├── security.md
│   │   └── test.md
│   └── settings.json             # Configuración de Claude Code
│
├── .env.local                    # No commitear
├── .env.example
├── .gitignore
├── app.json                      # Expo config (generado)
├── eas.json                      # EAS config (generado)
├── package.json
├── tsconfig.json
└── README.md
```

---

## 🤖 Claude Code — Agents + Slash Commands

### Agents (en `.claude/agents/`)

**Instalar marketplace de agents:**
```bash
/plugin marketplace add https://github.com/wshobson/agents
```

**Agents clave para este proyecto (ya definidos en `.claude/agents/`):**

1. **mobile-developer.md** → Debugging de componentes RN, refactor, optimización
2. **backend-architect.md** → Diseñar Edge Functions, esquema SQL, RLS
3. **payment-integrator.md** → Integración Stripe, webhooks, manejo de dinero
4. **security-auditor.md** → Auditar secrets, RLS, validación Stripe, OWASP
5. **test-automator.md** → Jest + React Native Testing Library

**Cómo invocar:** 
```
"Usa el mobile-developer para refactor de este componente"
"@backend-architect diseña el endpoint de pagos"
```

---

### Slash Commands (en `.claude/commands/`)

**Instalados / a definir:**

| Comando | Descripción | Atajo |
|---------|-------------|-------|
| `/debug` | Analizar bug en componente RN o Edge Function | `Ctrl+D` (custom) |
| `/api` | Scaffold Supabase Edge Function | — |
| `/database` | Diseñar/optimizar esquema SQL + RLS | — |
| `/security` | Auditar seguridad (secrets, RLS, webhooks Stripe) | — |
| `/test` | Generar tests Jest / React Native Testing Library | — |
| `/refactor` | Refactor de código (componentes, hooks) | — |

**Ejemplo de uso:**
```
/debug MachineCard.tsx — el componente no actualiza la lista de reservas
/api crear endpoint para obtener máquinas disponibles en rango de horario
/database diseñar índices para reservations (machine_id, start_time, end_time)
/security auditar el webhook de Stripe en `supabase/functions/payment/webhook`
```

**Definición en `.claude/commands/debug.md`:**
```markdown
---
allowed-tools: Read, Edit, Bash, Grep
description: Analizar y corregir bugs en RN/backend
---
Analiza el código y encuentra el bug. Revisa logs, tipos TypeScript,
y flujo de datos. Sugiere fixes y verifica que los tests pasen.
```

---

## 📱 Publicación en App Stores

### Requisitos previos
- **Apple Developer Program:** $99/año (obligatorio para App Store)
- **Google Play Developer:** $25 pago único
- **Cuentas:** Apple ID + Google account
- **Certificados:** EAS maneja esto automáticamente

### Flujo Expo (EAS Submit)

```bash
# 1. Crear builds de producción
eas build --platform ios --profile production
eas build --platform android --profile production

# 2. Submitir a tiendas (automático: App Store Connect + Google Play Console)
eas submit --platform ios
eas submit --platform android

# 3. Completar metadata en:
# - App Store Connect (screenshots, descripción, categoría, etc.)
# - Google Play Console (igual)
```

**Tiempos esperados:**
- Android: ~2-4 horas (automático en el 90% de casos)
- iOS: ~24-48 horas (App Review manual)

---

## 💰 Costos Mensuales Estimados

| Servicio | Tier | Costo | Notas |
|----------|------|-------|-------|
| **Supabase** | Free | $0 | 500MB DB, 144k req/mes; escala si < 1k MAU |
| **Stripe** | Standard | 1.49% + CHF 0.30/tx | Solo pagas por transacciones exitosas |
| **EAS** | Starter | $19/mes | $45 crédito builds + 3k MAU EAS Update |
| **Apple Developer** | Anual | $99/año | No varía con tráfico |
| **Google Play** | Uno | $25 | Pago único, no varía |
| **SALTO KS** | TBD | TBD | Negociado directamente; típicamente licensing anual |
| **Schulthess washMaster** | TBD | TBD | Pay-per-cycle (sin costos fijos) |
| **Total mes 1-6** | — | ~$100-150 | (sin hosting de máquinas; escalable) |

---

## 🚀 Hitos (Roadmap 8 semanas)

### Semana 1: Setup + Decisiones
- [ ] Crear repo + Expo project
- [ ] Contactar Schulthess (máquinas) + SALTO (acceso)
- [ ] Crear cuenta Stripe + Supabase
- [ ] Setup EAS + eas.json
- [ ] Crear este CLAUDE.md + estructura `.claude/agents`

### Semana 2: Backend Foundations
- [ ] Esquema SQL (users, machines, reservations, payments)
- [ ] RLS policies
- [ ] Edge Functions scaffold (payment/*, machine/*, reservation/*)

### Semana 3-4: Frontend MVP (Reservas)
- [ ] Auth (login/signup)
- [ ] Lista de máquinas disponibles
- [ ] Formulario de reserva (date picker, duración)
- [ ] Mis reservas (view, cancel)

### Semana 5: Pagos
- [ ] Integrar Stripe PaymentSheet
- [ ] Crear reserva + PaymentIntent
- [ ] Webhook de Stripe → actualizar estado
- [ ] Fee de no-show (captura automática)

### Semana 6: Control de Acceso
- [ ] Integrar SALTO KS Connect API / Seam
- [ ] Digital Key (BLE) en app
- [ ] Botón "abrir máquina" en reserva activa

### Semana 7: Polish + Testing
- [ ] Tests (Jest, React Native Testing Library)
- [ ] Auditoría de seguridad
- [ ] UI/UX tweaks
- [ ] Documentación de API interna

### Semana 8: Publicación
- [ ] Crear primeras builds iOS/Android
- [ ] Submitir a tiendas
- [ ] App Review
- [ ] Go live 🎉

---

## 🔒 Seguridad

**Checklist (auditar con `/security`):**

- [ ] Variables de entorno: secretos Stripe/SALTO en `.env.local` + `eas.json` (no .env pública)
- [ ] RLS en Supabase: usuarios solo ven/modifican sus propios datos
- [ ] Validación de firma de webhooks Stripe (`sig_verify`)
- [ ] Límite de requests: rate limiting en Edge Functions
- [ ] Política de privacidad (GDPR + nLPD suiza) antes de publicar
- [ ] JWT refresh token rotation (Supabase Auth lo maneja)
- [ ] CORS correcto en Edge Functions

---

## 📚 Recursos + Contactos

### Suiza
- **Schulthess washMaster:** info@schulthess.com | washmaster.ch
- **Patrick Krey (WeWash Suiza):** (no usar; no laundromats públicos)
- **SALTO Systems:** support@saltosystems.com | saltosystems.com

### Técnica
- **Expo:** docs.expo.dev (EAS Build, Router, plugins)
- **Supabase:** supabase.com/docs (Postgres, Edge Functions, RLS)
- **Stripe:** stripe.com/docs/payments/stripe-react-native | stripe.com/docs/currencies/presentment-currencies (CHF)
- **SALTO KS Connect API:** Contactar support (no está públicamente documentada)
- **Seam API:** seam.co (alternativa más sencilla a SALTO directo)

### Regulatoria Suiza
- **GDPR / nLPD:** https://www.edoeb.admin.ch (Comisario Federal de Protección de Datos)
- **Impuestos:** https://www.estv.admin.ch (recaudar IVA si facturación > CHF 100k/año)

---

## ✅ Checklist Antes de Publicar

- [ ] Tests pasando (Jest + E2E)
- [ ] Auditoría de seguridad completada
- [ ] Política de privacidad + términos publicados
- [ ] Capturas de pantalla de calidad para stores
- [ ] Strings translateados a español (si es necesario multiidioma)
- [ ] Deep linking testeado (universal links iOS, intent filters Android)
- [ ] Payments testados con tarjeta de prueba Stripe
- [ ] SALTO access testeado en sandbox
- [ ] No-show fee flow testeado
- [ ] App icon + splash screen (Expo configura automáticamente)
- [ ] Versión 1.0.0 en package.json + tag en git

---

## 👤 Autor + Contacto

- **Desarrollador:** Cristian Amaya
- **Email:** cristian-amaya@hotmail.com
- **Proyecto:** N's Lavandería (laundromat suizo, app móvil Expo)
- **Idioma:** Español siempre
- **Modelo Claude:** Opus 4.7 (recomendado para desarrollo rápido)

---

**Última actualización:** junio 2026  
**Próxima revisión:** tras decisiones de Schulthess/SALTO (semana 1)
