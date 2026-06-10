/**
 * Auth — Login / Registrierung (handoff: app/screens-auth.jsx).
 * Hero: tile 64px + logo stacked 168×116 + eyebrow + headline 28 Bold.
 * Campos 54px · "oder weiter mit" · Apple + Google · toggle al pie.
 */
import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { DButton, Field, Press, Txt } from './components';
import { IconApple, IconEye, IconEyeOff, IconGoogle } from './icons';
import { LogoStacked, LogoTile } from './Logo';
import { FONTS, TYPE, useTheme } from './theme';

export function AuthView({ mode }: { mode: 'login' | 'signup' }) {
  const { theme } = useTheme();
  const router = useRouter();
  const { signIn, signUp } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const isLogin = mode === 'login';

  const submit = async () => {
    setError('');
    setBusy(true);
    try {
      if (isLogin) {
        await signIn(email.trim(), password);
      } else {
        await signUp(email.trim(), password);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Etwas ist schiefgelaufen.');
    } finally {
      setBusy(false);
    }
  };

  const social = () => Alert.alert("N's LAVANDERIA", 'Demnächst verfügbar.');

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={{ padding: 24, paddingTop: 28, gap: 24 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Hero */}
          <View style={{ alignItems: 'center', gap: 18 }}>
            <View style={{ borderRadius: 16, overflow: 'hidden' }}>
              <LogoTile width={64} height={64} />
            </View>
            <LogoStacked
              width={168}
              height={116}
              color={theme.name === 'dunkel' ? '#ffffff' : theme.ink}
            />
            <Text
              style={{
                fontFamily: FONTS.medium,
                fontSize: TYPE.label2,
                letterSpacing: 2,
                color: theme.accent,
              }}
            >
              SB-WASCHSALON · 24 H
            </Text>
            <Text
              style={{
                fontFamily: FONTS.bold,
                fontSize: 28,
                lineHeight: 36,
                color: theme.ink,
                textAlign: 'center',
              }}
            >
              {isLogin ? 'Deine Wäsche,\nbereit wann du willst.' : "Konto erstellen bei\nN's LAVANDERIA."}
            </Text>
          </View>

          {/* Formular */}
          <View style={{ gap: 14 }}>
            {!isLogin && (
              <Field
                label="Name"
                value={name}
                onChangeText={setName}
                placeholder="Vor- und Nachname"
                autoCapitalize="words"
              />
            )}
            <Field
              label="E-Mail"
              value={email}
              onChangeText={setEmail}
              placeholder="name@beispiel.ch"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
            <Field
              label="Passwort"
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              secureTextEntry={!showPw}
              right={
                <Press onPress={() => setShowPw((v) => !v)}>
                  <View style={{ minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' }}>
                    {showPw ? (
                      <IconEyeOff size={20} color={theme.muted} />
                    ) : (
                      <IconEye size={20} color={theme.muted} />
                    )}
                  </View>
                </Press>
              }
            />

            {isLogin && (
              <Press onPress={() => Alert.alert("N's LAVANDERIA", 'Demnächst verfügbar.')}>
                <Text
                  style={{
                    fontFamily: FONTS.medium,
                    fontSize: TYPE.body,
                    color: theme.accent,
                    alignSelf: 'flex-end',
                  }}
                >
                  Passwort vergessen?
                </Text>
              </Press>
            )}

            {!!error && (
              <Txt size={TYPE.body} color={theme.danger}>
                {error}
              </Txt>
            )}

            <DButton onPress={submit} disabled={busy || !email || !password}>
              {busy ? 'Bitte warten …' : isLogin ? 'Anmelden' : 'Konto erstellen'}
            </DButton>
          </View>

          {/* Divider */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={{ flex: 1, height: 1, backgroundColor: theme.line }} />
            <Txt size={TYPE.label2} color={theme.muted}>
              oder weiter mit
            </Txt>
            <View style={{ flex: 1, height: 1, backgroundColor: theme.line }} />
          </View>

          {/* Social */}
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <Press onPress={social} style={{ flex: 1 }}>
              <View
                style={{
                  minHeight: 54,
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: theme.line,
                  backgroundColor: theme.surface,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                }}
              >
                <IconApple size={20} color={theme.ink} />
                <Text style={{ fontFamily: FONTS.medium, fontSize: TYPE.body2, color: theme.ink }}>
                  Apple
                </Text>
              </View>
            </Press>
            <Press onPress={social} style={{ flex: 1 }}>
              <View
                style={{
                  minHeight: 54,
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: theme.line,
                  backgroundColor: theme.surface,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                }}
              >
                <IconGoogle size={20} color={theme.ink} />
                <Text style={{ fontFamily: FONTS.medium, fontSize: TYPE.body2, color: theme.ink }}>
                  Google
                </Text>
              </View>
            </Press>
          </View>

          {/* Footer toggle */}
          <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 6, paddingBottom: 12 }}>
            <Txt size={TYPE.body} color={theme.inkSoft}>
              {isLogin ? 'Noch kein Konto?' : 'Bereits ein Konto?'}
            </Txt>
            <Press
              onPress={() => router.replace(isLogin ? '/(auth)/signup' : '/(auth)/login')}
            >
              <Text style={{ fontFamily: FONTS.bold, fontSize: TYPE.body, color: theme.accent }}>
                {isLogin ? 'Registrieren' : 'Anmelden'}
              </Text>
            </Press>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
