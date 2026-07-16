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
import { useLogin, useRegister } from '@/hooks/auth/useAuth';
import { useT } from '@/i18n/useT';
import { localizedAuthError } from '@/utils/authError';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { Calendar, Eye, EyeOff, Lock, Mail, Phone, User } from 'lucide-react-native';
import { ReactNode, RefObject, useMemo, useRef, useState } from 'react';
import { Control, Controller, FieldErrors, useForm } from 'react-hook-form';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { z } from 'zod';

type PasswordFieldProps = {
  control: Control<any>;
  name: string;
  label: string;
  placeholder: string;
  error?: string;
  onFocus?: () => void;
  inputRef?: RefObject<TextInput | null>;
  /** Given, the return key advances to it instead of submitting. */
  nextRef?: RefObject<TextInput | null>;
  onSubmit?: () => void;
};

function PasswordField({ control, name, label, placeholder, error, onFocus, inputRef, nextRef, onSubmit }: PasswordFieldProps) {
  // Local state — ensures only THIS field toggles, and we can use it as a remount key
  // to bypass Android's quirk of not updating secureTextEntry dynamically.
  const [shown, setShown] = useState(false);

  return (
    <View>
      <Text style={authLabelStyle}>{label}</Text>
      <Controller
        control={control}
        name={name}
        render={({ field: { onChange, value, onBlur } }) => (
          <View style={{ ...authFieldStyle, borderColor: error ? Colors.danger : Colors.border }}>
            <Lock size={18} color={Colors.textDisabled} strokeWidth={1.5} />
            <TextInput
              key={shown ? `${name}-shown` : `${name}-hidden`}
              ref={inputRef}
              value={(value as string) ?? ''}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder={placeholder}
              placeholderTextColor={Colors.textDisabled}
              secureTextEntry={!shown}
              autoCapitalize="none"
              autoCorrect={false}
              onFocus={onFocus}
              returnKeyType={nextRef ? 'next' : 'done'}
              submitBehavior={nextRef ? 'submit' : 'blurAndSubmit'}
              onSubmitEditing={() => (nextRef ? nextRef.current?.focus() : onSubmit?.())}
              style={authInputStyle}
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
  onFocus?: () => void;
  inputRef?: RefObject<TextInput | null>;
  /** Given, the return key advances to it instead of submitting. */
  nextRef?: RefObject<TextInput | null>;
  onSubmit?: () => void;
};

function TextField({ control, name, label, placeholder, icon, error, keyboardType, onFocus, inputRef, nextRef, onSubmit }: TextFieldProps) {
  return (
    <View>
      <Text style={authLabelStyle}>{label}</Text>
      <Controller
        control={control}
        name={name}
        render={({ field: { onChange, value, onBlur } }) => (
          <View style={{ ...authFieldStyle, borderColor: error ? Colors.danger : Colors.border }}>
            {icon}
            <TextInput
              ref={inputRef}
              value={(value as string) ?? ''}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder={placeholder}
              placeholderTextColor={Colors.textDisabled}
              keyboardType={keyboardType}
              autoCapitalize={keyboardType === 'email-address' ? 'none' : 'words'}
              onFocus={onFocus}
              returnKeyType={nextRef ? 'next' : 'done'}
              submitBehavior={nextRef ? 'submit' : 'blurAndSubmit'}
              onSubmitEditing={() => (nextRef ? nextRef.current?.focus() : onSubmit?.())}
              style={authInputStyle}
            />
          </View>
        )}
      />
      {error && <Text style={{ color: Colors.danger, fontSize: 12, marginTop: 4 }}>{error}</Text>}
    </View>
  );
}

/** Progressively formats raw keystrokes into a DD/MM/YYYY mask. */
function formatDob(raw: string): string {
  const d = raw.replace(/\D/g, '').slice(0, 8);
  let out = d.slice(0, 2);
  if (d.length > 2) out += '/' + d.slice(2, 4);
  if (d.length > 4) out += '/' + d.slice(4, 8);
  return out;
}

/** True when `dd/mm/yyyy` is a real calendar date that isn't in the future. */
function isValidDob(value: string): boolean {
  const [dd, mm, yyyy] = value.split('/').map(Number);
  const date = new Date(yyyy, mm - 1, dd);
  return (
    date.getFullYear() === yyyy &&
    date.getMonth() === mm - 1 &&
    date.getDate() === dd &&
    date.getTime() <= Date.now()
  );
}

/** Converts a validated `dd/mm/yyyy` string to an ISO 8601 UTC timestamp. */
function dobToIso(value: string): string {
  const [dd, mm, yyyy] = value.split('/').map(Number);
  return new Date(Date.UTC(yyyy, mm - 1, dd)).toISOString();
}

type DateFieldProps = {
  control: Control<any>;
  name: string;
  label: string;
  placeholder: string;
  error?: string;
  onFocus?: () => void;
  inputRef?: RefObject<TextInput | null>;
  nextRef?: RefObject<TextInput | null>;
  onSubmit?: () => void;
};

function DateField({ control, name, label, placeholder, error, onFocus, inputRef, nextRef, onSubmit }: DateFieldProps) {
  return (
    <View>
      <Text style={authLabelStyle}>{label}</Text>
      <Controller
        control={control}
        name={name}
        render={({ field: { onChange, value, onBlur } }) => (
          <View style={{ ...authFieldStyle, borderColor: error ? Colors.danger : Colors.border }}>
            <Calendar size={18} color={Colors.textDisabled} strokeWidth={1.5} />
            <TextInput
              ref={inputRef}
              value={(value as string) ?? ''}
              onChangeText={(text) => onChange(formatDob(text))}
              onBlur={onBlur}
              placeholder={placeholder}
              placeholderTextColor={Colors.textDisabled}
              keyboardType="number-pad"
              maxLength={10}
              onFocus={onFocus}
              returnKeyType={nextRef ? 'next' : 'done'}
              submitBehavior={nextRef ? 'submit' : 'blurAndSubmit'}
              onSubmitEditing={() => (nextRef ? nextRef.current?.focus() : onSubmit?.())}
              style={authInputStyle}
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
  const insets = useSafeAreaInsets();
  const { mutateAsync: register, isPending: registering } = useRegister();
  const { mutateAsync: login, isPending: loggingIn } = useLogin();
  const { scrollProps, fieldProps } = useKeyboardLift();
  const fields = {
    name: fieldProps('name'),
    phone: fieldProps('phone'),
    dateOfBirth: fieldProps('dateOfBirth'),
    email: fieldProps('email'),
    password: fieldProps('password'),
    confirmPassword: fieldProps('confirmPassword'),
  };
  const phoneRef = useRef<TextInput>(null);
  const dobRef = useRef<TextInput>(null);
  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const confirmRef = useRef<TextInput>(null);

  const registerSchema = useMemo(() =>
    z.object({
      name: z.string().min(2, t('auth.errNameMin')),
      phone: z.string().regex(/^(0|\+84)[3-9][0-9]{8}$/, t('auth.errPhoneInvalid')),
      dateOfBirth: z.string()
        .regex(/^\d{2}\/\d{2}\/\d{4}$/, t('auth.errDobInvalid'))
        .refine(isValidDob, t('auth.errDobInvalid')),
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
      await register({ name: data.name, phone: data.phone, email: data.email, password: data.password, dateOfBirth: dobToIso(data.dateOfBirth) });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: t('auth.registerErr'),
        text2: localizedAuthError(error, t, 'auth.registerErrFallback'),
      });
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
    <AuthBackground>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <AuthHeader fallback="/(auth)/welcome" />

        <Animated.Text
          entering={FadeInDown.springify()}
          style={{ ...authTitleOnImage, paddingHorizontal: 24, marginTop: 18, marginBottom: 22 }}
        >
          {t('auth.registerTitle')}
        </Animated.Text>

        <AuthSheet>
          <ScrollView
            {...scrollProps}
            contentContainerStyle={{ padding: 24, paddingTop: 28, paddingBottom: 24 + insets.bottom }}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="none"
            automaticallyAdjustKeyboardInsets
            showsVerticalScrollIndicator={false}
          >
              {/* Field wrappers are direct children of the scroll content so their
                  onLayout y lands in content coordinates — see useKeyboardLift. */}
              <Animated.View entering={FadeInDown.delay(80).springify()} style={{ marginBottom: 24 }}>
                <Text style={{ fontSize: 22, fontWeight: '800', color: Colors.textPrimary }}>{t('auth.registerSubtitle')}</Text>
              </Animated.View>

              <Animated.View entering={FadeInDown.delay(120).springify()} style={{ marginBottom: 14 }} onLayout={fields.name.onLayout}>
                <TextField
                  control={control as any}
                  name="name"
                  label={t('auth.labelName')}
                  placeholder={t('auth.placeholderName')}
                  icon={<User size={18} color={Colors.textDisabled} strokeWidth={1.5} />}
                  error={errs.name?.message}
                  onFocus={fields.name.onFocus}
                  nextRef={phoneRef}
                />
              </Animated.View>

              <Animated.View entering={FadeInDown.delay(160).springify()} style={{ marginBottom: 14 }} onLayout={fields.phone.onLayout}>
                <TextField
                  control={control as any}
                  name="phone"
                  label={t('auth.labelPhone')}
                  placeholder={t('auth.placeholderPhone')}
                  icon={<Phone size={18} color={Colors.textDisabled} strokeWidth={1.5} />}
                  keyboardType="phone-pad"
                  error={errs.phone?.message}
                  onFocus={fields.phone.onFocus}
                  inputRef={phoneRef}
                  nextRef={dobRef}
                />
              </Animated.View>

              <Animated.View entering={FadeInDown.delay(200).springify()} style={{ marginBottom: 14 }} onLayout={fields.dateOfBirth.onLayout}>
                <DateField
                  control={control as any}
                  name="dateOfBirth"
                  label={t('auth.labelDob')}
                  placeholder={t('auth.placeholderDob')}
                  error={errs.dateOfBirth?.message}
                  onFocus={fields.dateOfBirth.onFocus}
                  inputRef={dobRef}
                  nextRef={emailRef}
                />
              </Animated.View>

              <Animated.View entering={FadeInDown.delay(240).springify()} style={{ marginBottom: 14 }} onLayout={fields.email.onLayout}>
                <TextField
                  control={control as any}
                  name="email"
                  label={t('auth.labelEmail')}
                  placeholder={t('auth.placeholderEmail')}
                  icon={<Mail size={18} color={Colors.textDisabled} strokeWidth={1.5} />}
                  keyboardType="email-address"
                  error={errs.email?.message}
                  onFocus={fields.email.onFocus}
                  inputRef={emailRef}
                  nextRef={passwordRef}
                />
              </Animated.View>

              <Animated.View entering={FadeInDown.delay(280).springify()} style={{ marginBottom: 14 }} onLayout={fields.password.onLayout}>
                <PasswordField
                  control={control as any}
                  name="password"
                  label={t('auth.labelPassword')}
                  placeholder={t('auth.placeholderPassword')}
                  error={errs.password?.message}
                  onFocus={fields.password.onFocus}
                  inputRef={passwordRef}
                  nextRef={confirmRef}
                />
              </Animated.View>

              <Animated.View entering={FadeInDown.delay(320).springify()} onLayout={fields.confirmPassword.onLayout}>
                <PasswordField
                  control={control as any}
                  name="confirmPassword"
                  label={t('auth.labelConfirmPw')}
                  placeholder={t('auth.placeholderPassword')}
                  error={errs.confirmPassword?.message as string | undefined}
                  onFocus={fields.confirmPassword.onFocus}
                  inputRef={confirmRef}
                  onSubmit={handleSubmit(onSubmit)}
                />
              </Animated.View>

              <Animated.View entering={FadeInDown.delay(360).springify()} style={{ gap: 14, marginTop: 24 }}>
                <Button title={t('auth.registerSubmit')} onPress={handleSubmit(onSubmit)} loading={isPending} />
                <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 4 }}>
                  <Text style={{ fontSize: 14, color: Colors.textSecondary }}>{t('auth.hasAccount')}</Text>
                  <Pressable onPress={() => router.push('/(auth)/login')}>
                    <Text style={{ fontSize: 14, color: Colors.primary, fontWeight: '700' }}>{t('auth.signIn')}</Text>
                  </Pressable>
                </View>
              </Animated.View>
          </ScrollView>
        </AuthSheet>
      </SafeAreaView>
    </AuthBackground>
  );
}
