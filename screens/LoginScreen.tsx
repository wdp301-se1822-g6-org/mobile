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
import { useLogin } from '@/hooks/auth/useAuth';
import { useT } from '@/i18n/useT';
import { localizedAuthError } from '@/utils/authError';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react-native';
import { useMemo, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { z } from 'zod';

export default function LoginScreen() {
  const t = useT();
  const insets = useSafeAreaInsets();
  const [showPw, setShowPw] = useState(false);
  const { mutateAsync: login, isPending } = useLogin();
  const { scrollProps, fieldProps } = useKeyboardLift();
  const emailField = fieldProps('email');
  const passwordField = fieldProps('password');
  const passwordRef = useRef<TextInput>(null);

  const loginSchema = useMemo(
    () =>
      z.object({
        email: z.email(t('auth.errEmailInvalid')),
        password: z.string().min(1, t('auth.errPwMin')),
      }),
    [t],
  );

  type LoginInput = z.infer<typeof loginSchema>;

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    try {
      const res = await login(data);
      Toast.show({ type: 'success', text1: t('auth.loginOkTitle') });
      if (res.user.role === 'washer') {
        router.replace('/(washer)/queue' as any);
      } else if (res.user.role === 'cashier') {
        router.replace('/(cashier)/check-in' as any);
      } else {
        router.replace('/(tabs)/home');
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: t('auth.loginErrTitle'),
        text2: localizedAuthError(error, t, 'auth.loginErrSub'),
      });
    }
  };

  return (
    <AuthBackground>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <AuthHeader fallback="/(auth)/welcome" />

        <Animated.Text
          entering={FadeInDown.springify()}
          style={{
            ...authTitleOnImage,
            paddingHorizontal: 24,
            marginTop: 18,
            marginBottom: 22,
          }}
        >
          {t('auth.loginTitle')}
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
                entering={FadeInDown.delay(80).springify()}
                style={{ marginBottom: 24 }}
              >
                <Text
                  style={{
                    fontSize: 22,
                    fontWeight: '800',
                    color: Colors.textPrimary,
                  }}
                >
                  {t('auth.loginSubtitle')}
                </Text>
              </Animated.View>

              {/* Email */}
              <Animated.View
                entering={FadeInDown.delay(120).springify()}
                style={{ marginBottom: 14 }}
                onLayout={emailField.onLayout}
              >
                <Text style={authLabelStyle}>{t('auth.labelEmail')}</Text>
                <Controller
                  control={control}
                  name="email"
                  render={({ field: { onChange, value } }) => (
                    <View
                      style={{
                        ...authFieldStyle,
                        borderColor: errors.email
                          ? Colors.danger
                          : Colors.border,
                      }}
                    >
                      <Mail
                        size={18}
                        color={
                          errors.email ? Colors.danger : Colors.textDisabled
                        }
                        strokeWidth={1.5}
                      />
                      <TextInput
                        value={value}
                        onChangeText={onChange}
                        placeholder={t('auth.placeholderEmail')}
                        placeholderTextColor={Colors.textDisabled}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        onFocus={emailField.onFocus}
                        returnKeyType="next"
                        submitBehavior="submit"
                        onSubmitEditing={() => passwordRef.current?.focus()}
                        style={authInputStyle}
                      />
                    </View>
                  )}
                />
                {errors.email && (
                  <Text
                    style={{ color: Colors.danger, fontSize: 12, marginTop: 4 }}
                  >
                    {errors.email.message}
                  </Text>
                )}
              </Animated.View>

              {/* Password */}
              <Animated.View
                entering={FadeInDown.delay(160).springify()}
                style={{ marginBottom: 8 }}
                onLayout={passwordField.onLayout}
              >
                <Text style={authLabelStyle}>{t('auth.labelPassword')}</Text>
                <Controller
                  control={control}
                  name="password"
                  render={({ field: { onChange, value } }) => (
                    <View
                      style={{
                        ...authFieldStyle,
                        borderColor: errors.password
                          ? Colors.danger
                          : Colors.border,
                      }}
                    >
                      <Lock
                        size={18}
                        color={
                          errors.password ? Colors.danger : Colors.textDisabled
                        }
                        strokeWidth={1.5}
                      />
                      <TextInput
                        ref={passwordRef}
                        value={value}
                        onChangeText={onChange}
                        placeholder={t('auth.placeholderPassword')}
                        placeholderTextColor={Colors.textDisabled}
                        secureTextEntry={!showPw}
                        onFocus={passwordField.onFocus}
                        returnKeyType="done"
                        onSubmitEditing={handleSubmit(onSubmit)}
                        style={authInputStyle}
                      />
                      <Pressable
                        onPress={() => setShowPw((p) => !p)}
                        hitSlop={10}
                      >
                        {showPw ? (
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
                  )}
                />
                {errors.password && (
                  <Text
                    style={{ color: Colors.danger, fontSize: 12, marginTop: 4 }}
                  >
                    {errors.password.message}
                  </Text>
                )}
              </Animated.View>

              <Animated.View
                entering={FadeInDown.delay(180).springify()}
                style={{ alignItems: 'flex-end', marginBottom: 24 }}
              >
                <Pressable
                  onPress={() => router.push('/(auth)/forgot-password')}
                >
                  <Text
                    style={{
                      color: Colors.primary,
                      fontSize: 13,
                      fontWeight: '600',
                    }}
                  >
                    {t('auth.forgotPw')}
                  </Text>
                </Pressable>
              </Animated.View>

              <Animated.View
                entering={FadeInDown.delay(200).springify()}
                style={{ gap: 14 }}
              >
                <Button
                  title={t('auth.loginSubmit')}
                  onPress={handleSubmit(onSubmit)}
                  loading={isPending}
                />
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'center',
                    gap: 4,
                  }}
                >
                  <Text style={{ fontSize: 14, color: Colors.textSecondary }}>
                    {t('auth.noAccount')}
                  </Text>
                  <Pressable onPress={() => router.push('/(auth)/register')}>
                    <Text
                      style={{
                        fontSize: 14,
                        color: Colors.primary,
                        fontWeight: '700',
                      }}
                    >
                      {t('auth.signUp')}
                    </Text>
                  </Pressable>
                </View>
              </Animated.View>
          </ScrollView>
        </AuthSheet>
      </SafeAreaView>
    </AuthBackground>
  );
}
