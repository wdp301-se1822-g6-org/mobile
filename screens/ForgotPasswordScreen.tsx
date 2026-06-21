import { LanguageToggleBar } from '@/components/i18n/LanguageToggle';
import { Button } from '@/components/ui/Button';
import { Colors } from '@/constants/Colors';
import { useT } from '@/i18n/useT';
import { useSendOtp, useVerifyOtp } from '@/hooks/auth/useAuth';
import { router } from 'expo-router';
import { ArrowLeft, KeyRound, Mail } from 'lucide-react-native';
import { useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, Text, TextInput, View } from 'react-native';
import Animated, { FadeInDown, SlideInRight } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

type Step = 'email' | 'otp';

export default function ForgotPasswordScreen() {
  const t = useT();
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const otpRef = useRef<TextInput>(null);

  const { mutateAsync: sendOtp, isPending: sending } = useSendOtp();
  const { mutateAsync: verifyOtp, isPending: verifying } = useVerifyOtp();

  const handleSendOtp = async () => {
    if (!email.trim()) return;
    try {
      await sendOtp({ email });
      Toast.show({ type: 'success', text1: t('auth.otpSentOk'), text2: t('auth.otpSentSub') });
      setStep('otp');
      setTimeout(() => otpRef.current?.focus(), 300);
    } catch {
      Toast.show({ type: 'error', text1: t('auth.otpSendErr'), text2: t('auth.otpSendErrSub') });
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length < 6) return;
    try {
      await verifyOtp({ email, code: otp });
      Toast.show({ type: 'success', text1: t('auth.otpVerifiedOk') });
      router.replace('/(auth)/login');
    } catch {
      Toast.show({ type: 'error', text1: t('auth.otpVerifyErr') });
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }}>
      <LanguageToggleBar />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={{ padding: 24, flex: 1 }}>
          <Pressable onPress={() => step === 'otp' ? setStep('email') : router.back()} style={{ padding: 4, alignSelf: 'flex-start', marginBottom: 28 }}>
            <ArrowLeft size={22} color={Colors.textPrimary} strokeWidth={1.5} />
          </Pressable>

          {step === 'email' && (
            <Animated.View entering={SlideInRight.springify()} style={{ flex: 1 }}>
              <View style={{ width: 56, height: 56, borderRadius: 16, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                <Mail size={26} color={Colors.primary} strokeWidth={1.5} />
              </View>
              <Text style={{ fontSize: 24, fontWeight: '800', color: Colors.textPrimary }}>{t('auth.forgotTitle')}</Text>
              <Text style={{ fontSize: 14, color: Colors.textSecondary, marginTop: 8, lineHeight: 20 }}>
                {t('auth.forgotSubtitle')}
              </Text>

              <Animated.View entering={FadeInDown.delay(100).springify()} style={{ marginTop: 32 }}>
                <Text style={{ fontSize: 13, fontWeight: '600', color: Colors.textSecondary, marginBottom: 8 }}>{t('auth.labelEmail')}</Text>
                <View style={{
                  flexDirection: 'row', alignItems: 'center', gap: 12,
                  backgroundColor: Colors.surface, borderRadius: 12, padding: 14,
                  borderWidth: 1.5, borderColor: email ? Colors.primary : Colors.border,
                }}>
                  <Mail size={18} color={Colors.textDisabled} strokeWidth={1.5} />
                  <TextInput
                    value={email}
                    onChangeText={setEmail}
                    placeholder={t('auth.placeholderEmail')}
                    placeholderTextColor={Colors.textDisabled}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    style={{ flex: 1, fontSize: 14, color: Colors.textPrimary }}
                  />
                </View>
              </Animated.View>

              <Animated.View entering={FadeInDown.delay(160).springify()} style={{ marginTop: 24 }}>
                <Button title={t('auth.sendOtp')} onPress={handleSendOtp} loading={sending} disabled={!email.trim()} />
              </Animated.View>
            </Animated.View>
          )}

          {step === 'otp' && (
            <Animated.View entering={SlideInRight.springify()} style={{ flex: 1 }}>
              <View style={{ width: 56, height: 56, borderRadius: 16, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                <KeyRound size={26} color={Colors.primary} strokeWidth={1.5} />
              </View>
              <Text style={{ fontSize: 24, fontWeight: '800', color: Colors.textPrimary }}>{t('auth.otpTitle')}</Text>
              <Text style={{ fontSize: 14, color: Colors.textSecondary, marginTop: 8, lineHeight: 20 }}>
                {t('auth.otpSubtitle')}{'\n'}
                <Text style={{ color: Colors.primary, fontWeight: '600' }}>{email}</Text>
              </Text>

              <Animated.View entering={FadeInDown.delay(100).springify()} style={{ marginTop: 32 }}>
                <Text style={{ fontSize: 13, fontWeight: '600', color: Colors.textSecondary, marginBottom: 8 }}>{t('auth.labelOtp')}</Text>
                <TextInput
                  ref={otpRef}
                  value={otp}
                  onChangeText={(t) => setOtp(t.replace(/\D/g, '').slice(0, 6))}
                  placeholder={t('auth.placeholderOtp')}
                  placeholderTextColor={Colors.textDisabled}
                  keyboardType="number-pad"
                  maxLength={6}
                  style={{
                    backgroundColor: Colors.surface, borderRadius: 12, padding: 14,
                    fontSize: 24, fontWeight: '700', color: Colors.textPrimary,
                    textAlign: 'center', letterSpacing: 8,
                    borderWidth: 1.5, borderColor: otp.length === 6 ? Colors.primary : Colors.border,
                  }}
                />
              </Animated.View>

              <Animated.View entering={FadeInDown.delay(160).springify()} style={{ marginTop: 24, gap: 12 }}>
                <Button title={t('auth.verify')} onPress={handleVerifyOtp} loading={verifying} disabled={otp.length < 6} />
                <Pressable onPress={handleSendOtp} disabled={sending} style={{ alignItems: 'center', paddingVertical: 8 }}>
                  <Text style={{ color: Colors.primary, fontSize: 14, fontWeight: '600' }}>
                    {sending ? t('auth.sendingAgain') : t('auth.resendOtp')}
                  </Text>
                </Pressable>
              </Animated.View>
            </Animated.View>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
