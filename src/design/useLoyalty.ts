/**
 * Fidelidad y estadísticas del usuario (Profil + promo del Home).
 * v1 de solo lectura: se deriva de las reservas — cada 5 cargas completadas,
 * una gratis (la redención llegará con el wallet/backend de Guthaben).
 * Sin sesión o sin datos usa los valores demo del prototipo.
 */
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

export interface LoyaltyStats {
  monthLoads: number;     // Ladungen / Monat
  progress: number;       // hacia la 5.ª carga gratis (0–4)
  earnedFree: number;     // Gratis-Ladungen ganadas
  savedChf: number;       // Gespart (CHF)
  live: boolean;          // true si viene de datos reales
}

const DEMO: LoyaltyStats = { monthLoads: 3, progress: 3, earnedFree: 1, savedChf: 9, live: false };

const FREE_EVERY = 5;
const AVG_LOAD_CHF = 4.5;

export function useLoyalty(): LoyaltyStats {
  const { user } = useAuth();
  const [stats, setStats] = useState<LoyaltyStats>(DEMO);

  useEffect(() => {
    if (!user) {
      setStats(DEMO);
      return;
    }
    let cancelled = false;

    (async () => {
      const monthStart = new Date();
      monthStart.setDate(1);
      monthStart.setHours(0, 0, 0, 0);

      const [{ count: monthCount }, { count: completedAll }] = await Promise.all([
        supabase
          .from('reservations')
          .select('id', { count: 'exact', head: true })
          .in('status', ['confirmed', 'active', 'completed'])
          .gte('start_time', monthStart.toISOString()),
        supabase
          .from('reservations')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'completed'),
      ]);

      if (cancelled) return;
      const total = completedAll ?? 0;
      const earned = Math.floor(total / FREE_EVERY);
      setStats({
        monthLoads: monthCount ?? 0,
        progress: total % FREE_EVERY,
        earnedFree: earned,
        savedChf: earned * AVG_LOAD_CHF,
        live: true,
      });
    })();

    return () => {
      cancelled = true;
    };
  }, [user]);

  return stats;
}
