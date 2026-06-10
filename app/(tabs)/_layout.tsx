import React from 'react';
import { Tabs } from 'expo-router';
import { Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Press } from '@/design/components';
import { IconHome, IconPlusCircle, IconUser } from '@/design/icons';
import { FONTS, useTheme } from '@/design/theme';

const TAB_META: Record<string, { label: string; Icon: typeof IconHome }> = {
  index: { label: 'Start', Icon: IconHome },
  buchen: { label: 'Buchen', Icon: IconPlusCircle },
  profile: { label: 'Profil', Icon: IconUser },
};

function DesignTabBar({ state, navigation }: BottomTabBarProps) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <View
      style={{
        flexDirection: 'row',
        backgroundColor: theme.tabBg,
        borderTopWidth: 1,
        borderTopColor: theme.line,
        paddingBottom: Math.max(insets.bottom, 10),
        paddingTop: 10,
        paddingHorizontal: 16,
      }}
    >
      {state.routes.map((route, i) => {
        const meta = TAB_META[route.name];
        if (!meta) return null;
        const active = state.index === i;
        const color = active ? theme.accent : theme.muted;
        return (
          <Press
            key={route.key}
            onPress={() => navigation.navigate(route.name)}
            style={{ flex: 1 }}
          >
            <View style={{ alignItems: 'center', gap: 4, minHeight: 44, justifyContent: 'center' }}>
              <meta.Icon size={23} color={color} />
              <Text style={{ fontFamily: active ? FONTS.bold : FONTS.medium, fontSize: 11, color }}>
                {meta.label}
              </Text>
            </View>
          </Press>
        );
      })}
    </View>
  );
}

export default function TabsLayout() {
  const { theme } = useTheme();
  return (
    <Tabs
      tabBar={(props) => <DesignTabBar {...props} />}
      screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: theme.bg } } as object}
    >
      <Tabs.Screen name="index" options={{ title: 'Start' }} />
      <Tabs.Screen name="buchen" options={{ title: 'Buchen' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profil' }} />
    </Tabs>
  );
}
