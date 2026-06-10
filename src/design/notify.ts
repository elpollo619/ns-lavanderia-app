/**
 * Recordatorio local "15 Minuten vorher" (handoff: línea de la Bestätigung).
 * Notificación local programada — funciona en Expo Go; en web no hay soporte,
 * así que se omite silenciosamente.
 */
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export async function scheduleReminder(machineName: string, start: Date): Promise<void> {
  if (Platform.OS === 'web') return;

  const fireAt = new Date(start.getTime() - 15 * 60000);
  if (fireAt.getTime() <= Date.now()) return; // reserva demasiado próxima

  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== 'granted') return;

  const hh = String(start.getHours()).padStart(2, '0');
  const mm = String(start.getMinutes()).padStart(2, '0');

  await Notifications.scheduleNotificationAsync({
    content: {
      title: "N's LAVANDERIA",
      body: `Erinnerung: ${machineName} ist um ${hh}:${mm} Uhr für dich reserviert.`,
    },
    trigger: { date: fireAt },
  });
}
