---
allowed-tools: Read, Edit, Bash, Grep, Glob
description: Debuggear bug en componente RN o Edge Function
---

# /debug — Análisis y Corrección de Bugs

Analiza un bug en componente React Native o Edge Function. Sigue el método científico:

1. **Reproducer:** entiendo el bug exacto (¿qué pasa?, ¿qué debería pasar?)
2. **Hipótesis:** qué parte del código lo causa (props, estado, hook, integración)
3. **Investigación:** leo logs, tipos TS, flujo de datos
4. **Fix:** código corregido + explicación del problema
5. **Validación:** tests pasan, comportamiento esperado confirmado

## Ejemplo de invocación

```
/debug ReservationForm.tsx — la lista de máquinas no se actualiza después de crear una reserva
/debug supabase/functions/payment/webhook/index.ts — webhook de Stripe no está capturando intents
/debug AuthContext.tsx — el usuario se desloguea al refrescar la app
```

## Herramientas usadas

- **Read:** examinar código fuente
- **Grep:** buscar referencias a variables/funciones
- **Bash:** ejecutar tests, chequear tipos TypeScript
- **Edit:** corregir el código

## Scope

- React Native components (hooks, props, estado)
- Expo features (Router, universal links, plugins)
- Edge Functions (Supabase, Node.js, TypeScript)
- Integraciones (Supabase, Stripe, SALTO)
- TypeScript errors

## No incluye

- Arquitectura general (usar `/systemdesign` para eso)
- Refactoring mayor (usar `/refactor`)
- Tests nuevos (usar `/test`)
