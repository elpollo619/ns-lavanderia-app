import { useState } from 'react';
import { View, ScrollView, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link } from 'expo-router';
import { Button } from '@/components/Button';
import { useAuth } from '@/contexts/AuthContext';
import { colors, spacing, typography } from '@/types/design';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { signIn } = useAuth();

  const handleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      await signIn(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.root}>
      <ScrollView>
        <View style={styles.container}>
          <Text style={styles.title}>Anmelden</Text>
          <Text style={styles.subtitle}>Melden Sie sich an, um Maschinen zu reservieren</Text>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>E-Mail</Text>
              <View style={styles.input}>
                <Text style={styles.inputPlaceholder}>{email || 'beispiel@email.com'}</Text>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Passwort</Text>
              <View style={styles.input}>
                <Text style={styles.inputPlaceholder}>{password ? '•••••••' : 'Passwort'}</Text>
              </View>
            </View>

            {error && <Text style={styles.error}>{error}</Text>}

            <Button
              variant="primary"
              onPress={handleLogin}
              disabled={loading}
              style={styles.button}
            >
              {loading ? 'Wird angemeldet...' : 'Anmelden'}
            </Button>

            <View style={styles.signupLink}>
              <Text style={styles.signupText}>Noch kein Konto? </Text>
              <Link href="/(auth)/signup" asChild>
                <Text style={styles.signupLinkText}>Registrieren</Text>
              </Link>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bgCanvas },
  container: { padding: spacing.base, paddingTop: spacing['2xl'] },
  title: { fontSize: 32, fontWeight: 'bold', color: colors.text, marginBottom: spacing.sm },
  subtitle: { fontSize: 16, color: colors.textSecondary, marginBottom: spacing['2xl'] },
  form: { gap: spacing.lg },
  inputGroup: { gap: spacing.sm },
  label: { fontSize: 14, fontWeight: '600', color: colors.text },
  input: { borderWidth: 1, borderColor: colors.primaryVerySubtle, borderRadius: 8, padding: spacing.base, backgroundColor: colors.white },
  inputPlaceholder: { fontSize: 16, color: colors.textSecondary },
  error: { fontSize: 14, color: '#dc2626', marginTop: spacing.sm },
  button: { marginTop: spacing.lg },
  signupLink: { flexDirection: 'row', justifyContent: 'center', marginTop: spacing.xl },
  signupText: { fontSize: 14, color: colors.text },
  signupLinkText: { fontSize: 14, color: colors.accent, fontWeight: '600' },
});
