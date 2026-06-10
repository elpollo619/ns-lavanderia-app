# N's Lavandería — Handoff

**Fecha:** 10 Junio 2026
**Status:** 🟢 Diseño hi-fi implementado · backend desplegado · esperando cuentas externas

---

## Estado Actual

### ✅ Completado

**Diseño (handoff `design_handoff_ns_laundry_app/`)**
- 4 pantallas en alemán + CHF: Auth, Start, Buchen (4 pasos + Bestätigung), Profil
- Themes Hell/Dunkel completos (toggle en Profil → Einstellungen)
- Gotham + Caflisch embebidas; logo como SVG estático (tile + stacked)
- Componentes: Ring countdown live, StatusPills, StepBar, TabBar custom
- Verificado en web y simulador iOS

**Backend (Supabase `upqdfimcddratmleaqay`)**
- Migraciones 001–005 aplicadas (schema, RLS, fix recursión, lock mapping, campos diseño)
- **Las 7 Edge Functions desplegadas y ACTIVE** (reservas, pagos, machine-open)
- Seed: 4 máquinas en alemán con precio/capacidad; realtime habilitado
- Home/Buchen leen máquinas reales con suscripción realtime (fallback a mock sin sesión)
- Botón "Öffnen" → Edge Function `machine-open` (Seam/SALTO según `machines.lock_provider`)

### ⏳ Bloqueado en cuentas externas (ver docs/INTEGRACIONES.md)

1. **Stripe:** crear cuenta CH, activar TWINT, `supabase secrets set STRIPE_SECRET_KEY / STRIPE_WEBHOOK_SECRET`, webhook → `…/functions/v1/payment-webhook`
2. **Seam/SALTO:** cuenta Seam (gratis ≤3 dispositivos) + Connect Webview al admin SALTO de N + waiver de remote unlock; mapear `machines.lock_provider/lock_device_id`
3. **Preguntas a N:** ¿SALTO KS cloud? ¿site propio para la lavandería? ¿quién es admin? ¿hay IQ hub?
4. **Schulthess:** sigue pendiente la respuesta (washMaster vs IoT propio) para control de las máquinas en sí

### 📋 Próximo trabajo de código

- Conectar el flujo Buchen a `reservations-create` + PaymentSheet cuando haya claves Stripe
- Pase pixel-perfect contra el ZIP del prototipo (`design_handoff_ns_laundry_app.zip`, está en el chat de diseño — falta descargarlo)
- Estados fertig/reserviert desde reservas reales (el enum de machines solo tiene available/in_use/maintenance)
- Notificaciones push (reserva confirmada, wäsche fertig)

---

## Notas técnicas

- **Auth:** Supabase tiene confirmación de email ON → para QA visual usar
  `EXPO_PUBLIC_DEV_PREVIEW=1 npx expo start` (salta el gate solo en dev).
  Usuario de prueba sin confirmar: ns.lavanderia.test@gmail.com
- **Gotham-Black** no existe en el Markenpaket; Bold lo sustituye (README pide 800)
- **Apple Pay / Google Pay:** requieren `eas build --profile development`, no Expo Go
- **TWINT:** pre-auth máx 7 días → estrategia: cobrar no-show solo si ocurre
  (`payment-capture-noshow` + cron 03:00, pendiente de agendar en pg_cron)

```bash
cd /Users/cristianamaya/ns-lavanderia-app
EXPO_PUBLIC_DEV_PREVIEW=1 npx expo start --ios   # simulador con preview
npx tsc --noEmit                                  # typecheck
supabase functions deploy                         # re-deploy backend
```
