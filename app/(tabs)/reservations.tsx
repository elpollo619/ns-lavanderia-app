import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing } from '@/types/design';

export default function ReservationsScreen() {
  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.container}>
        <Text style={styles.title}>Meine Reservierungen</Text>
        <Text style={styles.placeholder}>Noch keine Reservierungen</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bgCanvas },
  container: { flex: 1, padding: spacing.base, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', color: colors.text, marginBottom: spacing.lg },
  placeholder: { fontSize: 16, color: colors.textSecondary },
});
