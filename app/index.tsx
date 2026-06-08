import { View, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  H1,
  H2,
  Body,
  Eyebrow,
  Button,
  Card,
  Badge,
  colors,
  spacing,
} from '@/components';

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.container}>
        {/* Header / Hero Section */}
        <View style={styles.hero}>
          <Eyebrow>Bienvenido</Eyebrow>
          <H1>N's Lavandería</H1>
          <Body>Reserva máquinas de lavado y secado con facilidad</Body>
        </View>

        {/* Quick Stats / Features */}
        <View style={styles.section}>
          <H2>Características</H2>
          <Card>
            <Eyebrow>Reservas en tiempo real</Eyebrow>
            <H3>Disponibilidad actual</H3>
            <Body>
              Mira qué máquinas están disponibles ahora mismo y reserva tu
              espacio.
            </Body>
          </Card>
        </View>

        {/* Payment Methods */}
        <View style={styles.section}>
          <H2>Métodos de Pago</H2>
          <View style={styles.badgeGroup}>
            <Badge label="TWINT" />
            <Badge label="Apple Pay" />
            <Badge label="Google Pay" />
            <Badge label="Tarjeta" variant="accent" />
          </View>
        </View>

        {/* CTA */}
        <View style={styles.section}>
          <Button onPress={() => console.log('Reserve now')}>
            Reservar Ahora
          </Button>
        </View>

        {/* Coming Soon Section */}
        <Card variant="solid" style={styles.comingSoon}>
          <Eyebrow>En desarrollo</Eyebrow>
          <H3>Próximamente en ambas tiendas</H3>
          <Body style={styles.comingSoonText}>
            Esta aplicación está en desarrollo. Los detalles de integración con
            máquinas, pagos TWINT y acceso SALTO KS se completarán pronto.
          </Body>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  scrollView: {
    flex: 1,
  },
  container: {
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.xl,
    gap: spacing.xl,
  },
  hero: {
    marginBottom: spacing.xl,
  },
  section: {
    gap: spacing.md,
  },
  badgeGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  comingSoon: {
    marginBottom: spacing.xl,
  },
  comingSoonText: {
    marginTop: spacing.md,
  },
});
