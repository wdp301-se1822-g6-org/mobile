import { LanguageToggleBar } from '@/components/i18n/LanguageToggle';
import { Button } from '@/components/ui/Button';
import { Colors } from '@/constants/Colors';
import { useT } from '@/i18n/useT';
import { useLogin, useRegister } from '@/hooks/auth/useAuth';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { Eye, EyeOff, Lock, Mail, Phone, User } from 'lucide-react-native';
import { ReactNode, useMemo, useState } from 'react';
import { Control, Controller, FieldErrors, useForm } from 'react-hook-form';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { z } from 'zod';

function extractApiError(err: any): string | undefined {
  const msg = err?.response?.data?.message;
  if (!msg) return undefined;
  return Array.isArray(msg) ? msg.join(', ') : String(msg);
}

type PasswordFieldProps = {
  control: Control<any>;
  name: string;
  label: string;
  placeholder: string;
  error?: string;
};

function PasswordField({ control, name, label, placeholder, error }: PasswordFieldProps) {
  // Local state — ensures only THIS field toggles, and we can use it as a remount key
  // to bypass Android's quirk of not updating secureTextEntry dynamically.
  const [shown, setShown] = useState(false);

  return (
    <View>
      <Text style={{ fontSize: 13, fontWeight: '600', color: Colors.textSecondary, marginBottom: 8 }}>{label}</Text>
      <Controller
        control={control}
        name={name}
        render={({ field: { onChange, value, onBlur } }) => (
          <View style={{
            flexDirection: 'row', alignItems: 'center', gap: 12,
            backgroundColor: Colors.surface, borderRadius: 12, padding: 14,
            borderWidth: 1.5, borderColor: error ? Colors.danger : Colors.border,
          }}>
            <Lock size={18} color={Colors.textDisabled} strokeWidth={1.5} />
            <TextInput
              key={shown ? `${name}-shown` : `${name}-hidden`}
              value={(value as string) ?? ''}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder={placeholder}
              placeholderTextColor={Colors.textDisabled}
              secureTextEntry={!shown}
              autoCapitalize="none"
              autoCorrect={false}
              style={{ flex: 1, fontSize: 14, color: Colors.textPrimary }}
            />
            <Pressable onPress={() => setShown((s) => !s)} hitSlop={12}>
              {shown
                ? <EyeOff size={18} color={Colors.textSecondary} strokeWidth={1.8} />
                : <Eye size={18} color={Colors.textSecondary} strokeWidth={1.8} />}
            </Pressable>
          </View>
        )}
      />
      {error && <Text style={{ color: Colors.danger, fontSize: 12, marginTop: 4 }}>{error}</Text>}
    </View>
  );
}

type TextFieldProps = {
  control: Control<any>;
  name: string;
  label: string;
  placeholder: string;
  icon: ReactNode;
  error?: string;
  keyboardType?: any;
};

function TextField({ control, name, label, placeholder, icon, error, keyboardType }: TextFieldProps) {
  return (
    <View>
      <Text style={{ fontSize: 13, fontWeight: '600', color: Colors.textSecondary, marginBottom: 8 }}>{label}</Text>
      <Controller
        control={control}
        name={name}
        render={({ field: { onChange, value, onBlur } }) => (
          <View style={{
            flexDirection: 'row', alignItems: 'center', gap: 12,
            backgroundColor: Colors.surface, borderRadius: 12, padding: 14,
            borderWidth: 1.5, borderColor: error ? Colors.danger : Colors.border,
          }}>
            {icon}
            <TextInput
              value={(value as string) ?? ''}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder={placeholder}
              placeholderTextColor={Colors.textDisabled}
              keyboardType={keyboardType}
              autoCapitalize={keyboardType === 'email-address' ? 'none' : 'words'}
              style={{ flex: 1, fontSize: 14, color: Colors.textPrimary }}
            />
          </View>
        )}
      />
      {error && <Text style={{ color: Colors.danger, fontSize: 12, marginTop: 4 }}>{error}</Text>}
    </View>
  );
}

