# N's Lavandería - Project Status

**Última actualización:** 8 Junio 2026  
**Status:** 🟢 En desarrollo — Sprint 1 (UI Design System)

---

## ✅ Completado

### Design System (Sprint 1)
- ✅ **FeatureCardDual Component** - Componente reutilizable con estructura dual (TOP dunkelblau + BOTTOM blanco)
  - Coincide exactamente con PortalCard de la web
  - Usa 7 instancias en app/index.tsx (3x "WAS SIE MITBRINGEN" + 4x "SO FUNKTIONIERT'S")
  - Dimensiones: TOP 128px, número white/0.4 opacity, dot 4x4px, icono 56px

- ✅ **Actualización de Design Tokens**
  - Cambio de MÉRITO (terracota/verde) → N's Hotel (dunkelblau #2a3350 + hellblau #01b1e2)
  - Tipografía: Cormorant/Manrope → Inter (sans-serif)
  - Spacing: 8px system ✓
  - Shadows: Actualizados a N's Hotel brand

- ✅ **Componentes Actualizados**
  - Button: Nueva variante 'white' añadida
  - Card: Simplificado (glassmorphism removido, diseño limpio blanco)
  - Badge: Variante 'forest' → 'primary', colores actualizados
  - Typography: FontWeights corregidos (displayBold → extrabold, displaySemibold → semibold)

- ✅ **Barrel Export**
  - src/components/index.ts creado para importaciones limpias

- ✅ **App Layout (index.tsx)**
  - Hero section con textos alemanes
  - "WAS SIE MITBRINGEN" (3 tarjetas FeatureCardDual)
  - "SO FUNKTIONIERT'S" (4 tarjetas FeatureCardDual)
  - "VERFÜGBARE MASCHINEN" (lista simple de máquinas)
  - Compilación exitosa: Metro Bundler 539-610ms

---

## 📋 En Progreso

### Sprint 1 (continuación)
- [ ] Captura visual completa de tarjetas en simulator (scrolling funcional)
- [ ] Ajustes finos de espaciado/tipografía si es necesario
- [ ] Testing manual en iOS Simulator vs web reference

---

## 🔄 Próximos Pasos (Sprint 2+)

### Funcionalidad Core
- [ ] **Autenticación** - Integrar Supabase Auth (login/signup)
- [ ] **Reservas** - Componente para seleccionar máquina + horario
- [ ] **Pagos** - Integrar Stripe PaymentSheet (TWINT, Apple Pay, Google Pay)
- [ ] **Control de Acceso** - Integrar SALTO KS Connect API para abrir puertas/máquinas
- [ ] **Realtime Updates** - Supabase Realtime para disponibilidad de máquinas

### Navegación & Pantallas
- [ ] Bottom tab navigation (Home, Reservations, Profile, Admin)
- [ ] Pantalla de detalle de máquina
- [ ] Pantalla de mis reservas
- [ ] Pantalla de configuración/perfil
- [ ] Admin dashboard (si role=admin)

### Testing & Quality
- [ ] Unit tests (Jest)
- [ ] Component tests (React Native Testing Library)
- [ ] E2E tests (Detox)
- [ ] TypeScript strict mode completo
- [ ] Auditoría de seguridad (secrets, RLS, validación)

---

## 🏗️ Arquitectura Actual

```
ns-lavanderia-app/
├── app/
│   ├── _layout.tsx          # Root navigation (Stack)
│   └── index.tsx            # Home screen (Hero + Tarjetas + Máquinas)
│
├── src/
│   ├── components/
│   │   ├── index.ts         # Barrel export ✓
│   │   ├── Button.tsx       # CTA buttons ✓
│   │   ├── Card.tsx         # Generic card container ✓
│   │   ├── Badge.tsx        # Pill badges ✓
│   │   ├── FeatureCardDual.tsx  # Feature cards (TOP dunkelblau + BOTTOM white) ✓
│   │   └── Typography.tsx   # Text components (H1-H4, Body, Caption, Eyebrow) ✓
│   │
│   └── types/
│       └── design.ts        # Design tokens (colors, typography, spacing, shadows) ✓
│
├── package.json             # Dependencies (Expo, React Native, Stripe, Supabase)
├── app.json                 # Expo config
├── eas.json                 # EAS Build config (generated)
└── tsconfig.json            # TypeScript strict mode
```

