import { Button } from '@/components/ui/Button';
import { Colors } from '@/constants/Colors';
import { useLogin } from '@/hooks/auth/useAuth';
import { loginSchema, LoginInput } from '@/schemas/auth';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react-native';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

export default function LoginScreen() {
  const [showPw, setShowPw] = useState(false);
  const { mutateAsync: login, isPending } = useLogin();

  const { control, handleSubmit, formState: { errors } } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    try {
      const res = await login(data);
      Toast.show({ type: 'success', text1: 'Đăng nhập thành công' });
      if (res.user.role === 'washer') {
        router.replace('/(washer)/queue' as any);
      } else {
        router.replace('/(tabs)/home');
      }
    } catch {
      Toast.show({ type: 'error', text1: 'Đăng nhập thất bại', text2: 'Sai email hoặc mật khẩu' });
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={{ padding: 24, paddingTop: 48 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          {/* Logo / Brand */}
          <Animated.View entering={FadeInDown.springify()} style={{ alignItems: 'center', marginBottom: 40 }}>
            <View style={{ width: 72, height: 72, borderRadius: 24, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <Text style={{ fontSize: 32 }}>🚗</Text>
            </View>
            <Text style={{ fontSize: 28, fontWeight: '800', color: Colors.textPrimary }}>WAVE</Text>
            <Text style={{ fontSize: 14, color: Colors.textSecondary, marginTop: 4 }}>Rửa xe thông minh</Text>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(80).springify()} style={{ marginBottom: 24 }}>
            <Text style={{ fontSize: 22, fontWeight: '700', color: Colors.textPrimary }}>Đăng nhập</Text>
            <Text style={{ fontSize: 14, color: Colors.textSecondary, marginTop: 4 }}>Chào mừng bạn quay lại</Text>
          </Animated.View>

          {/* Email */}
          <Animated.View entering={FadeInDown.delay(120).springify()} style={{ marginBottom: 14 }}>
            <Text style={{ fontSize: 13, fontWeight: '600', color: Colors.textSecondary, marginBottom: 8 }}>EMAIL</Text>
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
                    placeholder="example@email.com"
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
            <Text style={{ fontSize: 13, fontWeight: '600', color: Colors.textSecondary, marginBottom: 8 }}>MẬT KHẨU</Text>
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
                    placeholder="••••••••"
                    placeholderTextColor={Colors.textDisabled}
                    secureTextEntry={!showPw}
                    style={{ flex: 1, fontSize: 14, color: Colors.textPrimary }}
                  />
                  <Pressable onPress={() => setShowPw((p) => !p)}>
                    {showPw
                      ? <EyeOff size={18} color={Colors.textDisabled} strokeWidth={1.5} />
                      : <Eye size={18} color={Colors.textDisabled} strokeWidth={1.5} />
                    }
                  </Pressable>
                </View>
              )}
            />
            {errors.password && <Text style={{ color: Colors.danger, fontSize: 12, marginTop: 4 }}>{errors.password.message}</Text>}
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(180).springify()} style={{ alignItems: 'flex-end', marginBottom: 24 }}>
            <Pressable onPress={() => router.push('/(auth)/forgot-password')}>
              <Text style={{ color: Colors.primary, fontSize: 13, fontWeight: '600' }}>Quên mật khẩu?</Text>
            </Pressable>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(200).springify()} style={{ gap: 14 }}>
            <Button title="Đăng nhập" onPress={handleSubmit(onSubmit)} loading={isPending} />
            <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 4 }}>
              <Text style={{ fontSize: 14, color: Colors.textSecondary }}>Chưa có tài khoản?</Text>
              <Pressable onPress={() => router.push('/(auth)/register')}>
                <Text style={{ fontSize: 14, color: Colors.primary, fontWeight: '700' }}>Đăng ký</Text>
              </Pressable>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
