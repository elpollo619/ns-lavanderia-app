---
allowed-tools: Read, Write, Edit, Bash, Grep, Glob
argument-hint: [función/endpoint a crear]
description: Scaffold de Supabase Edge Function
---

# /api — Scaffold Supabase Edge Function

Crea una Edge Function (Node.js en Supabase) con estructura completa: tipos TS, validación, error handling, logs.

## Ejemplo de invocación

```
/api crear endpoint POST /payment/create-intent para crear PaymentIntent en Stripe
/api obtener máquinas disponibles por rango de horario (GET /machines/available)
/api Edge Function para abrir máquina vía SALTO Connect API (POST /machine/open/:id)
/api webhook de Stripe (POST /payment/webhook) — validar firma, procesar events
```

## Estructura que genera

```typescript
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

interface RequestBody {
  // tipos aquí
}

interface ResponseBody {
  success: boolean
  data?: unknown
  error?: string
}

serve(async (req: Request): Promise<Response> => {
  // CORS (si es necesario)
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: { 'Access-Control-Allow-Origin': '*' },
    })
  }

  try {
    const { user } = await supabase.auth.getUser()
    if (!user) {
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const body = (await req.json()) as RequestBody

    // Validación de input
    if (!body.field) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing field' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Lógica principal aquí

    const response: ResponseBody = {
      success: true,
      data: { /* resultado */ },
    }

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error(error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})
```

## Incluye

- [x] Tipos TypeScript strict
- [x] Autenticación JWT (usuario + Supabase)
- [x] Validación de input (no null, tipos correctos)
- [x] Error handling + status codes
- [x] Logging a console (para debugging en Supabase dashboard)
- [x] CORS si es necesario
- [x] Comentarios explicativos

## Deploy

```bash
supabase functions deploy payment/create-intent
```

## Testing

```bash
curl -X POST http://localhost:54321/functions/v1/payment/create-intent \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"reservation_id":"xxx"}'
```