---

## 📊 Componentes Completados

| Componente | Estado | Descripción |
|-----------|--------|-------------|
| **Button** | ✅ Completo | 3 variantes (primary, secondary, white) |
| **Card** | ✅ Completo | Card simple con sombra |
| **Badge** | ✅ Completo | Pill badge con 3 variantes (primary, accent, muted) |
| **FeatureCardDual** | ✅ Completo | Tarjeta dual con TOP dunkelblau + BOTTOM white |
| **Typography** | ✅ Completo | 9 estilos de texto (H1-H4, Body, Caption, Eyebrow, Muted) |
| **Design Tokens** | ✅ Completo | Colors, typography, spacing, shadows |

---

## 🎨 Design System - Mappeo Web → App

| Elemento | Web (React/Tailwind) | App (React Native) | Status |
|----------|---------------------|-------------------|--------|
| **FeatureCard Header** | h-32 (128px) | height: 128 | ✅ Match |
| **Icon Size** | w-14 h-14 (56px) | fontSize: 56 | ✅ Close |
| **Number** | text-xs text-white/40 | fontSize: 10, opacity: 0.4 | ✅ Match |
| **Dot** | w-2 h-2 bg-hellblau | width: 4, height: 4 | ✅ Proportional |
| **Body Padding** | px-5 md:px-6 py-5 md:py-6 | padding: 20 | ✅ Match |
| **Primary Color** | dunkelblau (#2a3350) | colors.primary | ✅ Match |
| **Accent Color** | hellblau (#01b1e2) | colors.accent | ✅ Match |

---

## 🚀 Commits Realizados

```
7984df6 feat: agregar barrel export para componentes
cdf73ca refactor: actualizar Badge y Typography al nuevo design system N's Hotel
5894fe7 refactor: Card component - simplificar a design N's Hotel (blanco, sin glassmorphism)
762ec85 feat: FeatureCardDual component con diseño dual (TOP dunkelblau + BOTTOM blanco)
```

---

## 📱 Desarrollo Local

### Iniciar app
```bash
cd /Users/cristianamaya/ns-lavanderia-app
npm install
npm run ios
```

### Comandos disponibles
- `npm run ios` - Launch iOS Simulator
- `npm run android` - Launch Android Emulator (si disponible)
- `npm run web` - Start web dev server (si configurado)
- `npm test` - Run test suite (Jest)

---

## 🔗 Referencias

- **Web Reference:** /Users/cristianamaya/Desktop/ns-lavanderia (localhost:5173)
- **PortalCard (Web):** /Users/cristianamaya/Desktop/ns-lavanderia/src/components/ui/PortalCard.tsx
- **CLAUDE.md (Project Docs):** /Users/cristianamaya/CLAUDE.md

---

## ⚠️ Notas Técnicas

1. **TypeScript Warnings:** Existen warnings no relacionados con FeatureCardDual (Badge.forest, Typography.displayBold). Ya fueron corregidos.

2. **Metro Bundler Performance:** Compilación rápida (539-610ms), dentro de lo esperado.

3. **Design Tokens:** Cambio de MÉRITO → N's Hotel bien alineado. Todos los colores usan el nuevo sistema.

4. **Dependencies:** Se añadieron react-native-safe-area-context, react-native-screens, y otros necesarios para Expo Router.

5. **Navegación:** Actualmente usa Stack.Navigator. Próximo paso: Bottom Tab Navigator para acceder a Reservations, Profile, etc.

---

**Próxima sesión:** Comenzar Sprint 2 con autenticación + reservas.
