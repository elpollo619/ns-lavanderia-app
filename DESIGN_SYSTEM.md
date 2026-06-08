# N's Lavandería — Design System

**Basado en:** MÉRITO Brand Identity (Luz Mery Pfeuti)  
**Versión:** 1.0 · junio 2026  
**Inspiración:** Marca de limpieza profesional + arte suiza

---

## 🎨 Paleta de Colores

### Colores Primarios

#### Terracota (Accent)
- **Hex:** `#A3482F`
- **RGB:** 163, 72, 47
- **Uso:** Botones primarios, eyebrows, links activos, CTAs
- **Filosofía:** Color del barro colombiano, trabajo manual, calidez

#### Terracota Profundo (Accent Deep)
- **Hex:** `#7E341F`
- **RGB:** 126, 52, 31
- **Uso:** Hover states, énfasis, sombras de botones
- **Estados:** Press, focus

#### Terracota Suave (Accent Soft)
- **Hex:** `#D9A17F`
- **RGB:** 217, 161, 127
- **Uso:** Gradientes, fondos suaves, ilustraciones
- **Papel:** Transición visual

### Colores Secundarios

#### Verde Bosque (Forest)
- **Hex:** `#4D6758`
- **RGB:** 77, 103, 88
- **Uso:** Tags, badges, categorías, estados positivos
- **Filosofía:** Bosques de Berna, naturalidad, confianza

### Fondos

#### Crema Principal (Background)
- **Hex:** `#F6EFE4`
- **RGB:** 246, 239, 228
- **Uso:** Fondo base de toda la app
- **Filosofía:** Lienzo de pintura sin usar, cálido (no blanco puro)

#### Crema Suave (Background Soft)
- **Hex:** `#EFE4D5`
- **RGB:** 239, 228, 213
- **Uso:** Fondos alternativos, separadores sutiles

#### Superficie (Surface Glass)
- **Color:** `rgba(255, 252, 247, 0.78)`
- **Uso:** Cards con glassmorphism, panels flotantes
- **Efecto:** Backdrop-filter blur para profundidad

#### Superficie Sólida (Surface Strong)
- **Hex:** `#FFFAF4`
- **Uso:** Cards sólidos, elementos sin blur

### Texto

#### Texto Principal
- **Hex:** `#1D1C1A`
- **RGB:** 29, 28, 26
- **Uso:** Títulos, cuerpo principal
- **Nota:** Casi negro pero cálido, no negro puro

#### Texto Muted
- **Hex:** `#61584F`
- **RGB:** 97, 88, 79
- **Uso:** Texto secundario, descripciones, captions
- **Contraste:** A+, legible en #F6EFE4

### Líneas y Bordes

#### Línea Sutil
- **Color:** `rgba(29, 28, 26, 0.10)`
- **Uso:** Bordes, separadores, dividers

---

## 📝 Tipografía

### Display Font: Cormorant Garamond

```css
font-family: 'Cormorant Garamond', serif;
font-weights: 500 (Medium), 600 (SemiBold), 700 (Bold);
source: Google Fonts;
```

**Uso:**
- Títulos principales (H1, H2, H3)
- Logo/marca
- Énfasis editorial

**Características:**
- Elegancia clásica francesa
- Kerning estrecho
- Serifas finas
- Proporciones contemporáneas

### System Font: Manrope

```css
font-family: 'Manrope', sans-serif;
font-weights: 400, 500, 600, 700, 800;
source: Google Fonts;
```

**Uso:**
- Texto de cuerpo
- Labels y UI
- Navegación
- Captions

**Características:**
- Sans-serif geométrico moderno
- Formas suaves pero con carácter
- Legible en textos largos
- Complementa Cormorant sin competir

### Jerarquía de Tipografía

#### H1 — Títulos de Héroe
```
Font: Cormorant Garamond 700
Size: 48px (clamp 3rem - 5.2rem)
Line-height: 0.94
Letter-spacing: -0.04em
Margin-bottom: 1.5rem
```

#### H2 — Títulos de Sección
```
Font: Cormorant Garamond 700
Size: 35px (clamp 2.2rem - 3.4rem)
Line-height: 0.98
Letter-spacing: -0.02em
Margin-bottom: 1.25rem
```

#### H3 — Títulos de Card
```
Font: Cormorant Garamond 600
Size: 20px
Line-height: 1.1
Margin-bottom: 1rem
```

#### Body — Texto de Cuerpo
```
Font: Manrope 400
Size: 16-17px
Line-height: 1.7
Color: #61584F (muted)
```

#### Eyebrow — Kicker
```
Font: Manrope 800
Size: 12px
Text-transform: uppercase
Letter-spacing: 0.20em
Color: #A3482F (accent)
Margin-bottom: 0.75rem
```

#### Caption — Labels Pequeños
```
Font: Manrope 800
Size: 12-12.5px
Text-transform: uppercase
Letter-spacing: 0.08-0.20em
Line-height: 1.4
```

---

## 🎛️ Espaciado

Sistema base: **8px**

