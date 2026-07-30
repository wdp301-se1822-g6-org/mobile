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
import {
  useForgotPassword,
  useResetPassword,
} from '@/hooks/auth/useAuth';
import { useT } from '@/i18n/useT';
import { localizedAuthError } from '@/utils/authError';
import { router } from 'expo-router';
import {
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  Mail,
} from 'lucide-react-native';
import { RefObject, useRef, useState } from 'react';
import {
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import Animated, {
  FadeInDown,
  SlideInRight,
} from 'react-native-reanimated';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

type Step = 'email' | 'reset';

function PasswordInput({
  label,
  value,
  onChangeText,
  shown,
  onToggle,
  error,
  inputRef,
  nextRef,
  onFocus,
  onSubmitEditing,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  shown: boolean;
  onToggle: () => void;
  error?: string;
  inputRef?: RefObject<TextInput | null>;
  nextRef?: RefObject<TextInput | null>;
  onFocus?: () => void;
  onSubmitEditing?: () => void;
}) {
  const t = useT();
  return (
    <View>
      <Text style={authLabelStyle}>{label}</Text>
      <View
        style={{
          ...authFieldStyle,
          borderColor: error ? Colors.danger : Colors.border,
        }}
      >
        <Lock
          size={18}
          color={error ? Colors.danger : Colors.textDisabled}
          strokeWidth={1.5}
        />
        <TextInput
          key={shown ? 'shown' : 'hidden'}
          ref={inputRef}
          value={value}
          onChangeText={onChangeText}
          placeholder={t('auth.placeholderPassword')}
          placeholderTextColor={Colors.textDisabled}
          secureTextEntry={!shown}
          autoCapitalize="none"
          autoCorrect={false}
          onFocus={onFocus}
          returnKeyType={nextRef ? 'next' : 'done'}
          submitBehavior={nextRef ? 'submit' : 'blurAndSubmit'}
          onSubmitEditing={() =>
            nextRef ? nextRef.current?.focus() : onSubmitEditing?.()
          }
          style={authInputStyle}
        />
        <Pressable onPress={onToggle} hitSlop={12}>
          {shown ? (
            <EyeOff
              size={18}
              color={Colors.textSecondary}
              strokeWidth={1.8}
            />
          ) : (
            <Eye
              size={18}
              color={Colors.textSecondary}
              strokeWidth={1.8}
            />
          )}
        </Pressable>
      </View>
      {!!error && (
        <Text style={{ color: Colors.danger, fontSize: 12, marginTop: 4 }}>
          {error}
        </Text>
      )}
    </View>
  );
}

export default function ForgotPasswordScreen() {
  const t = useT();
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [emailError, setEmailError] = useState<string>();
  const [codeError, setCodeError] = useState<string>();
  const [passwordError, setPasswordError] = useState<string>();
  const [confirmError, setConfirmError] = useState<string>();
  const codeRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const confirmRef = useRef<TextInput>(null);

  const { scrollProps, fieldProps } = useKeyboardLift();
  const emailField = fieldProps('email');
  const codeField = fieldProps('resetCode');
  const passwordField = fieldProps('newPassword');
  const confirmField = fieldProps('confirmPassword');

  const {
    mutateAsync: forgotPassword,
    isPending: requesting,
  } = useForgotPassword();
  const {
    mutateAsync: resetPassword,
    isPending: resetting,
  } = useResetPassword();

  const normalizedEmail = email.trim().toLowerCase();

  const handleRequestReset = async () => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setEmailError(t('auth.errEmailInvalid'));
      return;
    }

    setEmailError(undefined);
    try {
      await forgotPassword({ email: normalizedEmail });
      Toast.show({
        type: 'success',
        text1: t('auth.resetCodeSent'),
        text2: t('auth.resetCodeSentSub'),
      });
      setCode('');
      setCodeError(undefined);
      setStep('reset');
      setTimeout(() => codeRef.current?.focus(), 300);
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: t('auth.resetCodeSendErr'),
        text2: localizedAuthError(
          error,
          t,
          'auth.resetCodeSendErrSub',
        ),
      });
    }
  };

  const handleResetPassword = async () => {
    const nextCodeError =
      code.length === 6 ? undefined : t('auth.errOtpLength');
    const nextPasswordError =
      newPassword.length < 8
        ? t('auth.errPwMin')
        : newPassword.length > 72
          ? t('auth.errPwMax')
          : undefined;
    const nextConfirmError =
      newPassword === confirmPassword
        ? undefined
        : t('auth.errPwMismatch');

    setCodeError(nextCodeError);
    setPasswordError(nextPasswordError);
    setConfirmError(nextConfirmError);
    if (nextCodeError || nextPasswordError || nextConfirmError) return;

    try {
      await resetPassword({
        email: normalizedEmail,
        code,
        newPassword,
      });
      Toast.show({
        type: 'success',
        text1: t('auth.resetPasswordOk'),
        text2: t('auth.resetPasswordOkSub'),
      });
      router.replace({
        pathname: '/(auth)/login',
        params: { email: normalizedEmail },
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: t('auth.resetPasswordErr'),
        text2: localizedAuthError(
          error,
          t,
          'auth.resetPasswordErrSub',
        ),
      });
    }
  };

  return (
    <AuthBackground>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <AuthHeader
          fallback="/(auth)/login"
          onBack={step === 'reset' ? () => setStep('email') : undefined}
        />

        <Animated.Text
          entering={FadeInDown.springify()}
          style={{
            ...authTitleOnImage,
            paddingHorizontal: 24,
            marginTop: 18,
            marginBottom: 22,
          }}
        >
          {step === 'email'
            ? t('auth.forgotTitle')
            : t('auth.resetPasswordTitle')}
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
            <Animated.View
              key={`${step}-intro`}
              entering={SlideInRight.springify()}
            >
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
                {step === 'email' ? (
                  <Mail
                    size={26}
                    color={Colors.primary}
                    strokeWidth={1.5}
                  />
                ) : (
                  <KeyRound
                    size={26}
                    color={Colors.primary}
                    strokeWidth={1.5}
                  />
                )}
              </View>
              <Text
                style={{
                  fontSize: 14,
                  color: Colors.textSecondary,
                  lineHeight: 20,
                }}
              >
                {step === 'email'
                  ? t('auth.forgotSubtitle')
                  : t('auth.resetPasswordSubtitle')}{' '}
                {step === 'reset' && (
                  <Text
                    style={{
                      color: Colors.primary,
                      fontWeight: '600',
                    }}
                  >
                    {normalizedEmail}
                  </Text>
                )}
              </Text>
            </Animated.View>

            {step === 'email' ? (
              <Animated.View
                key="email-field"
                entering={FadeInDown.delay(100).springify()}
                style={{ marginTop: 28 }}
                onLayout={emailField.onLayout}
              >
                <Text style={authLabelStyle}>
                  {t('auth.labelEmail')}
                </Text>
                <View
                  style={{
                    ...authFieldStyle,
                    borderColor: emailError
                      ? Colors.danger
                      : Colors.border,
                  }}
                >
                  <Mail
                    size={18}
                    color={
                      emailError ? Colors.danger : Colors.textDisabled
                    }
                    strokeWidth={1.5}
                  />
                  <TextInput
                    value={email}
                    onChangeText={(value) => {
                      setEmail(value);
                      setEmailError(undefined);
                    }}
                    placeholder={t('auth.placeholderEmail')}
                    placeholderTextColor={Colors.textDisabled}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    onFocus={emailField.onFocus}
                    returnKeyType="done"
                    onSubmitEditing={handleRequestReset}
                    style={authInputStyle}
                  />
                </View>
                {!!emailError && (
                  <Text
                    style={{
                      color: Colors.danger,
                      fontSize: 12,
                      marginTop: 4,
                    }}
                  >
                    {emailError}
                  </Text>
                )}
              </Animated.View>
            ) : (
              <View style={{ marginTop: 28, gap: 14 }}>
                <Animated.View
                  entering={FadeInDown.delay(100).springify()}
                  onLayout={codeField.onLayout}
                >
                  <Text style={authLabelStyle}>
                    {t('auth.labelResetCode')}
                  </Text>
                  <TextInput
                    ref={codeRef}
                    value={code}
                    onChangeText={(value) => {
                      setCode(value.replace(/\D/g, '').slice(0, 6));
                      setCodeError(undefined);
                    }}
                    placeholder={t('auth.placeholderOtp')}
                    placeholderTextColor={Colors.textDisabled}
                    keyboardType="number-pad"
                    maxLength={6}
                    onFocus={codeField.onFocus}
                    returnKeyType="next"
                    submitBehavior="submit"
                    onSubmitEditing={() =>
                      passwordRef.current?.focus()
                    }
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
                      borderColor: codeError
                        ? Colors.danger
                        : code.length === 6
                          ? Colors.primary
                          : Colors.border,
                    }}
                  />
                  {!!codeError && (
                    <Text
                      style={{
                        color: Colors.danger,
                        fontSize: 12,
                        marginTop: 4,
                      }}
                    >
                      {codeError}
                    </Text>
                  )}
                </Animated.View>

                <Animated.View
                  entering={FadeInDown.delay(140).springify()}
                  onLayout={passwordField.onLayout}
                >
                  <PasswordInput
                    label={t('auth.labelNewPassword')}
                    value={newPassword}
                    onChangeText={(value) => {
                      setNewPassword(value);
                      setPasswordError(undefined);
                    }}
                    shown={showNewPassword}
                    onToggle={() =>
                      setShowNewPassword((shown) => !shown)
                    }
                    error={passwordError}
                    inputRef={passwordRef}
                    nextRef={confirmRef}
                    onFocus={passwordField.onFocus}
                  />
                </Animated.View>

                <Animated.View
                  entering={FadeInDown.delay(180).springify()}
                  onLayout={confirmField.onLayout}
                >
                  <PasswordInput
                    label={t('auth.labelConfirmNewPassword')}
                    value={confirmPassword}
                    onChangeText={(value) => {
                      setConfirmPassword(value);
                      setConfirmError(undefined);
                    }}
                    shown={showConfirmPassword}
                    onToggle={() =>
                      setShowConfirmPassword((shown) => !shown)
                    }
                    error={confirmError}
                    inputRef={confirmRef}
                    onFocus={confirmField.onFocus}
                    onSubmitEditing={handleResetPassword}
                  />
                </Animated.View>
              </View>
            )}

            <Animated.View
              key={`${step}-actions`}
              entering={FadeInDown.delay(220).springify()}
              style={{ marginTop: 24, gap: 12 }}
            >
              {step === 'email' ? (
                <Button
                  title={t('auth.sendResetCode')}
                  onPress={handleRequestReset}
                  loading={requesting}
                  disabled={!normalizedEmail}
                />
              ) : (
                <>
                  <Button
                    title={t('auth.resetPasswordSubmit')}
                    onPress={handleResetPassword}
                    loading={resetting}
                    disabled={
                      code.length !== 6 ||
                      !newPassword ||
                      !confirmPassword
                    }
                  />
                  <Pressable
                    onPress={handleRequestReset}
                    disabled={requesting}
                    style={{
                      alignItems: 'center',
                      paddingVertical: 8,
                    }}
                  >
                    <Text
                      style={{
                        color: Colors.primary,
                        fontSize: 14,
                        fontWeight: '600',
                      }}
                    >
                      {requesting
                        ? t('auth.sendingAgain')
                        : t('auth.resendResetCode')}
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
