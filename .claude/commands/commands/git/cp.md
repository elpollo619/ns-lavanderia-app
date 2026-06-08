---
description: Review → commit Conventional Commits → push. Uso: /git:cp
---

Ejecuta el flujo completo: revisión de calidad → commit → push.

## 1. Revisión previa (obligatoria)
Ejecuta `/review` internamente antes de proceder:
- Verifica que no hay secrets hardcodeados
- Comprueba que TypeScript compila sin errores
- Revisa lint sin warnings críticos

Si la revisión falla con problemas **críticos**, detente y repórtalos. No continuar hasta que estén resueltos.

## 2. Ver cambios pendientes
```bash
git status --short
git diff --stat
```

## 3. Stage selectivo
Añade los archivos intencionalmente (nunca `git add .` ciego):
```bash
git add <archivo1> <archivo2> ...
```
Excluye archivos `.env`, `*.log`, `dist/`, `node_modules/`.

## 4. Commit Conventional Commits
Formato: `<tipo>(<scope>): <descripción en inglés>`

Tipos: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`

```bash
git commit -m "$(cat <<'EOF'
<tipo>(<scope>): <descripción>

<body opcional>

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
EOF
)"
```

## 5. Push
```bash
git push
```

Si la rama no tiene upstream configurado:
```bash
git push -u origin $(git branch --show-current)
```

## 6. Verificar resultado
```bash
git log -1 --stat
git status
```

Muestra el hash del commit, los archivos modificados y confirma que el working tree está limpio.

**No forzar push (`--force`) salvo instrucción explícita del usuario.**