```
4px    → Micro-ajustes
8px    → Espacio mínimo entre elementos
12px   → Padding de badges
16px   → Unidad base (padding, gaps)
20px   → Padding de cards secundario
24px   → Padding de cards estándar
32px   → Padding de panels
40px   → Padding de héroe
48px   → Padding bottom de page shell
```

---

## 🔘 Componentes Clave

### Button (Primario)

```tsx
<Button onPress={() => {}}>Reservar</Button>
```

**Estilos:**
- Fondo: `#A3482F` (terracota)
- Hover: `#7E341F` + sombra
- Altura: 48px mínimo
- Padding: 13px 20px
- Border-radius: 999px (pill)
- Font: Manrope 700, 16px
- Color texto: `#FFF7F1` (off-white)

**Interacción:**
- Press: transform translateY(-1px), sombra más oscura
- Disabled: opacity 0.5

### Button (Secundario)

**Estilos:**
- Fondo: `rgba(255, 255, 255, 0.6)` (transparente)
- Borde: 1px `rgba(29, 28, 26, 0.15)`
- Color texto: `#1D1C1A` (text)
- Hover: backgroundColor más opaco

### Card

```tsx
<Card>
  <H3>Título</H3>
  <Body>Descripción</Body>
</Card>
```

**Estilos:**
- Border-radius: 22px (lg)
- Fondo: `rgba(255, 252, 247, 0.78)` (glassmorphism)
- Borde: 1px `rgba(255, 255, 255, 0.55)`
- Backdrop-filter: blur(12px)
- Sombra: 0 20px 60px `rgba(76, 52, 34, 0.12)`
- Padding: 24px
- **Acento superior:** línea 4px gradiente terracota → verde

**Variantes:**
- `variant="default"`: Glassmorphism
- `variant="solid"`: Fondo sólido `#FFFAF4`, sin blur

### Badge / Pill

```tsx
<Badge label="TWINT" />
<Badge label="Verde" variant="forest" />
```

**Estilos:**
- Forest (default):
  - Fondo: `rgba(77, 103, 88, 0.12)`
  - Color: `#4D6758`
- Accent:
  - Fondo: `rgba(163, 72, 47, 0.12)`
  - Color: `#A3482F`
- Font: Manrope 800, 12px, uppercase
- Letter-spacing: 0.06em
- Padding: 4px 20px
- Border-radius: 999px (pill)

---

## 🎯 Patrones de Uso

### Hero Section
- Eyebrow en terracota
- H1 en Cormorant display
- Body descriptivo en gris muted
- CTA en Button primario

### Card Grid
- Máximo 3 columnas en desktop
- 1 columna en mobile
- Gaps: 16px
- Línea gradiente superior

### Navegación
- Sticky header con glassmorphism
- Logo Cormorant Garamond 700
- Pills de navegación en forest
- Back button terracota

### Form
- Inputs con border-radius 16px
- Focus border: terracota
- Focus shadow: `0 0 0 3px rgba(163, 72, 47, 0.12)`
- Label: Manrope 700, 12px, uppercase
- Error: terracota `#A3482F`

---

## 🚫 Do's & Don'ts

### ✅ DO

- ✓ Usar Cormorant para H1, H2, H3
- ✓ Eyebrows siempre en uppercase terracota
- ✓ Botones primarios en terracota
- ✓ Línea gradiente superior en cards
- ✓ Espaciado generoso (respira)
- ✓ Fotos con temperatura cálida
- ✓ Texto contrast A+ en #F6EFE4

### ❌ DON'T

- ✗ Nunca terracota como fondo de página
- ✗ Nunca Cormorant para body text
- ✗ Nunca verde forest como CTA
- ✗ Nunca emojis en texto oficial
- ✗ No corporativo, no frío, no genérico
- ✗ Nunca compresión de tipografía
- ✗ No usar más de 2 colores de fondo por sección

---

## 📂 Estructura de Archivos

```
src/
├── types/
│   └── design.ts          # Paleta, tipografía, espaciado
├── components/
│   ├── Button.tsx         # Botones primario/secundario
│   ├── Card.tsx           # Cards con glassmorphism
│   ├── Typography.tsx     # H1-H4, Body, Eyebrow, etc.
│   ├── Badge.tsx          # Pills/badges
│   └── index.ts           # Exports
└── app/
    ├── _layout.tsx        # Root layout
    └── index.tsx          # Home screen
```

---

## 🔗 Referencias

- **MÉRITO Brand Identity:** Google Drive (Luz Mery Pfeuti)
- **Google Fonts:** Cormorant Garamond, Manrope
- **Figma Design Tokens:** (próximo)

---

## 📱 Responsive Design

### Breakpoints
- **Mobile:** < 480px (100% width, padding 16px)
- **Tablet:** 480px - 1024px (grid 2 cols)
- **Desktop:** > 1024px (grid 3 cols)

### Adaptaciones
- Cards: 1 col (mobile) → 2 cols (tablet) → 3 cols (desktop)
- Hero: stack (mobile) → side-by-side (desktop)
- Spacing: reducido en mobile, generoso en desktop

---

**Diseño creado con filosofía:** Trabajo que vale, arte que queda.
