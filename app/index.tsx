import { View, ScrollView, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/Button';
import { FeatureCardDual } from '@/components/FeatureCardDual';
import { colors, spacing, typography, borderRadius } from '@/types/design';

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.root}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* HERO */}
        <View style={styles.hero}>
          <Text style={styles.eyebrow}>WÄSCHEREI · SELBSTBEDIENUNG</Text>
          <Text style={styles.title}>Waschen.{'\n'}Trocknen.{'\n'}<Text style={styles.titleAccent}>Schlafen Sie gut.</Text></Text>
          <Text style={styles.subtitle}>Hauseigene Wäscherei, rund um die Uhr verfügbar. Reservieren Sie vom Smartphone aus. Holen Sie Ihre saubere Wäsche ab, wenn sie fertig ist.</Text>
          <View style={styles.heroButtons}>
            <Button variant="primary" onPress={() => {}}>Maschine reservieren</Button>
            <Button variant="white" onPress={() => {}}>So funktioniert's</Button>
          </View>
        </View>

        {/* WAS SIE MITBRINGEN */}
        <View style={styles.section}>
          <Text style={styles.sectionEyebrow}>WAS SIE MITBRINGEN</Text>
          <Text style={styles.sectionTitle}>Zwei Dinge. Mehr nicht.</Text>
          <Text style={styles.sectionDesc}>Alles andere ist im Haus: Maschinen, Trockner, Wasser und Waschmittel.</Text>
          <View style={styles.cardGrid}>
            <FeatureCardDual
              icon="👕"
              number="01"
              title="Ihre Wäsche"
              description="In einem Beutel oder Korb — wie es Ihnen lieber ist."
            />
            <FeatureCardDual
              icon="🔑"
              number="02"
              title="Ihr Zugang"
              description="Salto KS App oder Zugangs karte — vorab bei uns angefordert."
            />
            <FeatureCardDual
              icon="📱"
              number="03"
              title="Ihr Smartphone"
              description="Für die Reservierung über WeWash und Zahlungsabwicklung."
            />
          </View>
        </View>

        {/* SO FUNKTIONIERT'S */}
        <View style={styles.section}>
          <Text style={styles.sectionEyebrow}>SO FUNKTIONIERT'S</Text>
          <Text style={styles.sectionTitle}>Vier Schritte. Rund um die Uhr.</Text>
          <Text style={styles.sectionDesc}>Vom ersten Kontakt zur sauberen Wäsche — alles in Ihrem Tempo.</Text>
          <View style={styles.cardGrid}>
            <FeatureCardDual
              icon="💬"
              number="01"
              title="Zugang erhalten"
              description="Schreiben Sie uns per WhatsApp oder E-Mail — wir registrieren Sie in Salto KS oder geben Ihnen eine Zugangs karte."
            />
            <FeatureCardDual
              icon="👕"
              number="02"
              title="Wäsche bringen"
              description="Kommen Sie einfach mit Ihrer Wäsche vorbei — Waschmittel ist in der Maschine integriert (i-DOS)."
            />
            <FeatureCardDual
              icon="🔑"
              number="03"
              title="Tür öffnen"
              description="Öffnen Sie die Laundry-Tür mit der Salto KS App oder der Karte. 24 Stunden verfügbar."
            />
            <FeatureCardDual
              icon="📦"
              number="04"
              title="Reservieren & waschen"
              description="Scannen Sie den QR-Code im Raum, wählen Sie eine Maschine und zahlen Sie sicher mit Karte, Apple Pay oder PayPal."
            />
          </View>
        </View>

        {/* MACHINES */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Verfügbare Maschinen</Text>
          <Text style={styles.machinesMeta}>3 / 4 Maschinen · Aktuell verfügbar</Text>
          <MachineCard name="Waschmaschine 01" status="VERFÜGBAR" available />
          <MachineCard name="Trockner 02" status="BESETZT" />
          <MachineCard name="Waschmaschine 03" status="VERFÜGBAR" available />
          <MachineCard name="Trockner 04" status="VERFÜGBAR" available />
          <Button variant="primary" onPress={() => {}} style={styles.bottomButton}>Slot reservieren</Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function MachineCard({ name, status, available }: any) {
  return (
    <View style={styles.machineCard}>
      <View style={styles.machineContent}>
        <Text style={styles.machineName}>{name}</Text>
        <Text style={[styles.machineStatus, available && styles.machineAvailable]}>
          {available ? 'Verfügbar jetzt' : 'In Bearbeitung • 32 min'}
        </Text>
      </View>
      <View style={[styles.badge, available ? styles.badgeAvailable : styles.badgeBusy]}>
        <Text style={styles.badgeText}>{status}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bgCanvas },

  // HERO
  hero: { padding: spacing.base, paddingTop: spacing.xl, paddingBottom: spacing['2xl'] },
  eyebrow: { fontSize: 11, fontWeight: '800', color: colors.accent, letterSpacing: 1, textTransform: 'uppercase', marginBottom: spacing.md },
  title: { fontSize: 44, fontWeight: '800', color: colors.text, lineHeight: 50, marginBottom: spacing.lg },
  titleAccent: { fontStyle: 'italic', fontWeight: '400' },
  subtitle: { fontSize: 15, color: colors.textSecondary, lineHeight: 25, marginBottom: spacing.xl },
  heroButtons: { gap: spacing.sm },

  // SECTIONS
  section: { padding: spacing.base, paddingVertical: spacing['2xl'], borderTopWidth: 1, borderTopColor: colors.line },
  sectionEyebrow: { fontSize: 11, fontWeight: '800', color: colors.accent, letterSpacing: 1, textTransform: 'uppercase', marginBottom: spacing.sm },
  sectionTitle: { fontSize: 32, fontWeight: '800', color: colors.text, marginBottom: spacing.sm },
  sectionDesc: { fontSize: 15, color: colors.textSecondary, lineHeight: 25, marginBottom: spacing.xl },

  // CARDS GRID
  cardGrid: { gap: spacing.base },

  // MACHINES
  machinesMeta: { fontSize: 13, fontWeight: '600', color: colors.accent, marginBottom: spacing.lg },
  machineCard: { backgroundColor: colors.white, borderRadius: borderRadius.lg, padding: spacing.base, marginBottom: spacing.sm, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', elevation: 1 },
  machineContent: { flex: 1 },
  machineName: { fontSize: 15, fontWeight: '700', color: colors.text, marginBottom: spacing.xs },
  machineStatus: { fontSize: 13, color: colors.muted },
  machineAvailable: { color: colors.accent, fontWeight: '600' },
  badge: { paddingHorizontal: spacing.base, paddingVertical: spacing.xs, borderRadius: borderRadius.pill, backgroundColor: colors.accent },
  badgeAvailable: { backgroundColor: colors.accent },
  badgeBusy: { backgroundColor: colors.primaryLight },
  badgeText: { fontSize: 11, fontWeight: '800', color: colors.white, textTransform: 'uppercase', letterSpacing: 0.5 },

  bottomButton: { marginTop: spacing.xl, marginBottom: spacing.xl },
});
