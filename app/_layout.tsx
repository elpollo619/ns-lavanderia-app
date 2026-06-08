import { Stack } from 'expo-router';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';

function RootLayoutNav() {
  const { user, loading } = useAuth();

  if (loading) {
    return null;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animationEnabled: true,
      }}
    >
      {user ? (
        <Stack.Group>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack.Group>
      ) : (
        <Stack.Group screenOptions={{ animationEnabled: false }}>
          <Stack.Screen name="(auth)/login" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)/signup" options={{ headerShown: false }} />
        </Stack.Group>
      )}
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}
