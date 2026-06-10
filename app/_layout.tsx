import { Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { BookingProvider } from '@/design/BookingContext';
import { ThemeProvider, useTheme } from '@/design/theme';

// Bypass de auth SOLO para previews de desarrollo (capturas/QA visual).
// Se activa con EXPO_PUBLIC_DEV_PREVIEW=1 al arrancar el dev server; nunca en builds.
const DEV_PREVIEW = process.env.EXPO_PUBLIC_DEV_PREVIEW === '1';

function RootLayoutNav() {
  const { user, loading } = useAuth();
  const { theme } = useTheme();

  if (loading) {
    return <View style={{ flex: 1, backgroundColor: theme.bg }} />;
  }

  const authed = !!user || DEV_PREVIEW;

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <StatusBar style={theme.name === 'dunkel' ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: theme.bg },
        }}
      >
        {authed ? (
          <Stack.Screen name="(tabs)" />
        ) : (
          <>
            <Stack.Screen name="(auth)/login" options={{ animation: 'none' }} />
            <Stack.Screen name="(auth)/signup" options={{ animation: 'none' }} />
          </>
        )}
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
          <RootLayoutNav />
        </BookingProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
