// Edge Function: reservation-grant-access
// Modelo LikeMagic: al confirmar una reserva, provisiona la credencial de
// acceso con ventana de validez (inicio−15 min → fin+15 min). El cliente
// abre por BLE con la app Salto KS — sin waiver de remote opening.
//
// Proveedor según env:
//   - Seam:  SEAM_API_KEY + SEAM_ACS_SYSTEM_ID + SEAM_ACCESS_GROUP_ID
//            (crea ACS user con access_schedule y lo añade al access group;
//             si la máquina tiene machines.access_group_id, también a ese)
//   - SALTO: SALTO_CLIENT_ID/SECRET/SITE_ID (TODO: endpoints exactos al
//            tener acceso a la spec del Connect API)
//   - Ninguno configurado → status 'skipped' (pipeline lista, sin efecto)
//
// Request:  POST { reservation_id }  — JWT del dueño o service_role
// Response: { status: 'granted'|'skipped', grant_id? } | { error }

import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';
import { corsHeaders } from '../_shared/cors.ts';

const MARGIN_MS = 15 * 60_000;
const SEAM_BASE = 'https://connect.getseam.com';

const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

function seamConfigured(): boolean {
  return !!(Deno.env.get('SEAM_API_KEY') && Deno.env.get('SEAM_ACS_SYSTEM_ID') && Deno.env.get('SEAM_ACCESS_GROUP_ID'));
}
function saltoConfigured(): boolean {
  return !!(Deno.env.get('SALTO_CLIENT_ID') && Deno.env.get('SALTO_CLIENT_SECRET') && Deno.env.get('SALTO_SITE_ID'));
}

