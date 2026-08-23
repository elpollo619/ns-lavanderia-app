# Correos a partners — borradores listos para enviar

**Creado:** 23 agosto 2026
**Instrucciones:** copia el bloque, pégalo en tu cliente de correo, revisa los `[campos]`
entre corchetes y envía. Ambos están en alemán (ortografía suiza: `ss`, no `ß`).

> **Por qué estos dos primero:** son los que tienen semanas de latencia por respuesta.
> Todo lo demás (Stripe, Seam, Supabase) depende solo de ti y se hace en minutos.

---

## 1 · WeWash — `sales@we-wash.com`

**Objetivo:** conseguir una integración B2B tipo *Allthings*, para que la reserva y el
pago vivan dentro de nuestra app en vez de mandar al cliente a la app de WeWash.
**Ángulo clave:** ya somos cliente con hardware instalado — no somos un lead frío.

**Asunto:** `Anfrage B2B-Integration (analog Allthings) — bestehender Standort mit WeWash Boxes`

```
Sehr geehrte Damen und Herren

Wir betreiben unter der Marke N's Lavandería einen öffentlichen Waschsalon in
der Schweiz. Unser erster Standort ist bereits mit WeWash-Hardware ausgestattet:

  - Hub "Mobile Communication Box" W4HD11YE
  - Clients Easy230 (u. a. W4CD13CF "T2") mit Leistungs-Gating 400V / 3x16A
    pro Maschine
  - LTE-Antenne JARFT
  - Scan2Wash aktiv (qr_id 6X3U1)

Aktuell entwickeln wir eine eigene Buchungs- und Bezahl-App (Reservation per
Kalender, TWINT/Karte via Stripe, Zutritt via SALTO). Die Anwendung ist
technisch fertiggestellt; offen ist einzig die Ansteuerung der Maschinen.

Uns ist bekannt, dass WeWash keine öffentliche API anbietet, jedoch selektiv
B2B-Integrationen umsetzt — beispielsweise die Anbindung an Allthings. Genau
eine solche Zusammenarbeit möchten wir mit Ihnen prüfen.

Konkret unsere Fragen:

  1. Besteht die Möglichkeit einer B2B-Schnittstelle, über die wir Verfügbarkeit
     und Maschinenstart aus unserer eigenen App heraus steuern können —
     vergleichbar mit der Allthings-Integration?
  2. Falls ja: welche kommerziellen und technischen Voraussetzungen sind dafür
     nötig (Mindestanzahl Standorte/Maschinen, Vertragsmodell, Zertifizierung)?
  3. Wie sieht der Zeitrahmen für ein solches Onboarding üblicherweise aus?

Wir planen die Expansion auf weitere Standorte in der Schweiz, weshalb uns an
einer langfristig tragfähigen Lösung gelegen ist.

Für ein kurzes Gespräch stehe ich Ihnen gerne zur Verfügung.

Freundliche Grüsse

Cristian Amaya
N's Lavandería
cristian-amaya@hotmail.com
[Telefonnummer]
```

**Si la respuesta es NO:** plan B ya evaluado y viable — sustituir las cajas Easy230
por Shelly Pro/contactor (~CHF 100–150 por máquina). El cableado de gating ya existe.
**No hacer ingeniería inversa de su API privada.**

---

## 2 · Schulthess washMaster — `info@schulthess.com`

**Objetivo:** la pregunta decisiva del proyecto — ¿la reserva puede vivir DENTRO de
nuestra app, o washMaster solo permite un deep-link a la suya?
**Umbral de decisión:** si dicen "dentro de tu app" → usamos washMaster.
Si dicen "solo deep-link" → sistema IoT propio, para no depender de su UI.

**Asunto:** `washMaster — Integration von Reservation und Start in eine eigene App`

```
Sehr geehrte Damen und Herren

Wir bauen unter der Marke N's Lavandería einen öffentlichen Waschsalon in der
Schweiz auf und entwickeln dafür eine eigene mobile App: Reservation per
Kalender, Bezahlung mit TWINT und Karte, Zutritt zu Räumen und Maschinen per
digitalem Schlüssel.

Ihrer Kommunikation entnehmen wir, dass sich washMaster in Systeme von
Drittanbietern integrieren lässt. Bevor wir uns auf eine Lösung festlegen,
möchten wir den genauen Umfang dieser Integration verstehen.

Unsere Fragen:

  1. Können Reservation und Maschinenstart vollständig innerhalb unserer
     eigenen App abgebildet werden (über eine API), oder ist ausschliesslich
     eine Weiterleitung per Deep-Link in die washMaster-App möglich?
  2. Falls eine API besteht: erhalten wir eine technische Dokumentation und
     Zugang zu einer Test-/Sandbox-Umgebung?
  3. Welche Daten lassen sich abrufen bzw. steuern — Maschinenstatus,
     Verfügbarkeit, Programmwahl, Start/Stopp, Zyklusende?
  4. Ist washMaster auf Maschinen anderer Hersteller einsetzbar, oder
     ausschliesslich auf Schulthess-Geräten?
  5. Wie ist das kommerzielle Modell ausgestaltet (Lizenz, Gebühr pro Zyklus,
     Einmalkosten)?

Für die weitere Planung ist insbesondere Frage 1 entscheidend, da wir das
Buchungserlebnis bewusst in unserer eigenen Anwendung halten möchten.

Gerne stehe ich für ein Telefonat oder eine technische Abklärung zur Verfügung.

Freundliche Grüsse

Cristian Amaya
N's Lavandería
cristian-amaya@hotmail.com
[Telefonnummer]
```

---

## Seguimiento

| Destinatario | Enviado | Respuesta | Decisión |
|---|---|---|---|
| sales@we-wash.com | ☐ | | integración B2B / plan B Shelly |
| info@schulthess.com | ☐ | | washMaster / IoT propio |

Si no hay respuesta en **10 días hábiles**, insistir una vez. WeWash es BSH/Bosch
(estructura grande, respuesta lenta); Schulthess es suizo y más pequeño, suele
responder antes.
