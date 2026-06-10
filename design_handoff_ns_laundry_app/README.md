# Handoff: N's LAVANDERIA — Mobile App (SB-Waschsalon)

## Overview
A high-fidelity, clickable mobile prototype for **N's LAVANDERIA**, the self-service laundromat
("SB-Waschsalon") brand belonging to the N's HOTEL family. The app lets a guest see live machine
availability, book a washer/dryer with a wash program and extras, pay, and manage a wallet/profile.
The **entire UI is in German** and prices are in **Swiss francs (CHF)**.

The prototype ships two fully on-brand visual directions, switchable at runtime via a Tweaks panel:
- **Hell** (light) — white surfaces, lots of air, brand blue text.
- **Dunkel** (dark) — immersive Dunkelblau (#2a3350) with glassy cards.

## About the Design Files
The files in this bundle are **design references created in HTML/React (via in-browser Babel)** —
a prototype communicating the intended look, copy, and behavior. **They are not production code to
ship as-is.** The task for the implementer is to **recreate these designs in the target codebase's
environment** (e.g. React Native / Expo, Flutter, SwiftUI, or a web stack) using that project's
established components, navigation, and state patterns. If no app environment exists yet, choose the
most appropriate mobile framework and implement the screens there.

The real brand logo is generated as **true vector** from the hotel's own fonts (Gotham + Caflisch
Script) using `opentype.js` in `logo-builder.js` / `brand-render.js`. In a production app, export the
logo once to static SVG/PDF assets instead of generating it at runtime.

## Fidelity
**High-fidelity (hifi).** Final colors, typography (Gotham), spacing, iconography, copy, and
interactions are all intended as shown. Recreate pixel-faithfully using the codebase's UI primitives.

## Brand
- **Colors:** Dunkelblau `#2a3350`, Hellblau `#01b1e2` (dark-mode accent brightens to `#19c1ef`),
  Weiss `#ffffff`.
- **Typography:** Gotham (Light 300 / Book 400 / Medium 500 / Bold 700 / Black 800). Fonts live in
  `/fonts`. Headlines Bold, body Book/Medium.
- **Logo:** monogram "N's" with the cyan apostrophe triangle inside a square bracket frame; wordmark
  "LAVANDERIA" with a cyan accent bar. Variants used: `tile` (app icon), `stacked` (auth hero).
- **Tone:** premium, clean, calm. No emoji.

## Screens / Views

### 1. Auth (Login / Registrierung) — `app/screens-auth.jsx`
- **Purpose:** sign in or create an account.
- **Layout:** full-bleed splash using the active direction's background. Hero block (top): 64px
  rounded app-icon tile (logo `tile`), stacked wordmark logo (168×116), eyebrow "SB-WASCHSALON · 24 H"
  in accent, headline (Bold 28px, 2 lines). Form below: fields (Name on signup, E-Mail, Passwort with
  eye toggle), "Passwort vergessen?" link, primary button, divider "oder weiter mit", Apple + Google
  buttons, footer toggle between "Anmelden" / "Registrieren".
- **Copy:** headline login = "Deine Wäsche, bereit wann du willst."; signup = "Konto erstellen bei
  N's LAVANDERIA."
- Fields: 54px tall, radius ~16, field bg `#f3f5fa` (light), focus border = accent.

### 2. Start / Home — `app/screens-home.jsx`
- **Purpose:** greeting, next booking or availability, live machine list, loyalty promo.
- **Layout (vertical stack, 20px gap):**
  - Header: "Guten Tag," + user name (Bold 24); bell icon button (46×46); circular avatar "SN".
  - Either a **next-booking card** (cyan-tinted header "Deine nächste Buchung" + machine row + "Öffnen"
    QR chip) OR an **availability card** ("{n} Maschinen jetzt frei" + "Buchen" button).
  - **Maschinen** section: title + "{free} von {total} frei"; filter chips (Alle / Waschen /
    Trocknen); machine list (list or 2-col grid per Tweak).
  - **Promo card:** dark gradient, gift icon, "Deine 5. Ladung gratis", progress bar (3/5).
- **MachineCard** (`app/components.jsx`): porthole glyph OR live progress **Ring** (in-use, shows
  remaining minutes); name; meta "{cap} · CHF x.xx / Gang"; right column with **StatusPill** and, for
  free machines, "Buchen →". Statuses: Frei (green), Läuft (accent + spinning ring), Fertig (amber,
  pulsing dot), Reserviert (muted, shows time).

### 3. Buchen — 4-step booking flow — `app/screens-reserve.jsx`
Sticky header (back + title "Buchen" + step subtitle) and a 4-dot **StepBar**
["Maschine","Zeit","Programm","Zahlung"]. Sticky bottom CTA ("Weiter"; final step
"CHF x.xx bezahlen & buchen").
- **Step 0 — Maschine:** 2-col grid of selectable MachineCards (porthole/ring, name, type · cap,
  price, status; selected = accent ring + check).
- **Step 1 — Zeit:** horizontal day strip (HEUTE + Mo–So, dd, JUN), then 3-col time-slot grid
  (taken slots struck through/disabled).
