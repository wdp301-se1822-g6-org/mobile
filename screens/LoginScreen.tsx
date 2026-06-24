import { LanguageToggleBar } from '@/components/i18n/LanguageToggle';
import { Button } from '@/components/ui/Button';
import { Colors } from '@/constants/Colors';
import { useT } from '@/i18n/useT';
import { useLogin } from '@/hooks/auth/useAuth';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { z } from 'zod';

export default function LoginScreen() {
  const t = useT();
  const [showPw, setShowPw] = useState(false);
  const { mutateAsync: login, isPending } = useLogin();

  const loginSchema = useMemo(() =>
    z.object({
      email: z.email(t('auth.errEmailInvalid')),
      password: z.string().min(1, t('auth.errPwMin')),
    }), [t]);

  type LoginInput = z.infer<typeof loginSchema>;

  const { control, handleSubmit, formState: { errors } } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    try {
      const res = await login(data);
      Toast.show({ type: 'success', text1: t('auth.loginOkTitle') });
      if (res.user.role === 'washer') {
        router.replace('/(washer)/queue' as any);
      } else {
        router.replace('/(tabs)/home');
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message;
      const text2 = Array.isArray(msg) ? msg.join(', ') : msg ?? t('auth.loginErrSub');
      Toast.show({ type: 'error', text1: t('auth.loginErrTitle'), text2 });
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }}>
      <LanguageToggleBar />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={{ padding: 24, paddingTop: 48 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          {/* Logo / Brand */}
          <Animated.View entering={FadeInDown.springify()} style={{ alignItems: 'center', marginBottom: 40 }}>
            <View style={{ width: 72, height: 72, borderRadius: 24, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <Text style={{ fontSize: 32 }}>🚗</Text>
            </View>
            <Text style={{ fontSize: 28, fontWeight: '800', color: Colors.textPrimary }}>WAVE</Text>
            <Text style={{ fontSize: 14, color: Colors.textSecondary, marginTop: 4 }}>{t('auth.brandSlogan')}</Text>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(80).springify()} style={{ marginBottom: 24 }}>
            <Text style={{ fontSize: 22, fontWeight: '700', color: Colors.textPrimary }}>{t('auth.loginTitle')}</Text>
            <Text style={{ fontSize: 14, color: Colors.textSecondary, marginTop: 4 }}>{t('auth.loginSubtitle')}</Text>
          </Animated.View>

          {/* Email */}
          <Animated.View entering={FadeInDown.delay(120).springify()} style={{ marginBottom: 14 }}>
            <Text style={{ fontSize: 13, fontWeight: '600', color: Colors.textSecondary, marginBottom: 8 }}>{t('auth.labelEmail')}</Text>
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, value } }) => (
                <View style={{
                  flexDirection: 'row', alignItems: 'center', gap: 12,
                  backgroundColor: Colors.surface, borderRadius: 12, padding: 14,
                  borderWidth: 1.5, borderColor: errors.email ? Colors.danger : Colors.border,
                }}>
                  <Mail size={18} color={errors.email ? Colors.danger : Colors.textDisabled} strokeWidth={1.5} />
                  <TextInput
                    value={value}
                    onChangeText={onChange}
                    placeholder={t('auth.placeholderEmail')}
                    placeholderTextColor={Colors.textDisabled}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    style={{ flex: 1, fontSize: 14, color: Colors.textPrimary }}
                  />
                </View>
              )}
            />
            {errors.email && <Text style={{ color: Colors.danger, fontSize: 12, marginTop: 4 }}>{errors.email.message}</Text>}
          </Animated.View>

          {/* Password */}
          <Animated.View entering={FadeInDown.delay(160).springify()} style={{ marginBottom: 8 }}>
            <Text style={{ fontSize: 13, fontWeight: '600', color: Colors.textSecondary, marginBottom: 8 }}>{t('auth.labelPassword')}</Text>
            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, value } }) => (
                <View style={{
                  flexDirection: 'row', alignItems: 'center', gap: 12,
                  backgroundColor: Colors.surface, borderRadius: 12, padding: 14,
                  borderWidth: 1.5, borderColor: errors.password ? Colors.danger : Colors.border,
                }}>
                  <Lock size={18} color={errors.password ? Colors.danger : Colors.textDisabled} strokeWidth={1.5} />
                  <TextInput
                    value={value}
                    onChangeText={onChange}
                    placeholder={t('auth.placeholderPassword')}
                    placeholderTextColor={Colors.textDisabled}
                    secureTextEntry={!showPw}
                    style={{ flex: 1, fontSize: 14, color: Colors.textPrimary }}
                  />
                  <Pressable onPress={() => setShowPw((p) => !p)} hitSlop={10}>
                    {showPw
                      ? <EyeOff size={18} color={Colors.textSecondary} strokeWidth={1.8} />
                      : <Eye size={18} color={Colors.textSecondary} strokeWidth={1.8} />
                    }
                  </Pressable>
                </View>
              )}
            />
            {errors.password && <Text style={{ color: Colors.danger, fontSize: 12, marginTop: 4 }}>{errors.password.message}</Text>}
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(180).springify()} style={{ alignItems: 'flex-end', marginBottom: 24 }}>
            <Pressable onPress={() => router.push('/(auth)/forgot-password')}>
              <Text style={{ color: Colors.primary, fontSize: 13, fontWeight: '600' }}>{t('auth.forgotPw')}</Text>
            </Pressable>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(200).springify()} style={{ gap: 14 }}>
            <Button title={t('auth.loginSubmit')} onPress={handleSubmit(onSubmit)} loading={isPending} />
            <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 4 }}>
              <Text style={{ fontSize: 14, color: Colors.textSecondary }}>{t('auth.noAccount')}</Text>
              <Pressable onPress={() => router.push('/(auth)/register')}>
                <Text style={{ fontSize: 14, color: Colors.primary, fontWeight: '700' }}>{t('auth.signUp')}</Text>
              </Pressable>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
