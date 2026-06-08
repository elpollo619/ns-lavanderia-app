import { Tabs } from 'expo-router';
import { colors } from '@/types/design';

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: colors.accent }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Startseite',
          tabBarLabel: 'Startseite',
        }}
      />
      <Tabs.Screen
        name="reservations"
        options={{
          title: 'Reservierungen',
          tabBarLabel: 'Reservierungen',
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          tabBarLabel: 'Profil',
        }}
      />
    </Tabs>
  );
}