- **Step 2 — Programm & Extras:** single-select **program** list (Eco 30°C/35min/inkl.,
  Standard 40°C/45min/+CHF0.50, Intensiv 60°C/60min/+CHF1.50) and multi-select **extras**
  (Waschmittel +CHF1.50, Weichspüler +CHF1.00, Express-Schleudern +CHF0.80). Program changes
  duration & price; extras add to the total.
- **Step 3 — Zahlung:** Übersicht card (machine, program · min, Datum, Uhrzeit start–end computed from
  program duration); **Zahlungsart** radio list (Karte •••• 4242, Apple Pay, N's Guthaben CHF 32.00,
  Vor Ort bezahlen); Gutscheincode field; price breakdown (Waschgang · program, each selected extra,
  **Gesamt**).
- **Confirmation:** centered check (pulsing halo), "Buchung bestätigt!", reminder line, summary card
  with "QR-Code an der Maschine vorzeigen", "Fertig" button.

### 4. Profil — `app/screens-profile.jsx`
- Title "Profil"; identity card (avatar, name, "Mitglied" pill, email).
- **Wallet** card (dark gradient): "N's Guthaben" CHF 32.00, "Aufladen" / "Verlauf" buttons.
- Stats row: Ladungen / Monat (3), Gratis-Ladung (1, accent), Gespart (CHF 9.00).
- Settings list: Meine Buchungen, Zahlungsarten, Benachrichtigungen, Hilfe & Support.
- "Abmelden" ghost button (red); footer "N's LAVANDERIA · Teil der N's HOTEL Familie · Version 1.0".

## Interactions & Behavior
- Tab bar (Start / Buchen / Profil) on Home & Profil; "Buchen" launches the flow.
- Tapping a **free** machine on Home opens the flow pre-seeded at step 1 (Zeit) for that machine.
- **Live countdown:** running machines store an `endsAt` timestamp; a 1s ticker (`useTick`) re-renders
  so the Ring/remaining minutes count down. See `remainingMins(m)` in `app/theme.jsx`.
- Buttons scale to 0.975 on press; selection states animate border/shadow ~150ms.
- Status dot pulses for "Fertig"; ring spins for "Läuft".
- Entrance fade on scroll content is gated so static export/screenshots still show content
  (animations must never leave content stuck at opacity:0 — base state is visible).
- Auth + current screen persist to `localStorage` (`ns_authed`, `ns_screen`).

## State Management
- Tweaks: `direction` (Hell/Dunkel), `layout` (Liste/Raster), `density` (Komfortabel/Kompakt),
  `radius` (12–26px). Resolved into a theme token object by `resolveTheme()`.
- Booking flow local state: `step`, `machine`, `day`, `slot`, `program`, `extras{}`, `pay`, `promo`.
- Derived: `prog`, `extrasTotal`, `total = machine.price + program.add + extrasTotal`.
- App-level: `authed`, `screen` (home|reserve|profile|confirm), `flowMachine`, `booking`.

## Design Tokens (see `app/theme.jsx` → `THEMES`, `resolveTheme`)
- **Accent:** `#01b1e2` (Hell) / `#19c1ef` (Dunkel). **Primary ink:** `#2a3350`.
- **Status colors:** green `#1d9d63`/`#43d29a`, amber `#d98a16`/`#f3b54e`, accent, muted.
- **Radius:** card `radius` token (default 20), small = radius−8, button = small+4, pill = 999.
- **Spacing:** card padding 18 (15 dense), section gaps 18–22, list gaps 10–14.
- **Type scale:** 11–12 labels (uppercase, +letter-spacing), 13–15 body, 16–19 titles, 24–28 headlines.
- **Shadows:** soft `0 2px 12px rgba(42,51,80,.06)`; raised `0 10px 30px rgba(42,51,80,.10)`;
  dark mode uses heavier black shadows + 14px backdrop-blur on cards.
- **Money:** Swiss francs, `CHF x.xx` (always 2 decimals) — `money()` in `app/theme.jsx`.

## Assets
- **Fonts:** `/fonts/Gotham-{Light,Book,Medium,Bold,Black}.otf`, `/fonts/CaflischScriptPro-Regular.otf`.
- **Logo system:** `logo-builder.js` + `brand-render.js` (depend on `opentype.js`). Expose
  `window.NsBrand.svgMarkup(variant, scheme)`. Recommended: pre-render needed variants to static SVG.
- **Icons:** inline SVG line set in `app/theme.jsx` (`Icon`) — replace with the codebase's icon lib.
- **Device frame** (`ios-frame.jsx`) and **Tweaks panel** (`tweaks-panel.jsx`) are prototype scaffolds,
  not part of the product — drop them when implementing natively.

## Files
- `N's Lavandería App.html` — entry; loads fonts, brand logo system, React, and the app modules.
- `app/theme.jsx` — tokens, two themes, brand `Logo`, `Icon`, `Porthole`, machine data, `money`,
  `useTick`, `remainingMins`.
- `app/components.jsx` — Button, Card, StatusPill, Ring, Field, Chip, StepBar, ScreenHead, TabBar,
  MachineCard, etc.
- `app/screens-auth.jsx`, `app/screens-home.jsx`, `app/screens-reserve.jsx`, `app/screens-profile.jsx`.
- `app/app.jsx` — routing/state machine, device stage scaling, Tweaks wiring.
- `logo-builder.js`, `brand-render.js` — runtime vector logo (brand handoff reference).
