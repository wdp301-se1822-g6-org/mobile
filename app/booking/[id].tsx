import { StatusBadge } from '@/components/booking/StatusBadge';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Colors } from '@/constants/Colors';
import { useCancelOrder, useOrder } from '@/hooks/booking/useBooking';
import { formatPrice } from '@/utils/formatters';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Calendar, Car, CreditCard, Clock } from 'lucide-react-native';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

export default function BookingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: order, isLoading } = useOrder(id);
  const { mutateAsync: cancelOrder, isPending: cancelling } = useCancelOrder();

  const handleCancel = () => {
    Alert.alert('Huỷ đặt lịch', 'Bạn có chắc muốn huỷ lịch rửa xe này?', [
      { text: 'Không', style: 'cancel' },
      {
        text: 'Huỷ lịch', style: 'destructive',
        onPress: async () => {
          try {
            await cancelOrder(id);
            Toast.show({ type: 'success', text1: 'Đã huỷ lịch' });
            router.back();
          } catch {
            Toast.show({ type: 'error', text1: 'Không thể huỷ lịch' });
          }
        },
      },
    ]);
  };

  if (isLoading) return <LoadingSpinner />;
  if (!order) return null;

  const canCancel = ['pending', 'confirmed'].includes(order.status);
  const date = new Date(order.scheduledAt);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 }}>
        <Pressable onPress={() => router.back()} style={{ padding: 4 }}>
          <ArrowLeft size={22} color={Colors.textPrimary} strokeWidth={1.5} />
        </Pressable>
        <Text style={{ fontSize: 17, fontWeight: '700', color: Colors.textPrimary, flex: 1 }}>
          Chi tiết đặt lịch
        </Text>
        <StatusBadge status={order.status} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32, gap: 16 }} showsVerticalScrollIndicator={false}>
        {/* Service info */}
        <Animated.View
          entering={FadeInDown.springify()}
          style={{ backgroundColor: Colors.surface, borderRadius: 16, padding: 16, gap: 14,
            shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 }}
        >
          <Text style={{ fontSize: 16, fontWeight: '700', color: Colors.textPrimary }}>{order.serviceName}</Text>

          {[
            { icon: <Car size={16} color={Colors.textSecondary} strokeWidth={1.5} />, label: 'Xe', value: order.vehicleTypeName ? `${order.licensePlate} · ${order.vehicleTypeName}` : order.licensePlate },
            { icon: <Calendar size={16} color={Colors.textSecondary} strokeWidth={1.5} />, label: 'Ngày', value: date.toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' }) },
            { icon: <Clock size={16} color={Colors.textSecondary} strokeWidth={1.5} />, label: 'Giờ', value: `${date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}${order.estimatedMinutes ? ` (~${order.estimatedMinutes} phút)` : ''}` },
            { icon: <CreditCard size={16} color={Colors.textSecondary} strokeWidth={1.5} />, label: 'Thanh toán', value: order.paymentMethod === 'cash' ? 'Tiền mặt' : 'Online' },
          ].map((row) => (
            <View key={row.label} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              {row.icon}
              <Text style={{ color: Colors.textSecondary, fontSize: 13, width: 90 }}>{row.label}</Text>
              <Text style={{ flex: 1, fontSize: 13, fontWeight: '500', color: Colors.textPrimary }}>{row.value}</Text>
            </View>
          ))}
        </Animated.View>

        {/* Pricing */}
        <Animated.View
          entering={FadeInDown.delay(80).springify()}
          style={{ backgroundColor: Colors.surface, borderRadius: 16, padding: 16, gap: 10,
            shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 }}
        >
          <Text style={{ fontSize: 14, fontWeight: '600', color: Colors.textPrimary }}>Thanh toán</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ color: Colors.textSecondary, fontSize: 13 }}>Giá gốc</Text>
            <Text style={{ color: Colors.textPrimary, fontSize: 13 }}>{formatPrice(order.originalAmount)}</Text>
          </View>
          {order.discountAmount > 0 && (
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ color: Colors.textSecondary, fontSize: 13 }}>
                Giảm giá{order.discountReason ? ` (${order.discountReason})` : ''}
              </Text>
              <Text style={{ color: Colors.success, fontSize: 13, fontWeight: '600' }}>-{formatPrice(order.discountAmount)}</Text>
            </View>
          )}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingTop: 8, borderTopWidth: 1, borderTopColor: Colors.border }}>
            <Text style={{ fontSize: 15, fontWeight: '600', color: Colors.textPrimary }}>Tổng cộng</Text>
            <Text style={{ fontSize: 17, fontWeight: '800', color: Colors.primary }}>{formatPrice(order.amount)}</Text>
          </View>
        </Animated.View>

        {/* Cancel reason */}
        {order.cancelReason && (
          <Animated.View
            entering={FadeInDown.delay(160).springify()}
            style={{ backgroundColor: '#FEE2E2', borderRadius: 12, padding: 14 }}
          >
            <Text style={{ fontSize: 13, fontWeight: '600', color: Colors.danger, marginBottom: 4 }}>Lý do huỷ</Text>
            <Text style={{ fontSize: 13, color: Colors.danger }}>{order.cancelReason}</Text>
          </Animated.View>
        )}

        {/* Actions */}
        {canCancel && (
          <Animated.View entering={FadeInDown.delay(120).springify()} style={{ gap: 10 }}>
            <Button
              title="Đổi lịch"
              variant="secondary"
              onPress={() => router.push({ pathname: '/booking/reschedule', params: { id: order.id } })}
            />
            <Button
              title="Huỷ đặt lịch"
              variant="danger"
              onPress={handleCancel}
              loading={cancelling}
            />
          </Animated.View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
