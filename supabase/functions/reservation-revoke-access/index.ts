// Edge Function: reservation-revoke-access
// Revoca la credencial provisionada por reservation-grant-access
// (al cancelar una reserva). Con Seam: eliminar el ACS user de la reserva.
//
// Request:  POST { reservation_id } — JWT del dueño o service_role
// Response: { status: 'revoked'|'noop' } | { error }

import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';
import { corsHeaders } from '../_shared/cors.ts';

const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { reservation_id } = await req.json();
    if (!reservation_id) return json({ error: 'reservation_id requerido' }, 400);

    const authHeader = req.headers.get('Authorization') ?? '';
    const isService = authHeader.includes(Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    if (!isService) {
      const supabaseUser = createClient(
        Deno.env.get('SUPABASE_URL')!,
        Deno.env.get('SUPABASE_ANON_KEY')!,
        { global: { headers: { Authorization: authHeader } } }
      );
      const { data } = await supabaseUser.auth.getUser();
      if (!data.user) return json({ error: 'No autenticado' }, 401);
      const { data: r } = await supabaseAdmin
        .from('reservations')
        .select('user_id')
        .eq('id', reservation_id)
        .single();
      if (!r || r.user_id !== data.user.id) return json({ error: 'No autorizado' }, 403);
    }

    const { data: grant } = await supabaseAdmin
      .from('access_grants')
      .select('id, provider, acs_user_id, status')
      .eq('reservation_id', reservation_id)
      .maybeSingle();

    if (!grant || grant.status !== 'granted') {
      return json({ status: 'noop' });
    }

    if (grant.provider === 'seam' && grant.acs_user_id) {
      const res = await fetch('https://connect.getseam.com/acs/users/delete', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${Deno.env.get('SEAM_API_KEY')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ acs_user_id: grant.acs_user_id }),
      });
      if (!res.ok) {
        const body = await res.text();
        console.error('Seam acs/users/delete:', res.status, body.slice(0, 300));
        return json({ error: 'Revocación en proveedor falló' }, 502);
      }
    }
    // TODO[SALTO]: revocación vía Connect API cuando esté implementado el grant

    await supabaseAdmin
      .from('access_grants')
      .update({ status: 'revoked', revoked_at: new Date().toISOString() })
      .eq('id', grant.id);

    return json({ status: 'revoked' });
  } catch (err) {
    console.error('reservation-revoke-access:', err);
    return json({ error: 'Error interno' }, 500);
  }
});

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
