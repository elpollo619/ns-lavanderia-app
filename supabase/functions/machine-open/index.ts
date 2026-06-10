// Edge Function: machine-open
// Abre la puerta/máquina del usuario si tiene una reserva activa.
//
// Proveedores soportados (según machines.lock_provider):
//   - 'seam'  -> Seam API (abstrae SALTO KS): POST /locks/unlock_door
//   - 'salto' -> SALTO KS Connect API directo (OAuth client credentials)
//
// ENV (supabase secrets set):
//   SEAM_API_KEY            (si se usa Seam)
//   SALTO_CLIENT_ID         (si se usa SALTO directo)
//   SALTO_CLIENT_SECRET
//   SALTO_SITE_ID           (id del site/Business Unit en SALTO KS)
//   SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY / SUPABASE_ANON_KEY (automáticas)
//
// Request:  POST { machine_id: string }   (JWT de usuario requerido)
// Response: { ok: true } | { error: string }

import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';
import { corsHeaders } from '../_shared/cors.ts';

const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

// ---------------------------------------------------------------------------
// Proveedores
// ---------------------------------------------------------------------------

async function unlockViaSeam(deviceId: string): Promise<Response> {
  // https://docs.seam.co/latest/api/locks/unlock_door
  // Nota: SALTO KS deshabilita el remote unlock por defecto; requiere
  // waiver/pass-through configurado por Seam en los IQ hubs.
  return await fetch('https://connect.getseam.com/locks/unlock_door', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${Deno.env.get('SEAM_API_KEY')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ device_id: deviceId }),
  });
}

async function unlockViaSalto(lockId: string): Promise<Response> {
  // SALTO KS Connect API (developer.saltosystems.com/ks/connect-api)
  // 1) Token OAuth (client credentials, integración backend no-interactiva)
  const tokenRes = await fetch('https://identity.saltoks.com/connect/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: Deno.env.get('SALTO_CLIENT_ID')!,
      client_secret: Deno.env.get('SALTO_CLIENT_SECRET')!,
      scope: 'user_api.full_access',
    }),
  });
  if (!tokenRes.ok) {
    throw new Error(`SALTO token: ${tokenRes.status} ${await tokenRes.text()}`);
  }
  const { access_token } = await tokenRes.json();

  // 2) Remote opening del lock
  // TODO[SALTO]: confirmar el path exacto contra la spec OpenAPI del Connect API
  // una vez tengamos Client ID/Secret del Business Unit (requiere acceso a
  // developer.saltosystems.com/ks/connect-api/reference/). El patrón documentado:
  // POST /v1.1/sites/{siteId}/locks/{lockId}/locking  body {"locked": false}
  const siteId = Deno.env.get('SALTO_SITE_ID')!;
  return await fetch(
    `https://clp-accept-user.my-clay.com/v1.1/sites/${siteId}/locks/${lockId}/locking`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ locked: false }),
    }
  );
}

// ---------------------------------------------------------------------------

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Usuario autenticado (verify_jwt=true garantiza JWT válido; lo resolvemos)
    const authHeader = req.headers.get('Authorization')!;
    const supabaseUser = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );
    const {
      data: { user },
    } = await supabaseUser.auth.getUser();
    if (!user) {
      return json({ error: 'No autenticado' }, 401);
    }

    const { machine_id } = await req.json();
    if (!machine_id) {
      return json({ error: 'machine_id requerido' }, 400);
    }

    // Máquina + lock configurado
    const { data: machine, error: mErr } = await supabaseAdmin
      .from('machines')
      .select('id, name, lock_provider, lock_device_id')
      .eq('id', machine_id)
      .single();
    if (mErr || !machine) return json({ error: 'Máquina no encontrada' }, 404);
    if (!machine.lock_provider || !machine.lock_device_id) {
      return json({ error: 'Máquina sin control de acceso configurado' }, 409);
    }

    // Reserva activa del usuario que cubra el momento actual (con margen 10 min)
    const now = new Date();
    const margin = 10 * 60000;
    const { data: reservation } = await supabaseAdmin
      .from('reservations')
      .select('id, start_time, end_time, status')
      .eq('user_id', user.id)
      .eq('machine_id', machine_id)
      .in('status', ['confirmed', 'active'])
      .lte('start_time', new Date(now.getTime() + margin).toISOString())
      .gte('end_time', new Date(now.getTime() - margin).toISOString())
      .maybeSingle();
    if (!reservation) {
      return json({ error: 'Sin reserva activa para esta máquina' }, 403);
    }

    // Unlock según proveedor
    const res =
      machine.lock_provider === 'seam'
        ? await unlockViaSeam(machine.lock_device_id)
        : await unlockViaSalto(machine.lock_device_id);
    const providerBody = await res.text();

    // Auditoría
    await supabaseAdmin.from('access_logs').insert({
      user_id: user.id,
      machine_id,
      action: 'unlock',
      salto_response: JSON.stringify({
        provider: machine.lock_provider,
        status: res.status,
        body: providerBody.slice(0, 1000),
      }),
    });

    if (!res.ok) {
      return json({ error: `Proveedor respondió ${res.status}` }, 502);
    }
    return json({ ok: true });
  } catch (err) {
    console.error('machine-open:', err);
    return json({ error: 'Error interno' }, 500);
  }
});

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
