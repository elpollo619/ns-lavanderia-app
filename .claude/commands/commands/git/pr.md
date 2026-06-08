---
description: Crea un Pull Request con gh CLI. Uso: /git:pr [base-branch]
---

Crea un Pull Request usando `gh pr create`. Base branch por defecto: `main` (o el especificado en `$ARGUMENTS`).

## 1. Estado previo
```bash
git status --short
git log --oneline origin/main..HEAD
```
Verifica que no hay cambios sin commitear y que hay commits nuevos respecto a la base.

## 2. Determinar base branch
- Si `$ARGUMENTS` tiene un valor, usar ese como base.
- Si no, usar `main`.

## 3. Push de la rama actual (si falta)
```bash
git push -u origin $(git branch --show-current)
```

## 4. Analizar commits para el PR
```bash
git log origin/main..HEAD --pretty=format:"%s" 
git diff origin/main..HEAD --stat
```
Usa estos datos para redactar título y descripción.

## 5. Generar título y body del PR
- **Título**: Conventional Commits style, ≤ 72 chars, en inglés
- **Body**: incluye secciones Summary, Changes, Test Plan

```bash
gh pr create \
  --base <base-branch> \
  --title "<tipo>(<scope>): <descripción>" \
  --body "$(cat <<'EOF'
## Summary
<!-- Qué hace este PR y por qué -->

## Changes
<!-- Lista los cambios principales -->
- 

## Test Plan
- [ ] TypeScript compila sin errores
- [ ] ESLint sin warnings críticos
- [ ] Funcionalidad probada manualmente

🤖 Generated with [Claude Code](https://claude.ai/claude-code)
EOF
)"
```

## 6. Confirmar
```bash
gh pr view --web
```
Abre el PR en el browser para revisión final.

**Labels y reviewers opcionales:**
```bash
gh pr edit --add-label "feature" --add-reviewer <username>
```
Solo añadir si el usuario los especifica.
