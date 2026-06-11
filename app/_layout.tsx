import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { BookingProvider } from '@/design/BookingContext';
import { PaymentProvider } from '@/design/PaymentProvider';
import { ThemeProvider, useTheme } from '@/design/theme';

// Bypass de auth SOLO para previews de desarrollo (capturas/QA visual).
// Se activa con EXPO_PUBLIC_DEV_PREVIEW=1 al arrancar el dev server; nunca en builds.
const DEV_PREVIEW = process.env.EXPO_PUBLIC_DEV_PREVIEW === '1';

function RootLayoutNav() {
  const { user, loading } = useAuth();
  const { theme } = useTheme();
  const router = useRouter();
  const segments = useSegments();

  const authed = !!user || DEV_PREVIEW;
  const inAuthGroup = segments[0] === '(auth)';

  // Patrón canónico de expo-router: redirigir según sesión
  // (declarar Screens condicionalmente rompe el Stack).
  useEffect(() => {
    if (loading) return;
    if (!authed && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (authed && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [authed, inAuthGroup, loading]);

  if (loading) {
    return <View style={{ flex: 1, backgroundColor: theme.bg }} />;
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <StatusBar style={theme.name === 'dunkel' ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: theme.bg },
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="(auth)/login" options={{ animation: 'none' }} />
        <Stack.Screen name="(auth)/signup" options={{ animation: 'none' }} />
      </Stack>
    </View>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    'Gotham-Light': require('../assets/fonts/Gotham-Light.otf'),
    'Gotham-Book': require('../assets/fonts/Gotham-Book.otf'),
    'Gotham-Medium': require('../assets/fonts/Gotham-Medium.otf'),
    'Gotham-Bold': require('../assets/fonts/Gotham-Bold.otf'),
    CaflischScript: require('../assets/fonts/CaflischScriptPro-Regular.otf'),
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <ThemeProvider>
      <AuthProvider>
        <BookingProvider>
          <PaymentProvider>
            <RootLayoutNav />
          </PaymentProvider>
        </BookingProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
