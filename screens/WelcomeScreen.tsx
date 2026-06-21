import { LanguageToggleBar } from '@/components/i18n/LanguageToggle';
import { Button } from '@/components/ui/Button';
import { Colors } from '@/constants/Colors';
import { useT } from '@/i18n/useT';
import { router } from 'expo-router';
import { Droplets, Shield, Star } from 'lucide-react-native';
import { Text, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function WelcomeScreen() {
  const t = useT();

  const FEATURES = [
    { icon: <Droplets size={20} color={Colors.primary} strokeWidth={1.5} />, text: t('auth.featureBooking') },
    { icon: <Star size={20} color={Colors.primary} strokeWidth={1.5} />,     text: t('auth.featureLoyalty') },
    { icon: <Shield size={20} color={Colors.primary} strokeWidth={1.5} />,   text: t('auth.featureTracking') },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }}>
      <LanguageToggleBar />
      <View style={{ flex: 1, padding: 28, paddingTop: 0, justifyContent: 'space-between' }}>
        <Animated.View entering={FadeInDown.springify()} style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <View style={{
            width: 120, height: 120, borderRadius: 36,
            backgroundColor: Colors.primary,
            alignItems: 'center', justifyContent: 'center',
            marginBottom: 28,
            shadowColor: Colors.primary,
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.35,
            shadowRadius: 16,
            elevation: 10,
          }}>
            <Text style={{ fontSize: 56 }}>🚗</Text>
          </View>
          <Text style={{ fontSize: 36, fontWeight: '900', color: Colors.textPrimary, letterSpacing: -1 }}>WAVE</Text>
          <Text style={{ fontSize: 15, color: Colors.textSecondary, marginTop: 8, textAlign: 'center' }}>
            {t('auth.welcomeTagline')}
          </Text>

          <View style={{ marginTop: 44, gap: 16, width: '100%' }}>
            {FEATURES.map((f, i) => (
              <Animated.View
                key={f.text}
                entering={FadeInDown.delay(100 + i * 80).springify()}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}
              >
                <View style={{ width: 42, height: 42, borderRadius: 12, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center' }}>
                  {f.icon}
                </View>
                <Text style={{ fontSize: 14, color: Colors.textPrimary, fontWeight: '500', flex: 1 }}>{f.text}</Text>
              </Animated.View>
            ))}
          </View>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(300).springify()} style={{ gap: 12 }}>
          <Button title={t('auth.start')} onPress={() => router.push('/(auth)/register')} />
          <Button title={t('auth.haveAccount')} variant="secondary" onPress={() => router.push('/(auth)/login')} />
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}
