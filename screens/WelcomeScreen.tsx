import { AuthBackground } from '@/components/auth/AuthScaffold';
import { LanguageToggleBar } from '@/components/i18n/LanguageToggle';
import { Button } from '@/components/ui/Button';
import { Colors } from '@/constants/Colors';
import { useT } from '@/i18n/useT';
import { router } from 'expo-router';
import { Droplets, Shield, Star } from 'lucide-react-native';
import { Image, Pressable, Text, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

const textShadow = {
  textShadowColor: 'rgba(15, 23, 42, 0.35)',
  textShadowOffset: { width: 0, height: 1 },
  textShadowRadius: 8,
} as const;

export default function WelcomeScreen() {
  const t = useT();

  const FEATURES = [
    { icon: <Droplets size={20} color={Colors.white} strokeWidth={1.5} />, text: t('auth.featureBooking') },
    { icon: <Star size={20} color={Colors.white} strokeWidth={1.5} />,     text: t('auth.featureLoyalty') },
    { icon: <Shield size={20} color={Colors.white} strokeWidth={1.5} />,   text: t('auth.featureTracking') },
  ];

  return (
    <AuthBackground>
      <SafeAreaView style={{ flex: 1 }}>
        <LanguageToggleBar />
        <View style={{ flex: 1, padding: 28, paddingTop: 0, justifyContent: 'flex-end', gap: 36 }}>
          <Animated.View entering={FadeInDown.springify()}>
            <View style={{
              width: 96, height: 96, borderRadius: 28,
              alignItems: 'center', justifyContent: 'center',
              marginBottom: 24,
              overflow: 'hidden',
              borderWidth: 1,
              borderColor: 'rgba(255, 255, 255, 0.4)',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.3,
              shadowRadius: 16,
              elevation: 10,
            }}>
              <Image
                source={require('@/assets/icon/logo-wave.jpg')}
                style={{ width: '100%', height: '100%' }}
                resizeMode="cover"
              />
            </View>
            <Text style={{ fontSize: 44, fontWeight: '900', color: Colors.white, letterSpacing: -1, ...textShadow }}>WAVE</Text>

            <View style={{ marginTop: 28, gap: 14 }}>
              {FEATURES.map((f, i) => (
                <Animated.View
                  key={f.text}
                  entering={FadeInDown.delay(100 + i * 80).springify()}
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}
                >
                  <View style={{
                    width: 42, height: 42, borderRadius: 12,
                    alignItems: 'center', justifyContent: 'center',
                    backgroundColor: 'rgba(255, 255, 255, 0.18)',
                    borderWidth: 1,
                    borderColor: 'rgba(255, 255, 255, 0.28)',
                  }}>
                    {f.icon}
                  </View>
                  <Text style={{ fontSize: 14, color: Colors.white, fontWeight: '600', flex: 1, ...textShadow }}>{f.text}</Text>
                </Animated.View>
              ))}
            </View>
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(300).springify()} style={{ gap: 18 }}>
            <Button title={t('auth.start')} variant="secondary" onPress={() => router.push('/(auth)/register')} />
            <Pressable onPress={() => router.push('/(auth)/login')} hitSlop={8} style={{ alignItems: 'center' }}>
              <Text style={{ fontSize: 14, color: Colors.white, fontWeight: '700', ...textShadow }}>
                {t('auth.haveAccount')}
              </Text>
            </Pressable>
          </Animated.View>
        </View>
      </SafeAreaView>
    </AuthBackground>
  );
}
