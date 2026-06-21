import { Button } from '@/components/ui/Button';
import { Colors } from '@/constants/Colors';
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
      Toast.show({ type: 'success', text1: 'Đã gửi mã OTP', text2: 'Kiểm tra hộp thư của bạn' });
      setStep('otp');
      setTimeout(() => otpRef.current?.focus(), 300);
    } catch {
      Toast.show({ type: 'error', text1: 'Không thể gửi OTP', text2: 'Kiểm tra lại email' });
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length < 6) return;
    try {
      await verifyOtp({ email, code: otp });
      Toast.show({ type: 'success', text1: 'Xác thực thành công' });
      router.replace('/(auth)/login');
    } catch {
      Toast.show({ type: 'error', text1: 'Mã OTP không đúng hoặc đã hết hạn' });
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={{ padding: 24, flex: 1 }}>
          {/* Back */}
          <Pressable onPress={() => step === 'otp' ? setStep('email') : router.back()} style={{ padding: 4, alignSelf: 'flex-start', marginBottom: 28 }}>
            <ArrowLeft size={22} color={Colors.textPrimary} strokeWidth={1.5} />
          </Pressable>

          {/* STEP: Email */}
          {step === 'email' && (
            <Animated.View entering={SlideInRight.springify()} style={{ flex: 1 }}>
              <View style={{ width: 56, height: 56, borderRadius: 16, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                <Mail size={26} color={Colors.primary} strokeWidth={1.5} />
              </View>
              <Text style={{ fontSize: 24, fontWeight: '800', color: Colors.textPrimary }}>Quên mật khẩu?</Text>
              <Text style={{ fontSize: 14, color: Colors.textSecondary, marginTop: 8, lineHeight: 20 }}>
                Nhập email đăng ký của bạn. Chúng tôi sẽ gửi mã OTP để xác thực.
              </Text>

              <Animated.View entering={FadeInDown.delay(100).springify()} style={{ marginTop: 32 }}>
                <Text style={{ fontSize: 13, fontWeight: '600', color: Colors.textSecondary, marginBottom: 8 }}>EMAIL</Text>
                <View style={{
                  flexDirection: 'row', alignItems: 'center', gap: 12,
                  backgroundColor: Colors.surface, borderRadius: 12, padding: 14,
                  borderWidth: 1.5, borderColor: email ? Colors.primary : Colors.border,
                }}>
                  <Mail size={18} color={Colors.textDisabled} strokeWidth={1.5} />
                  <TextInput
                    value={email}
                    onChangeText={setEmail}
                    placeholder="example@email.com"
                    placeholderTextColor={Colors.textDisabled}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    style={{ flex: 1, fontSize: 14, color: Colors.textPrimary }}
                  />
                </View>
              </Animated.View>

              <Animated.View entering={FadeInDown.delay(160).springify()} style={{ marginTop: 24 }}>
                <Button title="Gửi mã OTP" onPress={handleSendOtp} loading={sending} disabled={!email.trim()} />
              </Animated.View>
            </Animated.View>
          )}

          {/* STEP: OTP */}
          {step === 'otp' && (
            <Animated.View entering={SlideInRight.springify()} style={{ flex: 1 }}>
              <View style={{ width: 56, height: 56, borderRadius: 16, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                <KeyRound size={26} color={Colors.primary} strokeWidth={1.5} />
              </View>
              <Text style={{ fontSize: 24, fontWeight: '800', color: Colors.textPrimary }}>Nhập mã OTP</Text>
              <Text style={{ fontSize: 14, color: Colors.textSecondary, marginTop: 8, lineHeight: 20 }}>
                Mã 6 số đã được gửi đến{'\n'}
                <Text style={{ color: Colors.primary, fontWeight: '600' }}>{email}</Text>
              </Text>

              <Animated.View entering={FadeInDown.delay(100).springify()} style={{ marginTop: 32 }}>
                <Text style={{ fontSize: 13, fontWeight: '600', color: Colors.textSecondary, marginBottom: 8 }}>MÃ OTP</Text>
                <TextInput
                  ref={otpRef}
                  value={otp}
                  onChangeText={(t) => setOtp(t.replace(/\D/g, '').slice(0, 6))}
                  placeholder="123456"
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
                <Button title="Xác nhận" onPress={handleVerifyOtp} loading={verifying} disabled={otp.length < 6} />
                <Pressable onPress={handleSendOtp} disabled={sending} style={{ alignItems: 'center', paddingVertical: 8 }}>
                  <Text style={{ color: Colors.primary, fontSize: 14, fontWeight: '600' }}>
                    {sending ? 'Đang gửi lại...' : 'Gửi lại mã OTP'}
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
