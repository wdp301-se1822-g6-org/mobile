import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Colors } from '@/constants/Colors';
import { useLoyaltyAccount } from '@/hooks/loyalty/useLoyalty';
import { useServiceTypes } from '@/hooks/useServiceTypes';
import { useAuthStore } from '@/stores/useAuthStore';
import { ServiceType } from '@/types/service';
import { formatPrice } from '@/utils/formatters';
import { router } from 'expo-router';
import { Clock, Droplets, Star } from 'lucide-react-native';
import { ScrollView, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

function ServiceCard({ service, index }: { service: ServiceType; index: number }) {
  return (
    <Animated.View
      entering={FadeInDown.delay(index * 80).springify()}
      style={{
        backgroundColor: Colors.surface,
        borderRadius: 16,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2,
      }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <View style={{
          width: 44, height: 44, borderRadius: 12,
          backgroundColor: Colors.primaryLight,
          alignItems: 'center', justifyContent: 'center',
        }}>
          <Droplets size={22} color={Colors.primary} strokeWidth={1.5} />
        </View>
        <Text style={{ fontSize: 17, fontWeight: '700', color: Colors.primary }}>
          {formatPrice(service.basePrice)}
        </Text>
      </View>
      <Text style={{ fontSize: 15, fontWeight: '600', color: Colors.textPrimary, marginTop: 10 }}>
        {service.name}
      </Text>
      {service.description ? (
        <Text style={{ fontSize: 13, color: Colors.textSecondary, marginTop: 4 }} numberOfLines={2}>
          {service.description}
        </Text>
      ) : null}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 8 }}>
        <Clock size={13} color={Colors.textSecondary} strokeWidth={1.5} />
        <Text style={{ fontSize: 12, color: Colors.textSecondary }}>{service.durationMinutes} phút</Text>
      </View>
      <Button
        title="Đặt ngay"
        onPress={() => router.push({ pathname: '/booking/new', params: { serviceId: service.id } })}
        className="mt-1"
      />
    </Animated.View>
  );
}

export default function HomeScreen() {
  const user = useAuthStore((s) => s.authUser);
  const { data: services, isLoading } = useServiceTypes();
  const { data: loyalty } = useLoyaltyAccount();

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: Colors.background }}>
      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Greeting */}
        <Animated.View entering={FadeInDown.springify()} style={{ marginBottom: 16 }}>
          <Text style={{ fontSize: 13, color: Colors.textSecondary }}>Xin chào,</Text>
          <Text style={{ fontSize: 22, fontWeight: '700', color: Colors.textPrimary }}>
            {user?.name ?? 'Bạn'} 👋
          </Text>
        </Animated.View>

        {/* Loyalty card */}
        {loyalty ? (
          <Animated.View
            entering={FadeInDown.delay(80).springify()}
            style={{
              backgroundColor: Colors.primary,
              borderRadius: 20,
              padding: 20,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 24,
            }}
          >
            <View>
              <Text style={{ color: 'rgba(255,255,255,0.75)', fontSize: 13 }}>Điểm tích lũy</Text>
              <Text style={{ color: Colors.white, fontSize: 30, fontWeight: '800', marginTop: 2 }}>
                {loyalty.pointsBalance.toLocaleString()}
              </Text>
              <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, marginTop: 2 }}>
                {loyalty.totalSuccessfulWashes} lần rửa xe
              </Text>
            </View>
            <View style={{ alignItems: 'flex-end', gap: 4 }}>
              <Star size={36} color="rgba(255,255,255,0.3)" strokeWidth={1.5} />
              <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 14, fontWeight: '700' }}>
                {loyalty.tierName.toUpperCase()}
              </Text>
            </View>
          </Animated.View>
        ) : null}

        {/* Services heading */}
        <Animated.View entering={FadeInDown.delay(120).springify()} style={{ marginBottom: 12 }}>
          <Text style={{ fontSize: 17, fontWeight: '700', color: Colors.textPrimary }}>Dịch vụ rửa xe</Text>
          <Text style={{ fontSize: 13, color: Colors.textSecondary, marginTop: 2 }}>Chọn gói phù hợp với xe của bạn</Text>
        </Animated.View>

        {isLoading ? (
          <LoadingSpinner />
        ) : !services?.length ? (
          <EmptyState icon={Droplets} title="Chưa có dịch vụ" description="Vui lòng quay lại sau" />
        ) : (
          <View style={{ gap: 12 }}>
            {services.map((s, i) => <ServiceCard key={s.id} service={s} index={i} />)}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
