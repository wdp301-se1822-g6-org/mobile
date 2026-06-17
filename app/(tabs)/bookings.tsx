import { OrderCard } from '@/components/booking/OrderCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Colors } from '@/constants/Colors';
import { useOrders } from '@/hooks/booking/useBooking';
import { Order, OrderStatus } from '@/types/booking';
import { router } from 'expo-router';
import { CalendarCheck, Plus } from 'lucide-react-native';
import { useState } from 'react';
import { FlatList, Pressable, ScrollView, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

const FILTERS: { label: string; value: OrderStatus | 'all' }[] = [
  { label: 'Tất cả', value: 'all' },
  { label: 'Chờ', value: 'pending' },
  { label: 'Xác nhận', value: 'confirmed' },
  { label: 'Hoàn thành', value: 'completed' },
  { label: 'Đã huỷ', value: 'cancelled' },
];

export default function BookingsScreen() {
  const { data: orders, isLoading } = useOrders();
  const [filter, setFilter] = useState<OrderStatus | 'all'>('all');

  const filtered = filter === 'all'
    ? orders ?? []
    : (orders ?? []).filter((o: Order) => o.status === filter);

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: Colors.background }}>
      {/* Header */}
      <View style={{
        backgroundColor: Colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 14, paddingBottom: 12 }}>
          <Text style={{ fontSize: 20, fontWeight: '700', color: Colors.textPrimary }}>Lịch đặt xe</Text>
          <Pressable
            onPress={() => router.push('/booking/new')}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: Colors.primary, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8 }}
          >
            <Plus size={15} color={Colors.white} strokeWidth={2.5} />
            <Text style={{ color: Colors.white, fontSize: 13, fontWeight: '600' }}>Đặt lịch</Text>
          </Pressable>
        </View>

        {/* Filter chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 12, gap: 8 }}
        >
          {FILTERS.map((f) => (
            <Pressable
              key={f.value}
              onPress={() => setFilter(f.value)}
              style={{
                paddingHorizontal: 16, paddingVertical: 6, borderRadius: 999,
                backgroundColor: filter === f.value ? Colors.primary : Colors.background,
                borderWidth: 1.5, borderColor: filter === f.value ? Colors.primary : Colors.border,
              }}
            >
              <Text style={{ fontSize: 13, fontWeight: '600', color: filter === f.value ? Colors.white : Colors.textSecondary }}>
                {f.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {isLoading ? <LoadingSpinner /> : !filtered.length ? (
        <EmptyState
          icon={CalendarCheck}
          title="Chưa có lịch đặt"
          description="Nhấn 'Đặt lịch' để bắt đầu"
        />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16, gap: 12 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item, index }) => (
            <Animated.View entering={FadeInDown.delay(index * 60).springify()}>
              <OrderCard
                order={item}
                onPress={() => router.push({ pathname: '/booking/[id]', params: { id: item.id } })}
              />
            </Animated.View>
          )}
        />
      )}
    </SafeAreaView>
  );
}
