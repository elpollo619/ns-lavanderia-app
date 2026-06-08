# N's Lavandería App — CONTINUACIÓN SESIÓN 2

**IMPORTANTE:** Usa Claude 4.8 (mejor para tareas complejas de diseño)

---

## 🎯 OBJETIVO PRINCIPAL

Replicar **EXACTAMENTE** el diseño y estilo visual de la web (http://localhost:5173/) en la app móvil React Native.

---

## 📍 ESTADO ACTUAL (8 junio 2026, 20:50 CET)

### ✅ COMPLETADO
- Proyecto Expo corriendo en iOS Simulator
- Design tokens: Colores N's Hotel (dunkelblau #2a3350 + hellblau #01b1e2)
- Tipografía: Inter sans-serif
- Button component (3 variantes)
- Estructura básica de app/index.tsx
- Todo en ALEMÁN

### ❌ PROBLEMA CRÍTICO
**El diseño NO coincide con la web.**

**La web tiene:**
- Cards con estructura dual: TOP (fondo dunkelblau, 60-70% altura) + BOTTOM (blanco)
- Iconos blancos grandes en TOP
- Número pequeño en esquina superior izquierda (01, 02, etc.)
- **Punto/dot azul claro (hellblau) en esquina superior derecha**
- Título + descripción en parte blanca inferior
- Espaciado y sombras muy específicas

**La app actual:**
- Cards más planas
- No tiene la proporción visual correcta
- No tiene el punto azul en esquina
- Falta la jerarquía visual clara

---

## 📁 ESTRUCTURA PROYECTO

```
/Users/cristianamaya/ns-lavanderia-app/
├── app/
│   ├── index.tsx ← 🔴 NECESITA REESCRITURA COMPLETA
│   ├── _layout.tsx
│   └── ...
├── src/
│   ├── types/design.ts ✅ (colores OK)
│   ├── components/
│   │   ├── Button.tsx ✅
│   │   ├── Card.tsx (simplificar)
│   │   ├── Typography.tsx
│   │   └── ...
│   └── ...
└── package.json (React Native + Expo 51)
```

---

## 🎨 REFERENCIA VISUAL (WEB)

### 1. Sección "Was Sie mitbringen"
- Eyebrow en hellblau: "WAS SIE MITBRINGEN"
- Título grande: "Zwei Dinge. Mehr nicht."
- Descripción: "Alles andere ist im Haus..."
- **3 Cards GRID:**
  - TOP (dunkelblau, ~120px): Icono emoji grande + "01"/dot azul
  - BOTTOM (blanco): Título + descripción

### 2. Sección "So funktioniert's"
- **4 Cards GRID:**
  - Misma estructura que anterior
  - Numeración: 01, 02, 03, 04
  - Cada card tiene paso diferente

### 3. SmartFeatures (si aplica)
- **6 Cards Grid 3x2:** Mismo patrón

### 4. Máquinas/Disponibilidad
- Cards simples blancas
- Nombre máquina + estado (VERFÜGBAR/BESETZT)
- Badge color según estado

---

## 🔧 TAREAS INMEDIATAS

### PRIORIDAD 1: Crear componente FeatureCardDual
```
- Props: icon, number, title, description, dotColor?
- TOP section (dunkelblau):
  - Height: 140-160px
  - Number absolute top-left (12px, color hellblau)
  - Icon centered, fontSize 48-56
  - Dot absolute top-right (8px circle, hellblau)
- BOTTOM section (white):
  - Padding: 20-24px
  - Title: fontSize 16, fontWeight 700
  - Description: fontSize 14, color textSecondary
```

### PRIORIDAD 2: Reescribir app/index.tsx
- Hero section: OK (mantener)
- "Was Sie mitbringen": 3 FeatureCardDual
- "So funktioniert's": 4 FeatureCardDual con números
- Máquinas: Cards simples (mantener)

### PRIORIDAD 3: Testing
- Verificar en iOS Simulator
- Comparar lado a lado con web
- Ajustar espaciado/proporciones

---

## 📱 COMANDOS ÚTILES

```bash
cd /Users/cristianamaya/ns-lavanderia-app

# Relanzar app
npm run ios

# Ver logs
npm start

# Instalar dependencias
npm install --legacy-peer-deps
```

---

## 🎬 NEXT STEPS (CLAUDE 4.8)

1. **Leer web en detalle:** Revisar /Users/cristianamaya/Desktop/ns-lavanderia/src/components/sections/
2. **Crear FeatureCardDual:** Componente reutilizable con TOP/BOTTOM
3. **Reescribir app/index.tsx:** Usar nuevo componente
4. **Verificar diseño:** Comparar con web en http://localhost:5173/
5. **Iterar:** Ajustar espaciado, tamaños, colores

---

## 📚 REFERENCIAS LOCALES

- **Web proyecto:** /Users/cristianamaya/Desktop/ns-lavanderia/
- **App proyecto:** /Users/cristianamaya/ns-lavanderia-app/
- **Google Drive:** /Users/cristianamaya/Library/CloudStorage/GoogleDrive-elpollotue@gmail.com/Meine Ablage/ns-lavanderia/
- **Memory:** /Users/cristianamaya/.claude/projects/-Users-cristianamaya/memory/

---

## 🔑 IDIOMA

**SIEMPRE ALEMÁN** en la app. Traducciones ya hechas.

---

## ⚡ CONTEXTO CRITICAL

Usa **Claude 4.8** por favor — mejor capacidad para diseño visual complejo.

---

**Generado:** 8 junio 2026, 20:50 CET  
**Context:** ~93% usado en sesión anterior
