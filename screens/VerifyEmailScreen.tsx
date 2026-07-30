import {
  AuthBackground,
  AuthHeader,
  AuthSheet,
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
import { KeyRound } from 'lucide-react-native';
import { useRef, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

export default function VerifyEmailScreen({
  email,
  onBack,
}: {
  email: string;
  onBack: () => void;
}) {
  const t = useT();
  const insets = useSafeAreaInsets();
  const [code, setCode] = useState('');
  const codeRef = useRef<TextInput>(null);
  const { scrollProps, fieldProps } = useKeyboardLift();
  const codeField = fieldProps('activationCode');
  const { mutateAsync: sendOtp, isPending: sending } = useSendOtp();
  const { mutateAsync: verifyOtp, isPending: verifying } = useVerifyOtp();

  const handleVerify = async () => {
    if (!email || code.length !== 6) return;
    try {
      await verifyOtp({ email, code });
      Toast.show({
        type: 'success',
        text1: t('auth.activationOk'),
        text2: t('auth.activationLoginHint'),
      });
      router.replace({
        pathname: '/(auth)/login',
        params: { email },
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: t('auth.activationErr'),
        text2: localizedAuthError(error, t, 'auth.otpVerifyErr'),
      });
    }
  };

  const handleResend = async () => {
    if (!email) return;
    try {
      await sendOtp({ email });
      Toast.show({
        type: 'success',
        text1: t('auth.otpSentOk'),
        text2: t('auth.otpSentSub'),
      });
      setCode('');
      setTimeout(() => codeRef.current?.focus(), 300);
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: t('auth.otpSendErr'),
        text2: localizedAuthError(error, t, 'auth.otpSendErrSub'),
      });
    }
  };

  return (
    <AuthBackground>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <AuthHeader fallback="/(auth)/login" onBack={onBack} />

        <Animated.Text
          entering={FadeInDown.springify()}
          style={{
            ...authTitleOnImage,
            paddingHorizontal: 24,
            marginTop: 18,
            marginBottom: 22,
          }}
        >
          {t('auth.activationTitle')}
        </Animated.Text>

        <AuthSheet>
          <ScrollView
            {...scrollProps}
            contentContainerStyle={{
              padding: 24,
              paddingTop: 28,
              paddingBottom: 24 + insets.bottom,
            }}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="none"
            automaticallyAdjustKeyboardInsets
            showsVerticalScrollIndicator={false}
          >
            <Animated.View entering={FadeInDown.delay(80).springify()}>
              <View
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 16,
                  backgroundColor: Colors.primaryLight,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 18,
                }}
              >
                <KeyRound
                  size={26}
                  color={Colors.primary}
                  strokeWidth={1.5}
                />
              </View>
              <Text
                style={{
                  fontSize: 14,
                  color: Colors.textSecondary,
                  lineHeight: 20,
                }}
              >
                {t('auth.activationSubtitle')}{'\n'}
                <Text style={{ color: Colors.primary, fontWeight: '600' }}>
                  {email || t('auth.noActivationEmail')}
                </Text>
              </Text>
            </Animated.View>

            <Animated.View
              entering={FadeInDown.delay(120).springify()}
              style={{ marginTop: 28 }}
              onLayout={codeField.onLayout}
            >
              <Text style={authLabelStyle}>{t('auth.labelOtp')}</Text>
              <TextInput
                ref={codeRef}
                value={code}
                onChangeText={(value) =>
                  setCode(value.replace(/\D/g, '').slice(0, 6))
                }
                placeholder={t('auth.placeholderOtp')}
                placeholderTextColor={Colors.textDisabled}
                keyboardType="number-pad"
                maxLength={6}
                onFocus={codeField.onFocus}
                onSubmitEditing={handleVerify}
                style={{
                  backgroundColor: Colors.background,
                  borderRadius: 12,
                  padding: 14,
                  fontSize: 24,
                  fontWeight: '700',
                  color: Colors.textPrimary,
                  textAlign: 'center',
                  letterSpacing: 8,
                  borderWidth: 1.5,
                  borderColor:
                    code.length === 6 ? Colors.primary : Colors.border,
                }}
              />
            </Animated.View>

            <Animated.View
              entering={FadeInDown.delay(160).springify()}
              style={{ marginTop: 24, gap: 12 }}
            >
              <Button
                title={t('auth.activateAccount')}
                onPress={handleVerify}
                loading={verifying}
                disabled={!email || code.length !== 6}
              />
              <Pressable
                onPress={handleResend}
                disabled={!email || sending}
                style={{ alignItems: 'center', paddingVertical: 8 }}
              >
                <Text
                  style={{
                    color: Colors.primary,
                    fontSize: 14,
                    fontWeight: '600',
                  }}
                >
                  {sending ? t('auth.sendingAgain') : t('auth.resendOtp')}
                </Text>
              </Pressable>
            </Animated.View>
          </ScrollView>
        </AuthSheet>
      </SafeAreaView>
    </AuthBackground>
  );
}
