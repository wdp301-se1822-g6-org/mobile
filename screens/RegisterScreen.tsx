import { Button } from '@/components/ui/Button';
import { Colors } from '@/constants/Colors';
import { useRegister } from '@/hooks/auth/useAuth';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { Eye, EyeOff, Lock, Mail, Phone, User } from 'lucide-react-native';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { z } from 'zod';

const registerSchema = z.object({
  name: z.string().min(2, 'Họ tên tối thiểu 2 ký tự'),
  phone: z.string().regex(/^(0|\+84)[3-9][0-9]{8}$/, 'Số điện thoại không hợp lệ'),
  email: z.email('Email không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu tối thiểu 6 ký tự'),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, { path: ['confirmPassword'], message: 'Mật khẩu không khớp' });

type RegisterInput = z.infer<typeof registerSchema>;

export default function RegisterScreen() {
  const [showPw, setShowPw] = useState(false);
  const { mutateAsync: register, isPending } = useRegister();

  const { control, handleSubmit, formState: { errors } } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterInput) => {
    try {
      await register({ name: data.name, phone: data.phone, email: data.email, password: data.password });
      Toast.show({ type: 'success', text1: 'Đăng ký thành công' });
      router.replace('/(tabs)/home');
    } catch {
      Toast.show({ type: 'error', text1: 'Đăng ký thất bại', text2: 'Email có thể đã tồn tại' });
    }
  };

  const fields: { name: keyof RegisterInput; label: string; placeholder: string; icon: React.ReactNode; secure?: boolean; keyboardType?: any }[] = [
    { name: 'name', label: 'HỌ VÀ TÊN', placeholder: 'Nguyễn Văn A', icon: <User size={18} color={Colors.textDisabled} strokeWidth={1.5} /> },
    { name: 'phone', label: 'SỐ ĐIỆN THOẠI', placeholder: '0901234567', icon: <Phone size={18} color={Colors.textDisabled} strokeWidth={1.5} />, keyboardType: 'phone-pad' },
    { name: 'email', label: 'EMAIL', placeholder: 'example@email.com', icon: <Mail size={18} color={Colors.textDisabled} strokeWidth={1.5} />, keyboardType: 'email-address' },
    { name: 'password', label: 'MẬT KHẨU', placeholder: '••••••••', icon: <Lock size={18} color={Colors.textDisabled} strokeWidth={1.5} />, secure: true },
    { name: 'confirmPassword', label: 'XÁC NHẬN MẬT KHẨU', placeholder: '••••••••', icon: <Lock size={18} color={Colors.textDisabled} strokeWidth={1.5} />, secure: true },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={{ padding: 24, paddingTop: 32 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <Animated.View entering={FadeInDown.springify()} style={{ marginBottom: 28 }}>
            <Text style={{ fontSize: 26, fontWeight: '800', color: Colors.textPrimary }}>Tạo tài khoản</Text>
            <Text style={{ fontSize: 14, color: Colors.textSecondary, marginTop: 4 }}>Đăng ký để bắt đầu sử dụng WAVE</Text>
          </Animated.View>

          <View style={{ gap: 14 }}>
            {fields.map((f, i) => (
              <Animated.View key={f.name} entering={FadeInDown.delay(60 + i * 60).springify()}>
                <Text style={{ fontSize: 13, fontWeight: '600', color: Colors.textSecondary, marginBottom: 8 }}>{f.label}</Text>
                <Controller
                  control={control}
                  name={f.name}
                  render={({ field: { onChange, value } }) => (
                    <View style={{
                      flexDirection: 'row', alignItems: 'center', gap: 12,
                      backgroundColor: Colors.surface, borderRadius: 12, padding: 14,
                      borderWidth: 1.5, borderColor: errors[f.name] ? Colors.danger : Colors.border,
                    }}>
                      {f.icon}
                      <TextInput
                        value={value as string}
                        onChangeText={onChange}
                        placeholder={f.placeholder}
                        placeholderTextColor={Colors.textDisabled}
                        secureTextEntry={f.secure && !showPw}
                        keyboardType={f.keyboardType}
                        autoCapitalize={f.keyboardType === 'email-address' ? 'none' : 'words'}
                        style={{ flex: 1, fontSize: 14, color: Colors.textPrimary }}
                      />
                      {f.secure && (
                        <Pressable onPress={() => setShowPw((p) => !p)}>
                          {showPw ? <EyeOff size={18} color={Colors.textDisabled} strokeWidth={1.5} /> : <Eye size={18} color={Colors.textDisabled} strokeWidth={1.5} />}
                        </Pressable>
                      )}
                    </View>
                  )}
                />
                {errors[f.name] && (
                  <Text style={{ color: Colors.danger, fontSize: 12, marginTop: 4 }}>{errors[f.name]?.message}</Text>
                )}
              </Animated.View>
            ))}
          </View>

          <Animated.View entering={FadeInDown.delay(400).springify()} style={{ gap: 14, marginTop: 24 }}>
            <Button title="Đăng ký" onPress={handleSubmit(onSubmit)} loading={isPending} />
            <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 4 }}>
              <Text style={{ fontSize: 14, color: Colors.textSecondary }}>Đã có tài khoản?</Text>
              <Pressable onPress={() => router.push('/(auth)/login')}>
                <Text style={{ fontSize: 14, color: Colors.primary, fontWeight: '700' }}>Đăng nhập</Text>
              </Pressable>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
