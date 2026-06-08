---
description: Stage y commit con mensaje Conventional Commits. Uso: /git:cm
---

Crea un commit limpio con mensaje en formato Conventional Commits.

## 1. Revisar cambios
```bash
git status --short
git diff --stat
```

## 2. Verificar que no hay secrets
Para cada archivo modificado, abre el diff y confirma:
- No hay passwords, tokens ni API keys hardcodeados
- No hay archivos `.env` con valores reales
- No hay archivos de configuración sensibles

## 3. Stage selectivo
Añade los archivos intencionalmente uno a uno:
```bash
git add <archivo1> <archivo2> ...
```
**Nunca usar `git add .` sin revisar primero.**

## 4. Generar mensaje Conventional Commits
Formato: `<tipo>(<scope>): <descripción breve en inglés>`

Tipos válidos: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`

Reglas:
- Subject ≤ 72 caracteres
- Scope en kebab-case
- Si hay breaking change: añadir `BREAKING CHANGE:` en el body

## 5. Commit
```bash
git commit -m "$(cat <<'EOF'
<tipo>(<scope>): <descripción>

<body opcional: qué y por qué>

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
EOF
)"
```

## 6. Confirmar
```bash
git log -1 --stat
```
Muestra el hash del commit y el resumen de archivos modificados.

**No hacer push aquí.** Usar `/git:push` cuando esté listo para publicar.
