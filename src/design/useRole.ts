/**
 * Rol del usuario (users.role) — para el Admin-Bereich.
 *   user       → cliente normal
 *   admin      → admin global (todas las ubicaciones)
 *   superadmin → dueño (además puede crear Standorte y asignar admins)
 * Los admins por Standort viven en standort_admins (no en users.role).
 */
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

export type Role = 'user' | 'admin' | 'superadmin';

interface RoleInfo {
  role: Role;
  isAdmin: boolean;       // admin global o superadmin
  isSuperadmin: boolean;
  isStandortAdmin: boolean; // gestor de al menos un Standort
}

const NONE: RoleInfo = { role: 'user', isAdmin: false, isSuperadmin: false, isStandortAdmin: false };

export function useRole(): RoleInfo {
  const { user } = useAuth();
  const [info, setInfo] = useState<RoleInfo>(NONE);

  useEffect(() => {
    if (!user) {
      setInfo(NONE);
      return;
    }
    let cancelled = false;
    Promise.all([
      supabase.from('users').select('role').eq('id', user.id).maybeSingle(),
      supabase.from('standort_admins').select('standort_id').eq('user_id', user.id).limit(1),
    ]).then(([{ data: u }, { data: sa }]) => {
      if (cancelled) return;
      const role = (u?.role ?? 'user') as Role;
      setInfo({
        role,
        isAdmin: role === 'admin' || role === 'superadmin',
        isSuperadmin: role === 'superadmin',
        isStandortAdmin: (sa?.length ?? 0) > 0,
      });
    });
    return () => {
      cancelled = true;
    };
  }, [user]);

  return info;
}

/** Compat: true si puede entrar al Admin-Bereich (global o por Standort). */
export function useIsAdmin(): boolean {
  const { isAdmin, isStandortAdmin } = useRole();
  return isAdmin || isStandortAdmin;
}
