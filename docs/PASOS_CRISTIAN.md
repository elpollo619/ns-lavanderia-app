# Pasos de Cristian — Checklist accionable

**Actualizado:** 23 agosto 2026 · Todo el código está listo: cada paso "enciende" algo ya construido.

---

## 🔴 PRIORIDAD 1 — Stripe (≈30 min) → enciende el pago online

1. Ve a https://dashboard.stripe.com/register
2. Registra la cuenta: país **Suiza**, datos de **Hans Amonn AG / N's Lavandería**
3. En el dashboard: **Settings → Payment methods → TWINT → Turn on**
   (la revisión de Stripe tarda 1–2 días hábiles; tarjeta y Apple Pay funcionan ya)
4. **Developers → API keys** → copia la **Publishable key** (`pk_test_…`) y la
   **Secret key** (`sk_test_…`)
5. **Developers → Webhooks → Add endpoint:**
   - Endpoint URL: `https://upqdfimcddratmleaqay.supabase.co/functions/v1/payment-webhook`
   - Events: `payment_intent.succeeded`, `payment_intent.amount_capturable_updated`,
     `charge.captured`, `payment_intent.payment_failed`, `payment_intent.canceled`
   - Copia el **Signing secret** (`whsec_…`)
6. **Pásame las 3 claves** → yo hago: `pk` a `.env.local`, y
   `supabase secrets set STRIPE_SECRET_KEY=… STRIPE_WEBHOOK_SECRET=…`

## 🔴 PRIORIDAD 2 — Seam (≈15 min) → enciende el acceso SALTO automático

1. Crea cuenta en https://console.seam.co (workspace de **producción**; gratis ≤3 dispositivos)
2. Copia la **API key** (`seam_…`) y pásamela
3. Yo genero el **Connect Webview** → se lo envías al **admin de SALTO del hotel**,
   que conecta su cuenta con un clic (necesita cuenta KS de producción, `app.saltoks.com`)
4. Pido a Seam (support@seam.co) el waiver de remote unlock para los IQ hubs
   (solo necesario para el botón "Öffnen"; las credenciales BLE no lo necesitan)

## 🔴 PRIORIDAD 3 — Hablar con N (una conversación)

Preguntas exactas:
1. ¿Vuestro sistema es **SALTO KS** (cloud, se gestiona en app.saltoks.com)
   o SALTO Space (servidor local)?
2. ¿Quién es el **admin** de SALTO? (es quien hará clic en el Connect Webview)
3. ¿Se puede crear un **site separado** en SALTO para la lavandería?
4. ¿Las puertas tienen **IQ hub** conectado a internet?

## 🟡 PRIORIDAD 4 — Dos correos ✅ REDACTADOS (23 ago 2026)

Los dos borradores están listos en **`docs/CORREOS_BORRADORES.md`** — en alemán,
solo hay que rellenar `[Telefonnummer]`, copiar y enviar.

- **sales@we-wash.com** — integración B2B tipo Allthings (ángulo: el Standort ya
  opera con WeWash Boxes; queréis integrar la reserva en vuestra app)
- **info@schulthess.com** — ¿washMaster permite reservas dentro de app propia
  o solo deep-link a la suya?

⚠️ **Envíalos primero.** Son los únicos pendientes con semanas de latencia por
respuesta ajena; todo lo demás depende solo de ti y se resuelve en minutos.

## 🟢 PRIORIDAD 5 — Supabase (5 min, en supabase.com/dashboard)

1. **Authentication → Sign In / Up → Email → desactivar "Confirm email"**
   (para que el registro funcione al instante; se reactiva al lanzar con dominio propio)
2. **SQL editor** → hacerte superadmin:
   ```sql
   UPDATE users SET role = 'superadmin' WHERE email = 'cristian-amaya@hotmail.com';
   ```
   (después de registrarte en la app con ese email)

## 🟢 PRIORIDAD 6 — Varios

- **ZIP del diseño:** descarga `design_handoff_ns_laundry_app.zip` del chat de diseño
  → carpeta `design_handoff_ns_laundry_app/` del repo → hago el pase pixel-perfect
- **Dominio web:** decidir (¿`ns-lavanderia.ch`? ¿`nslavanderia.ch`?) → arreglo
  og:image + schema.org y desplegamos en Netlify (con las 2 env vars `VITE_*`)
- **Gotham-Black.otf:** si existe en algún sitio, añadirlo al Markenpaket

## 💰 Para publicar en stores (cuando toque)

1. **Apple Developer Program** ($99/año): developer.apple.com/programs
2. **Google Play Console** ($25 una vez): play.google.com/console/signup
3. `npm i -g eas-cli && eas login` (cuenta Expo) → yo lanzo
   `eas build --profile development` (tu iPhone) y luego `production`

---

### Qué se enciende con cada paso

| Tu paso | Lo que empieza a funcionar |
|---|---|
| Stripe (claves) | Pago Karte/Apple Pay/TWINT en el flujo Buchen, webhook, no-show fees |
| Seam + admin SALTO | Credencial automática al reservar (modelo LikeMagic) + botón Öffnen |
| Confirm email off | Registro de clientes al instante |
| SQL superadmin | Admin-Bereich completo: Standorte, admins, máquinas, Umsatz |
| ZIP diseño | Pase pixel-perfect del UI |
| Dominio | Web desplegada con preview de WhatsApp + disponibilidad live |
| Apple/Google + EAS | Builds en tu iPhone y publicación en stores |
