// Cliente Supabase compartido para Edge Functions (Deno)
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

/** Cliente con service_role (bypass RLS). USAR SOLO en server. */
export function getServiceClient(): SupabaseClient {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}

/** Cliente que respeta el JWT del usuario (RLS aplica). */
export function getUserClient(authHeader: string): SupabaseClient {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } } }
  );
}

/** Verifica el JWT del request y devuelve el user. */
export async function getAuthUser(req: Request) {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) throw new Response("Missing Authorization", { status: 401 });
  const supabase = getUserClient(authHeader);
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) throw new Response("Unauthorized", { status: 401 });
  return { user: data.user, supabase };
}