async function seamFetch(path: string, body: unknown): Promise<{ ok: boolean; json: unknown }> {
  const res = await fetch(`${SEAM_BASE}${path}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${Deno.env.get('SEAM_API_KEY')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  return { ok: res.ok, json: await res.json().catch(() => ({})) };
}

interface GrantResult {
  acsUserId: string | null;
  accessGroupId: string | null;
  response: unknown;
}

/** Seam: ACS user por reserva con access_schedule (auto-expira) + access group. */
async function grantViaSeam(opts: {
  email: string;
  fullName: string;
  startsAt: string;
  endsAt: string;
  machineAccessGroupId: string | null;
}): Promise<GrantResult> {
  const acsSystemId = Deno.env.get('SEAM_ACS_SYSTEM_ID')!;
  const defaultGroup = Deno.env.get('SEAM_ACCESS_GROUP_ID')!;

  const created = await seamFetch('/acs/users/create', {
    acs_system_id: acsSystemId,
    full_name: opts.fullName,
    email_address: opts.email,
    access_schedule: { starts_at: opts.startsAt, ends_at: opts.endsAt },
  });
  if (!created.ok) {
    throw new Error(`Seam acs/users/create: ${JSON.stringify(created.json).slice(0, 300)}`);
  }
  const acsUserId = (created.json as { acs_user?: { acs_user_id?: string } }).acs_user?.acs_user_id ?? null;
  if (!acsUserId) throw new Error('Seam no devolvió acs_user_id');

  const groups = [defaultGroup, opts.machineAccessGroupId].filter(Boolean) as string[];
  for (const groupId of groups) {
    const added = await seamFetch('/acs/users/add_to_access_group', {
      acs_user_id: acsUserId,
      acs_access_group_id: groupId,
    });
    if (!added.ok) {
      throw new Error(`Seam add_to_access_group(${groupId}): ${JSON.stringify(added.json).slice(0, 300)}`);
    }
  }

  return { acsUserId, accessGroupId: groups.join(','), response: created.json };
}

/** SALTO Connect API directo — pendiente de la spec (requiere credenciales del BU). */
function grantViaSalto(): GrantResult {
  // TODO[SALTO]: POST /users (o invitación por email) + asignación a access group
  // con ventana de validez, según la spec del Connect API. Implementar al tener
  // Client ID/Secret del Business Unit (ver docs/INTEGRACIONES.md).
  throw new Error('SALTO directo aún no implementado — usar Seam o completar TODO[SALTO]');
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { reservation_id } = await req.json();
    if (!reservation_id) return json({ error: 'reservation_id requerido' }, 400);

    // Autorización: dueño de la reserva (JWT) o service_role (webhook)
    const authHeader = req.headers.get('Authorization') ?? '';
    const isService = authHeader.includes(Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    let callerId: string | null = null;
    if (!isService) {
      const supabaseUser = createClient(
        Deno.env.get('SUPABASE_URL')!,
        Deno.env.get('SUPABASE_ANON_KEY')!,
        { global: { headers: { Authorization: authHeader } } }
      );
      const { data } = await supabaseUser.auth.getUser();
      if (!data.user) return json({ error: 'No autenticado' }, 401);
      callerId = data.user.id;
    }

    // Reserva + máquina + usuario
    const { data: r, error: rErr } = await supabaseAdmin
      .from('reservations')
      .select('id, user_id, machine_id, start_time, end_time, status, machines(access_group_id), users(email, full_name)')
      .eq('id', reservation_id)
      .single();
    if (rErr || !r) return json({ error: 'Reserva no encontrada' }, 404);
    if (callerId && r.user_id !== callerId) return json({ error: 'No autorizado' }, 403);
    if (!['confirmed', 'active'].includes(r.status)) {
      return json({ error: `Reserva en estado ${r.status}, no se provisiona acceso` }, 409);
    }

    // Idempotencia: si ya hay grant activo, devolverlo
    const { data: existing } = await supabaseAdmin
      .from('access_grants')
      .select('id, status')
      .eq('reservation_id', reservation_id)
      .maybeSingle();
    if (existing?.status === 'granted') {
      return json({ status: 'granted', grant_id: existing.id, already: true });
    }

    const startsAt = new Date(new Date(r.start_time).getTime() - MARGIN_MS).toISOString();
    const endsAt = new Date(new Date(r.end_time).getTime() + MARGIN_MS).toISOString();

    const provider = seamConfigured() ? 'seam' : saltoConfigured() ? 'salto' : null;
    if (!provider) {
      // Pipeline lista pero sin proveedor: registrar 'skipped' para visibilidad
      await supabaseAdmin.from('access_grants').upsert(
        {
          reservation_id,
          user_id: r.user_id,
          provider: 'seam',
          starts_at: startsAt,
          ends_at: endsAt,
          status: 'skipped',
          provider_response: { reason: 'no provider configured' },
        },
        { onConflict: 'reservation_id' }
      );
      return json({ status: 'skipped', reason: 'Proveedor de acceso no configurado' });
    }

    const userRow = r.users as unknown as { email: string; full_name: string | null } | null;
    const machineRow = r.machines as unknown as { access_group_id: string | null } | null;

    try {
      const result =
        provider === 'seam'
          ? await grantViaSeam({
              email: userRow?.email ?? '',
              fullName: userRow?.full_name ?? userRow?.email ?? 'Gast',
              startsAt,
              endsAt,
              machineAccessGroupId: machineRow?.access_group_id ?? null,
            })
          : grantViaSalto();

      const { data: grant } = await supabaseAdmin
        .from('access_grants')
        .upsert(
          {
            reservation_id,
            user_id: r.user_id,
            provider,
            acs_user_id: result.acsUserId,
            access_group_id: result.accessGroupId,
            starts_at: startsAt,
            ends_at: endsAt,
            status: 'granted',
            provider_response: result.response ?? null,
            revoked_at: null,
          },
          { onConflict: 'reservation_id' }
        )
        .select('id')
        .single();

      return json({ status: 'granted', grant_id: grant?.id });
    } catch (provErr) {
      await supabaseAdmin.from('access_grants').upsert(
        {
          reservation_id,
          user_id: r.user_id,
          provider,
          starts_at: startsAt,
          ends_at: endsAt,
          status: 'failed',
          provider_response: { error: String(provErr).slice(0, 800) },
        },
        { onConflict: 'reservation_id' }
      );
      console.error('grant-access provider error:', provErr);
      return json({ error: 'Provisioning de acceso falló' }, 502);
    }
  } catch (err) {
    console.error('reservation-grant-access:', err);
    return json({ error: 'Error interno' }, 500);
  }
});

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
