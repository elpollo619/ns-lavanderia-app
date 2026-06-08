# N's Lavandería — App Móvil

App móvil para reservar máquinas de lavado/secado en un Waschsalon suizo.

## Stack Técnico

- **Frontend:** React Native + Expo (managed)
- **Backend:** Supabase (Postgres + Auth + Edge Functions)
- **Pagos:** Stripe PaymentSheet (TWINT, Apple/Google Pay, tarjeta)
- **Acceso:** SALTO KS (Digital Key BLE)
- **Publicación:** EAS Build/Submit

## Setup Inicial

```bash
# Instalar dependencias
npm install
# o pnpm install

# Iniciar Expo
npm run start

# En otro terminal: compilar para iOS/Android
npm run ios
npm run android
```

## Variables de Entorno

Copiar `.env.example` a `.env.local` y completar:

```bash
cp .env.example .env.local
```

## Documentación

Ver `CLAUDE.md` para:
- Decisiones técnicas
- Stack completo
- Roadmap 8 semanas
- Integración con agents y slash commands de Claude Code

## Licencia

Privado — Proyecto interno.

## Contacto

**Desarrollador:** Cristian Amaya  
**Email:** cristian-amaya@hotmail.com
