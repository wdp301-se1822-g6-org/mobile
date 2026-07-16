import {
  AuthBackground,
  AuthHeader,
  AuthSheet,
  authFieldStyle,
  authInputStyle,
  authLabelStyle,
  authTitleOnImage,
  useKeyboardLift,
} from '@/components/auth/AuthScaffold';
import { Button } from '@/components/ui/Button';
import { Colors } from '@/constants/Colors';
import { useSendOtp, useVerifyOtp } from '@/hooks/auth/useAuth';
import { useT } from '@/i18n/useT';
import { localizedAuthError } from '@/utils/authError';
import { router } from 'expo-router';
import { KeyRound, Mail } from 'lucide-react-native';
import { useRef, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import Animated, { FadeInDown, SlideInRight } from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

type Step = 'email' | 'otp';

export default function ForgotPasswordScreen() {
  const t = useT();
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const otpRef = useRef<TextInput>(null);

  const { scrollProps, fieldProps } = useKeyboardLift();
  const emailField = fieldProps('email');
  const otpField = fieldProps('otp');

  const { mutateAsync: sendOtp, isPending: sending } = useSendOtp();
  const { mutateAsync: verifyOtp, isPending: verifying } = useVerifyOtp();

  const handleSendOtp = async () => {
    if (!email.trim()) return;
    try {
      await sendOtp({ email });
      Toast.show({ type: 'success', text1: t('auth.otpSentOk'), text2: t('auth.otpSentSub') });
      setStep('otp');
      setTimeout(() => otpRef.current?.focus(), 300);
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: t('auth.otpSendErr'),
        text2: localizedAuthError(error, t, 'auth.otpSendErrSub'),
      });
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length < 6) return;
    try {
      await verifyOtp({ email, code: otp });
      Toast.show({ type: 'success', text1: t('auth.otpVerifiedOk') });
      router.replace('/(auth)/login');
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: t('auth.otpVerifyErr'),
        text2: localizedAuthError(error, t, 'auth.otpVerifyErr'),
      });
    }
  };

  return (
    <AuthBackground>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <AuthHeader
          fallback="/(auth)/login"
          onBack={step === 'otp' ? () => setStep('email') : undefined}
        />

        <Animated.Text
          entering={FadeInDown.springify()}
          style={{ ...authTitleOnImage, paddingHorizontal: 24, marginTop: 18, marginBottom: 22 }}
        >
          {step === 'email' ? t('auth.forgotTitle') : t('auth.otpTitle')}
        </Animated.Text>

        <AuthSheet>
          {/* Keys on the step blocks so switching step replays the entering animation,
              and field wrappers stay direct children of the scroll content — see useKeyboardLift. */}
          <ScrollView
            {...scrollProps}
            contentContainerStyle={{ padding: 24, paddingTop: 28, paddingBottom: 24 + insets.bottom }}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="none"
            automaticallyAdjustKeyboardInsets
            showsVerticalScrollIndicator={false}
          >
            <Animated.View key={`${step}-intro`} entering={SlideInRight.springify()}>
              <View style={{
                width: 56, height: 56, borderRadius: 16,
                backgroundColor: Colors.primaryLight,
                alignItems: 'center', justifyContent: 'center',
                marginBottom: 18,
              }}>
                {step === 'email'
                  ? <Mail size={26} color={Colors.primary} strokeWidth={1.5} />
                  : <KeyRound size={26} color={Colors.primary} strokeWidth={1.5} />}
              </View>
              {step === 'email' ? (
                <Text style={{ fontSize: 14, color: Colors.textSecondary, lineHeight: 20 }}>
                  {t('auth.forgotSubtitle')}
                </Text>
              ) : (
                <Text style={{ fontSize: 14, color: Colors.textSecondary, lineHeight: 20 }}>
                  {t('auth.otpSubtitle')}{'\n'}
                  <Text style={{ color: Colors.primary, fontWeight: '600' }}>{email}</Text>
                </Text>
              )}
            </Animated.View>

            {step === 'email' ? (
              <Animated.View
                key="email-field"
                entering={FadeInDown.delay(100).springify()}
                style={{ marginTop: 28 }}
                onLayout={emailField.onLayout}
              >
                <Text style={authLabelStyle}>{t('auth.labelEmail')}</Text>
                <View style={{ ...authFieldStyle, borderColor: email ? Colors.primary : Colors.border }}>
                  <Mail size={18} color={Colors.textDisabled} strokeWidth={1.5} />
                  <TextInput
                    value={email}
                    onChangeText={setEmail}
                    placeholder={t('auth.placeholderEmail')}
                    placeholderTextColor={Colors.textDisabled}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    onFocus={emailField.onFocus}
                    returnKeyType="done"
                    onSubmitEditing={handleSendOtp}
                    style={authInputStyle}
                  />
                </View>
              </Animated.View>
            ) : (
              <Animated.View
                key="otp-field"
                entering={FadeInDown.delay(100).springify()}
                style={{ marginTop: 28 }}
                onLayout={otpField.onLayout}
              >
                <Text style={authLabelStyle}>{t('auth.labelOtp')}</Text>
                <TextInput
                  ref={otpRef}
                  value={otp}
                  onChangeText={(v) => setOtp(v.replace(/\D/g, '').slice(0, 6))}
                  placeholder={t('auth.placeholderOtp')}
                  placeholderTextColor={Colors.textDisabled}
                  keyboardType="number-pad"
                  maxLength={6}
                  onFocus={otpField.onFocus}
                  style={{
                    backgroundColor: Colors.background, borderRadius: 12, padding: 14,
                    fontSize: 24, fontWeight: '700', color: Colors.textPrimary,
                    textAlign: 'center', letterSpacing: 8,
                    borderWidth: 1.5, borderColor: otp.length === 6 ? Colors.primary : Colors.border,
                  }}
                />
              </Animated.View>
            )}

            <Animated.View
              key={`${step}-actions`}
              entering={FadeInDown.delay(160).springify()}
              style={{ marginTop: 24, gap: 12 }}
            >
              {step === 'email' ? (
                <Button title={t('auth.sendOtp')} onPress={handleSendOtp} loading={sending} disabled={!email.trim()} />
              ) : (
                <>
                  <Button title={t('auth.verify')} onPress={handleVerifyOtp} loading={verifying} disabled={otp.length < 6} />
                  <Pressable onPress={handleSendOtp} disabled={sending} style={{ alignItems: 'center', paddingVertical: 8 }}>
                    <Text style={{ color: Colors.primary, fontSize: 14, fontWeight: '600' }}>
                      {sending ? t('auth.sendingAgain') : t('auth.resendOtp')}
                    </Text>
                  </Pressable>
                </>
              )}
            </Animated.View>
          </ScrollView>
        </AuthSheet>
      </SafeAreaView>
    </AuthBackground>
  );
}
