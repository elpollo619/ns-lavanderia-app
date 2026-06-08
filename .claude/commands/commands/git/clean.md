---
description: Elimina ramas mergeadas localmente y en remoto. Uso: /git:clean
---

Limpia ramas mergeadas, tanto locales como remotas, manteniendo las ramas principales.

## 1. Ver estado actual
```bash
git branch -a
git remote prune origin --dry-run
```

## 2. Identificar ramas mergeadas localmente
```bash
git branch --merged main | grep -vE "^\*|main|dev|develop|master|gh-pages"
```
Muestra las ramas locales ya mergeadas en `main`. **No borrar las que aparecen con `*`, ni las ramas principales.**

## 3. Eliminar ramas locales mergeadas
Si la lista del paso anterior tiene ramas para borrar:
```bash
git branch --merged main | grep -vE "^\*|main|dev|develop|master|gh-pages" | xargs -r git branch -d
```

## 4. Ver ramas remotas mergeadas
```bash
git branch -r --merged main | grep -vE "origin/(main|dev|develop|master|gh-pages|HEAD)"
```

## 5. Confirmar antes de borrar en remoto
**Presenta la lista al usuario y pide confirmación explícita antes de continuar.**

Si el usuario confirma:
```bash
git branch -r --merged main \
  | grep -vE "origin/(main|dev|develop|master|gh-pages|HEAD)" \
  | sed 's/origin\///' \
  | xargs -r -I{} git push origin --delete {}
```

## 6. Sincronizar referencias remotas
```bash
git remote prune origin
git fetch --prune
```

## 7. Resumen
```bash
git branch -a
```
Muestra el estado final de ramas locales y remotas.

**Reglas de seguridad:**
- Nunca borrar `main`, `master`, `dev`, `develop`, `gh-pages`
- Siempre confirmar antes de borrar en remoto
- Nunca usar `-D` (force delete) sin instrucción explícita del usuario
