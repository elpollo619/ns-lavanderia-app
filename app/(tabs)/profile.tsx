import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/Button';
import { useAuth } from '@/contexts/AuthContext';
import { colors, spacing } from '@/types/design';

export default function ProfileScreen() {
  const { user, signOut } = useAuth();

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.container}>
        <Text style={styles.title}>Profil</Text>
        {user && (
          <>
            <Text style={styles.email}>{user.email}</Text>
            <Button variant="primary" onPress={signOut} style={styles.button}>
              Abmelden
            </Button>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bgCanvas },
  container: { flex: 1, padding: spacing.base, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', color: colors.text, marginBottom: spacing.lg },
  email: { fontSize: 16, color: colors.textSecondary, marginBottom: spacing.xl },
  button: { width: 200 },
});
