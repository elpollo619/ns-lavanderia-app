# N's Lavandería — Handoff para Próxima Sesión

**Fecha:** 9 Junio 2026  
**Sprints Completados:** 3 (Design System, Auth, Reservas + Pagos)  
**Líneas de Código:** ~3500  
**Commits:** 6  
**Status:** 🟡 Listo para Supabase setup + testing

---

## Estado Actual del Proyecto

### ✅ Completado

**Sprint 1: Design System**
- FeatureCardDual component (7 instancias en home)
- Design tokens N's Hotel (dunkelblau #2a3350 + hellblau #01b1e2)
- 5 componentes UI (Button, Card, Badge, Typography, FeatureCardDual)
- Barrel export

**Sprint 2: Autenticación + Navegación**
- AuthContext con Supabase Auth (signUp/signIn/signOut)
- Pantallas de login/signup (email/password)
- Bottom Tab Navigation (Home, Reservations, Profile)
- Condicional auth state → mostrar auth o tabs

**Sprint 3: Reservas + Pagos (Paralelo - 3 agentes)**
- Backend: Schema SQL, RLS, 6 Edge Functions
- Mobile: 3-step reservation flow (máquina → datetime → resumen)
- Stripe: PaymentSheet (TWINT, Apple Pay, Google Pay, Card CHF)
- Webhooks + cron job para no-show fees

### ⏳ Pendiente (Próxima Sesión)

1. **Configurar `.env.local`**
   ```
   EXPO_PUBLIC_SUPABASE_URL=https://[project-id].supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=[anon-key]
   EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
   ```

2. **Supabase Setup**
   - Crear proyecto en supabase.com
   - Ejecutar migrations (001_init_schema.sql, 002_rls_policies.sql)
   - Copiar SUPABASE_URL y ANON_KEY a .env.local
   - Crear tabla `machines` con seed de 4 máquinas

3. **Stripe Setup**
   - Crear cuenta Stripe Suiza (CHF)
   - Habilitar TWINT + métodos de pago
   - Copiar API keys a .env.local
   - Configurar webhook en Stripe → Edge Function payment-webhook

4. **Deploy Edge Functions**
   ```bash
   supabase functions deploy payment-create-intent
   supabase functions deploy payment-webhook --no-verify-jwt
   supabase functions deploy payment-capture-noshow
   supabase functions deploy reservations-create
   supabase functions deploy reservations-confirm
   supabase functions deploy reservations-check-noshows
   ```

5. **Testing Auth Flow**
   - npm run ios
   - Signup con test@example.com / password123
   - Verificar que aparecen (tabs)
   - Logout desde profile tab

6. **Testing Reservas (sin pago real, mock Stripe)**
   - Seleccionar máquina
   - Seleccionar fecha + hora
   - Ver resumen
   - Pagar (mostrará PaymentSheet si Stripe configurado)

---

## Estructura Finalizada

```
ns-lavanderia-app/
├── app/
│   ├── (auth)/
│   │   ├── login.tsx
│   │   └── signup.tsx
│   ├── (tabs)/
│   │   ├── _layout.tsx (Bottom Tabs)
│   │   ├── index.tsx (Home con FeatureCardDual)
│   │   ├── reservations.tsx (3-step flow)
│   │   └── profile.tsx
│   └── index.tsx (Home original)
│
├── src/
│   ├── components/ (9 total)
│   │   ├── FeatureCardDual.tsx
│   │   ├── MachineSelector.tsx
│   │   ├── DateTimePicker.tsx
│   │   ├── ReservationSummary.tsx
│   │   └── [Button, Card, Badge, Typography, index.ts]
│   ├── contexts/
│   │   └── AuthContext.tsx
│   ├── hooks/
│   │   ├── useReservationFlow.ts
│   │   └── useStripePayment.ts
│   ├── api/
│   │   ├── machines.ts
│   │   └── reservations.ts
│   ├── lib/
│   │   └── supabase.ts
│   ├── utils/
│   │   └── calendar.ts
│   └── types/
│       ├── design.ts
│       └── database.ts
│
├── supabase/
│   ├── migrations/
│   │   ├── 001_init_schema.sql (4 tablas, enums, seed)
│   │   └── 002_rls_policies.sql (Row-Level Security)
│   └── functions/
│       ├── _shared/
│       │   ├── cors.ts
│       │   ├── supabase.ts
│       │   └── stripe.ts
│       ├── reservations-create/index.ts
│       ├── reservations-confirm/index.ts
│       ├── reservations-check-noshows/index.ts
│       ├── payment-create-intent/index.ts
│       ├── payment-webhook/index.ts
│       └── payment-capture-noshow/index.ts
│
├── .env.example (actualizado)
├── .env.local (CREAR)
├── PROJECT_STATUS.md
└── HANDOFF.md (este archivo)
```

---

## Comandos Útiles para Próxima Sesión

```bash
cd /Users/cristianamaya/ns-lavanderia-app

# Ver logs de agentes anteriores
git log --oneline -10

# Ver cambios pendientes (debe estar vacío)
git status

# Iniciar app (requiere .env.local)
npm run ios

# Deploy Supabase
supabase db push
supabase functions deploy payment-create-intent

# Ver migraciones
supabase db diff --schema public
```

---

## Notas Críticas

- **TWINT**: Max 7 días pre-auth. Job de no-show corre diariamente a las 03:00
- **Apple Pay / Google Pay**: Requieren `eas build --profile development`, NO funcionan en Expo Go
- **Webhook**: Requiere `verify_jwt = false` en supabase/config.toml para payment-webhook
- **RLS**: Está activa. Usuario solo ve sus propias reservas + máquinas públicas
- **TODO[STRIPE]**: Marcado en app/(tabs)/reservations.tsx línea 42 — integrar useStripePayment() hook

---

## Próximas Características (Sprint 4+)

- [ ] SALTO KS Connect API (abrir puertas/máquinas)
- [ ] Supabase Realtime (actualización en vivo de disponibilidad)
- [ ] Admin dashboard (ver reservas, ingresos, máquinas)
- [ ] Notificaciones (push para reserva confirmada, no-show)
- [ ] Publicar App Store + Google Play

---

**Repo:** `/Users/cristianamaya/ns-lavanderia-app`  
**Git Status:** Limpio, todos los cambios commiteados  
**Listo para:** Configurar .env + Supabase setup
