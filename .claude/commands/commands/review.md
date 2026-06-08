---
description: Revisión completa del código antes de hacer push — calidad, seguridad y consistencia.
---

Realiza una revisión completa del código en el estado actual del repositorio.

## 1. Estado del working tree
```bash
git status --short
git diff --stat
```
Verifica que no haya cambios no intencionados ni archivos sensibles staged.

## 2. Revisión de código
Para cada archivo modificado:
- Lee el diff completo (`git diff -- <archivo>`)
- Verifica: lógica correcta, no hay secrets/credenciales, no hay código muerto
- Comprueba consistencia con el resto del codebase (naming, patrones, imports)

## 3. TypeScript / tipos (si aplica)
```bash
cd frontend && npx tsc --noEmit 2>&1 | head -30
```

## 4. Lint
```bash
cd frontend && npx eslint src --ext .ts,.tsx --max-warnings 0 2>&1 | tail -20
```

## 5. Tests (si existen)
```bash
npm test -- --passWithNoTests 2>&1 | tail -20
```

## 6. Seguridad básica
- Busca patrones peligrosos: `grep -r "password\|secret\|api_key\|token" --include="*.ts" --include="*.tsx" . | grep -v ".env" | grep -v "node_modules" | grep -v ".git"`
- Verifica que ningún secret esté hardcodeado

## 7. Resumen final
Presenta una tabla:

| Área | Estado | Notas |
|------|--------|-------|
| Cambios staged | ✅/⚠️ | ... |
| TypeScript | ✅/⚠️ | ... |
| Lint | ✅/⚠️ | ... |
| Seguridad | ✅/⚠️ | ... |

Si hay problemas, corrígelos antes de dar el OK para push.