export default function RegisterScreen() {
  const t = useT();
  const { mutateAsync: register, isPending: registering } = useRegister();
  const { mutateAsync: login, isPending: loggingIn } = useLogin();

  const registerSchema = useMemo(() =>
    z.object({
      name: z.string().min(2, t('auth.errNameMin')),
      phone: z.string().regex(/^(0|\+84)[3-9][0-9]{8}$/, t('auth.errPhoneInvalid')),
      email: z.email(t('auth.errEmailInvalid')),
      password: z.string().min(8, t('auth.errPwMin')),
      confirmPassword: z.string(),
    }).refine((d) => d.password === d.confirmPassword, { path: ['confirmPassword'], message: t('auth.errPwMismatch') }),
  [t]);

  type RegisterInput = z.infer<typeof registerSchema>;

  const { control, handleSubmit, formState: { errors } } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  const errs = errors as FieldErrors<RegisterInput>;

  const onSubmit = async (data: RegisterInput) => {
    try {
      await register({ name: data.name, phone: data.phone, email: data.email, password: data.password });
    } catch (err) {
      Toast.show({ type: 'error', text1: t('auth.registerErr'), text2: extractApiError(err) ?? t('auth.registerErrFallback') });
      return;
    }
    try {
      await login({ email: data.email, password: data.password });
      Toast.show({ type: 'success', text1: t('auth.registerOk') });
      router.replace('/(tabs)/home');
    } catch {
      Toast.show({ type: 'info', text1: t('auth.registerOk'), text2: t('auth.registerThenLogin') });
      router.replace('/(auth)/login');
    }
  };

  const isPending = registering || loggingIn;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }}>
      <LanguageToggleBar />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={{ padding: 24, paddingTop: 32 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <Animated.View entering={FadeInDown.springify()} style={{ marginBottom: 28 }}>
            <Text style={{ fontSize: 26, fontWeight: '800', color: Colors.textPrimary }}>{t('auth.registerTitle')}</Text>
            <Text style={{ fontSize: 14, color: Colors.textSecondary, marginTop: 4 }}>{t('auth.registerSubtitle')}</Text>
          </Animated.View>

          <View style={{ gap: 14 }}>
            <Animated.View entering={FadeInDown.delay(60).springify()}>
              <TextField
                control={control as any}
                name="name"
                label={t('auth.labelName')}
                placeholder={t('auth.placeholderName')}
                icon={<User size={18} color={Colors.textDisabled} strokeWidth={1.5} />}
                error={errs.name?.message}
              />
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(120).springify()}>
              <TextField
                control={control as any}
                name="phone"
                label={t('auth.labelPhone')}
                placeholder={t('auth.placeholderPhone')}
                icon={<Phone size={18} color={Colors.textDisabled} strokeWidth={1.5} />}
                keyboardType="phone-pad"
                error={errs.phone?.message}
              />
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(180).springify()}>
              <TextField
                control={control as any}
                name="email"
                label={t('auth.labelEmail')}
                placeholder={t('auth.placeholderEmail')}
                icon={<Mail size={18} color={Colors.textDisabled} strokeWidth={1.5} />}
                keyboardType="email-address"
                error={errs.email?.message}
              />
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(240).springify()}>
              <PasswordField
                control={control as any}
                name="password"
                label={t('auth.labelPassword')}
                placeholder={t('auth.placeholderPassword')}
                error={errs.password?.message}
              />
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(300).springify()}>
              <PasswordField
                control={control as any}
                name="confirmPassword"
                label={t('auth.labelConfirmPw')}
                placeholder={t('auth.placeholderPassword')}
                error={errs.confirmPassword?.message as string | undefined}
              />
            </Animated.View>
          </View>

          <Animated.View entering={FadeInDown.delay(400).springify()} style={{ gap: 14, marginTop: 24 }}>
            <Button title={t('auth.registerSubmit')} onPress={handleSubmit(onSubmit)} loading={isPending} />
            <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 4 }}>
              <Text style={{ fontSize: 14, color: Colors.textSecondary }}>{t('auth.hasAccount')}</Text>
              <Pressable onPress={() => router.push('/(auth)/login')}>
                <Text style={{ fontSize: 14, color: Colors.primary, fontWeight: '700' }}>{t('auth.signIn')}</Text>
              </Pressable>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
