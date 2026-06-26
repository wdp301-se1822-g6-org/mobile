import { WorkOrderCard } from '@/components/work-order/WorkOrderCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Colors } from '@/constants/Colors';
import { useMyWorkOrders } from '@/hooks/work-order/useWorkOrder';
import { router } from 'expo-router';
import { ListOrdered } from 'lucide-react-native';
import { FlatList, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function QueueScreen() {
  const { data: workOrders, isLoading, refetch } = useMyWorkOrders();
  const waiting = workOrders?.filter((o) => o.status === 'waiting') ?? [];

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: Colors.background }}>
      <View style={{ padding: 16, paddingBottom: 8 }}>
        <Text style={{ fontSize: 22, fontWeight: '700', color: Colors.textPrimary }}>Hàng chờ</Text>
        <Text style={{ fontSize: 13, color: Colors.textSecondary, marginTop: 2 }}>
          {waiting.length} xe đang chờ rửa
        </Text>
      </View>

      {isLoading ? <LoadingSpinner /> : !waiting.length ? (
        <EmptyState icon={ListOrdered} title="Không có xe chờ" description="Hàng chờ đang trống" />
      ) : (
        <FlatList
          data={waiting}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16, gap: 12 }}
          showsVerticalScrollIndicator={false}
          onRefresh={refetch}
          refreshing={isLoading}
          renderItem={({ item, index }) => (
            <Animated.View entering={FadeInDown.delay(index * 60).springify()}>
              <WorkOrderCard
                workOrder={item}
                onPress={() => router.push({ pathname: '/work-order/[id]', params: { id: item.id } })}
              />
            </Animated.View>
          )}
        />
      )}
    </SafeAreaView>
  );
}
