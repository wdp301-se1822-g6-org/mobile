import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { WorkOrderCard } from '@/components/work-order/WorkOrderCard';
import { Colors } from '@/constants/Colors';
import { useMyWorkOrders } from '@/hooks/work-order/useWorkOrder';
import { useAuthStore } from '@/stores/useAuthStore';
import { WorkOrder, WorkOrderStatus } from '@/types/work-order';
import { router } from 'expo-router';
import { ClipboardList, Search, X } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Pressable, SectionList, Text, TextInput, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

const ACTIVE: WorkOrderStatus[] = ['in_progress'];
const DONE: WorkOrderStatus[] = ['done'];

function dayKey(iso?: string) {
  if (!iso) return '';
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function dayLabel(key: string) {
  if (!key) return 'Chưa rõ ngày';
  const today = dayKey(new Date().toISOString());
  if (key === today) return 'Hôm nay';
  const d = new Date(key + 'T00:00:00');
  return d.toLocaleDateString('vi-VN', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

type Section = { title: string; data: WorkOrder[] };

export default function MyOrdersScreen() {
  const { data: workOrders, isLoading, refetch } = useMyWorkOrders();
  const meId = useAuthStore((s) => s.authUser?.id);
  const meName = useAuthStore((s) => s.authUser?.name);
  const [query, setQuery] = useState('');

  const sections = useMemo<Section[]>(() => {
    // Chỉ lấy việc do chính nhân viên đang đăng nhập đảm nhận
    const all = (workOrders ?? []).filter((o) => o.assignedWasherId === meId);
    const q = query.trim().toLowerCase();
    const matches = (o: WorkOrder) =>
      !q ||
      (o.vehicleSnapshot?.plate ?? '').toLowerCase().includes(q) ||
      o.code.toLowerCase().includes(q);

    const active = all.filter((o) => ACTIVE.includes(o.status) && matches(o));
    const done = all.filter((o) => DONE.includes(o.status) && matches(o));

    // Nhóm "đã hoàn thành" theo ngày hoàn thành (mới nhất lên trước)
    const byDay = new Map<string, WorkOrder[]>();
    for (const o of done) {
      const key = dayKey(o.finishedAt ?? o.scheduledAt ?? o.createdAt);
      (byDay.get(key) ?? byDay.set(key, []).get(key)!).push(o);
    }
    const doneSections: Section[] = [...byDay.entries()]
      .sort((a, b) => b[0].localeCompare(a[0]))
      .map(([key, data]) => ({
        title: dayLabel(key),
        data: data.sort((a, b) =>
          (b.finishedAt ?? b.scheduledAt ?? '').localeCompare(
            a.finishedAt ?? a.scheduledAt ?? '',
          ),
        ),
      }));

    return [
      ...(active.length ? [{ title: 'Đang xử lý', data: active }] : []),
      ...doneSections,
    ];
  }, [workOrders, query, meId]);

  const isEmpty = !sections.length;

  return (
    <SafeAreaView
      edges={['top']}
      style={{ flex: 1, backgroundColor: Colors.background }}
    >
      <View style={{ padding: 16, paddingBottom: 8 }}>
        <Text
          style={{ fontSize: 22, fontWeight: '700', color: Colors.textPrimary }}
        >
          Công việc của tôi
        </Text>
      </View>

      {/* Search */}
      <View style={{ paddingHorizontal: 16, paddingBottom: 12 }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            backgroundColor: Colors.surface,
            borderRadius: 12,
            paddingHorizontal: 12,
            height: 44,
            borderWidth: 1,
            borderColor: Colors.border,
          }}
        >
          <Search size={18} color={Colors.textSecondary} strokeWidth={1.5} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Tìm biển số xe hoặc mã phiếu"
            placeholderTextColor={Colors.textDisabled}
            autoCapitalize="characters"
            style={{
              flex: 1,
              fontSize: 14,
              color: Colors.textPrimary,
              paddingVertical: 0,
            }}
          />
          {query ? (
            <Pressable onPress={() => setQuery('')} hitSlop={8}>
              <X size={18} color={Colors.textSecondary} strokeWidth={1.5} />
            </Pressable>
          ) : null}
        </View>
      </View>

      {isLoading ? (
        <LoadingSpinner />
      ) : isEmpty ? (
        <EmptyState
          icon={ClipboardList}
          title={query ? 'Không tìm thấy' : 'Chưa có công việc'}
          description={
            query ? 'Thử từ khoá khác' : 'Nhận việc từ hàng chờ để bắt đầu'
          }
        />
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16, paddingTop: 0, gap: 12 }}
          showsVerticalScrollIndicator={false}
          onRefresh={refetch}
          refreshing={isLoading}
          stickySectionHeadersEnabled={false}
          renderSectionHeader={({ section }) => (
            <Text
              style={{
                fontSize: 13,
                fontWeight: '700',
                color: Colors.textSecondary,
                marginTop: 8,
                marginBottom: 4,
              }}
            >
              {section.title} · {section.data.length}
            </Text>
          )}
          renderItem={({ item, index }) => (
            <Animated.View
              entering={FadeInDown.delay(Math.min(index, 8) * 50).springify()}
            >
              <WorkOrderCard
                workOrder={item}
                washerName={meName}
                onPress={() =>
                  router.push({
                    pathname: '/work-order/[id]',
                    params: { id: item.id },
                  })
                }
              />
            </Animated.View>
          )}
        />
      )}
    </SafeAreaView>
  );
}
