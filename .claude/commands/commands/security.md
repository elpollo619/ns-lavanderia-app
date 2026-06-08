---
allowed-tools: Read, Edit, Bash, Grep, Glob
argument-hint: [componente/función a auditar]
description: Auditoría de seguridad — OWASP, RLS, secrets, webhooks, compliance
---

# /security — Auditoría de Seguridad

Audita código en busca de vulnerabilidades: OWASP Top 10, RLS, secrets expuestos, webhooks, GDPR/nLPD.

## Ejemplo de invocación

```
/security audita RLS en tabla reservations (usuarios solo ven sus datos)
/security verifica que webhook de Stripe valida firma
/security busca secrets expuestos en .env y código
/security GDPR: cómo implementar derecho al olvido
```

## Vulnerabilidades a Auditar

### OWASP Top 10
- Inyección SQL: usar Supabase client (prepared statements)
- XSS: sanitizar input en JSX
- Exposición de secretos: EXPO_PUBLIC_* vs backend
- CSRF: Supabase RLS + JWT previenen
- Broken auth: Supabase Auth maneja refresh
- Sensitive data: nunca guardar números tarjeta
- Broken access: auditar RLS + auth.uid()

### RLS
- Activar en todas las tablas
- SELECT: usuarios ven solo sus datos
- INSERT/UPDATE: usuarios solo crean/editan propios
- Admin: acceso completo

### Secrets
```bash
grep -r "STRIPE_SECRET" .
grep -r "SALTO_CLIENT_SECRET" .
```

### Webhooks Stripe
- Validar firma: stripe.webhooks.constructEvent()
- Rate limiting
- Audit log

### GDPR / nLPD
- Consentimiento explícito
- Política de privacidad
- Derecho al olvido
- Retención máxima 7 años

---

Genera **Security Audit Report** con vulnerabilidades por severidad.
