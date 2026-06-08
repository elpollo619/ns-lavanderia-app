---
description: Reparación sistemática de un feature o módulo en 5 fases. Uso: /fix <ruta-del-feature>
---

Repara sistemáticamente el feature/módulo en `$ARGUMENTS` usando el protocolo de 5 fases.

Si `$ARGUMENTS` está vacío, pregunta qué feature reparar.

Ejecuta TODAS las fases EN ORDEN:

## Fase 1: SCOPE — Delimitar el perímetro
- Lista todos los archivos del feature (entry points, archivos internos, tests)
- Identifica qué hace cada archivo
- Define los límites exactos del módulo

## Fase 2: TRACE — Mapear dependencias
- Dependencias entrantes: ¿quién llama a este feature?
- Dependencias salientes: ¿qué llama este feature?
- Marca dependencias críticas con 🔴 y opcionales con 🟡

## Fase 3: DIAGNOSE — Diagnóstico completo
- Revisa código, tests, logs y configuración
- Asigna etiquetas de riesgo: HIGH / MED / LOW
- Confirma causas raíz con evidencia concreta
- **Regla de hierro: no pasar a Fase 4 hasta completar el diagnóstico**

## Fase 4: FIX — Reparar en orden
- Orden: dependencias → tipos → lógica → tests → integración
- Un fix a la vez, testear después de cada uno
- Si un fix genera 3 nuevos problemas: escalar y pedir instrucciones

## Fase 5: VERIFY — Verificar y resumir
- Ejecutar todos los tests del feature + tests de consumidores
- Resumir: archivos modificados, causa raíz encontrada, fix aplicado
