import { Button } from '@/components/ui/Button';
import { Colors } from '@/constants/Colors';
import { router } from 'expo-router';
import { Droplets, Shield, Star } from 'lucide-react-native';
import { Text, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

const FEATURES = [
  { icon: <Droplets size={20} color={Colors.primary} strokeWidth={1.5} />, text: 'Đặt lịch rửa xe dễ dàng' },
  { icon: <Star size={20} color={Colors.primary} strokeWidth={1.5} />, text: 'Tích điểm & nhận ưu đãi' },
  { icon: <Shield size={20} color={Colors.primary} strokeWidth={1.5} />, text: 'Theo dõi trạng thái xe thời gian thực' },
];

export default function WelcomeScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }}>
      <View style={{ flex: 1, padding: 28, justifyContent: 'space-between' }}>
        <Animated.View entering={FadeInDown.springify()} style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <View style={{
            width: 120, height: 120, borderRadius: 36,
            backgroundColor: Colors.primary,
            alignItems: 'center', justifyContent: 'center',
            marginBottom: 28,
            shadowColor: Colors.primary,
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.35,
            shadowRadius: 16,
            elevation: 10,
          }}>
            <Text style={{ fontSize: 56 }}>🚗</Text>
          </View>
          <Text style={{ fontSize: 36, fontWeight: '900', color: Colors.textPrimary, letterSpacing: -1 }}>WAVE</Text>
          <Text style={{ fontSize: 15, color: Colors.textSecondary, marginTop: 8, textAlign: 'center' }}>
            Wash Automation & Value Enhancement
          </Text>

          <View style={{ marginTop: 44, gap: 16, width: '100%' }}>
            {FEATURES.map((f, i) => (
              <Animated.View
                key={f.text}
                entering={FadeInDown.delay(100 + i * 80).springify()}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}
              >
                <View style={{ width: 42, height: 42, borderRadius: 12, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center' }}>
                  {f.icon}
                </View>
                <Text style={{ fontSize: 14, color: Colors.textPrimary, fontWeight: '500', flex: 1 }}>{f.text}</Text>
              </Animated.View>
            ))}
          </View>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(300).springify()} style={{ gap: 12 }}>
          <Button title="Bắt đầu" onPress={() => router.push('/(auth)/register')} />
          <Button title="Đã có tài khoản? Đăng nhập" variant="secondary" onPress={() => router.push('/(auth)/login')} />
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}
