import { CheckInCard } from '@/components/cashier/CheckInCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Colors } from '@/constants/Colors';
import { useCashierOrders } from '@/hooks/cashier/useCheckIn';
import { AdminOrder, OrderStatus } from '@/services/cashier.service';
import { router } from 'expo-router';
import { ArrowUpDown, Camera, Search, X } from 'lucide-react-native';
import { useCallback, useMemo, useState } from 'react';
import { Pressable, SectionList, Text, TextInput, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

type Filter = 'all' | 'pending' | 'checked_in';

// 'booked' = theo thời điểm đặt (createdAt, LIFO); 'scheduled' = theo giờ hẹn.
type SortKey = 'booked' | 'scheduled';

const FILTER_STATUS: Record<Filter, OrderStatus | undefined> = {
  all: undefined,
  pending: 'confirmed',
  checked_in: 'checked_in',
};

function dayKey(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return 'unknown';
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

function dayLabel(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return 'Không rõ ngày';
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);
  const sameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
  if (sameDay(d, today)) return 'Hôm nay';
  if (sameDay(d, yesterday)) return 'Hôm qua';
  if (sameDay(d, tomorrow)) return 'Ngày mai';
  return d.toLocaleDateString('vi-VN', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

type Section = {
  title: string;
  key: string;
  sortAt: number;
  data: AdminOrder[];
};

// Thời điểm đặt lịch để xếp LIFO. Ưu tiên createdAt (người đặt sau cùng lên
// đầu); nếu API admin chưa trả createdAt thì lùi về scheduledAt để danh sách
// vẫn có thứ tự ổn định.
function bookedAt(o: AdminOrder): number {
  return new Date(o.createdAt ?? o.scheduledAt).getTime() || 0;
}

function schedTime(o: AdminOrder): number {
  return new Date(o.scheduledAt).getTime() || 0;
}

function buildSections(items: AdminOrder[], sortKey: SortKey): Section[] {
  const map = new Map<string, Section>();
  for (const item of items) {
    const key = dayKey(item.scheduledAt);
    let section = map.get(key);
    if (!section) {
      section = {
        key,
        title: dayLabel(item.scheduledAt),
        sortAt: new Date(item.scheduledAt).getTime() || 0,
        data: [],
      };
      map.set(key, section);
    }
    section.data.push(item);
  }
  const sections = [...map.values()];
  if (sortKey === 'scheduled') {
    // Theo giờ hẹn: ngày hẹn mới nhất lên trên cùng, trong mỗi ngày giờ hẹn giảm dần.
    sections.sort((a, b) => b.sortAt - a.sortAt);
    for (const s of sections) {
      s.data.sort((a, b) => schedTime(b) - schedTime(a));
    }
  } else {
    // Theo giờ đặt (LIFO): ngày hẹn mới nhất lên trên cùng; trong mỗi ngày,
    // người đặt sau cùng (createdAt lớn nhất) nằm trên đầu.
    sections.sort((a, b) => b.sortAt - a.sortAt);
    for (const s of sections) {
      s.data.sort((a, b) => bookedAt(b) - bookedAt(a));
    }
  }
  return sections;
}

export default function CheckInScreen() {
  const [filter, setFilter] = useState<Filter>('all');
  const [sortKey, setSortKey] = useState<SortKey>('booked');
  const [search, setSearch] = useState('');
  const { data, isLoading, refetch } = useCashierOrders({
    status: FILTER_STATUS[filter],
    limit: 50,
  });

  // Chỉ hiện vòng xoay khi người dùng tự kéo refresh. Refetch do socket đẩy về
  // chạy ngầm, không được bật RefreshControl (trước đây dùng isRefetching nên
  // cứ mỗi lần refetch là màn hình lại xoay).
  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  }, [refetch]);

  const items = data?.data ?? [];

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (o) =>
        o.licensePlate?.toLowerCase().includes(q) ||
        o.customerName?.toLowerCase().includes(q),
    );
  }, [items, search]);

  const sections = useMemo(
    () => buildSections(filtered, sortKey),
    [filtered, sortKey],
  );
  const total = filtered.length;

  return (
    <SafeAreaView
      edges={['top']}
      style={{ flex: 1, backgroundColor: Colors.background }}
    >
      <View style={{ padding: 16, paddingBottom: 8 }}>
        <Text
          style={{ fontSize: 22, fontWeight: '700', color: Colors.textPrimary }}
        >
          Check-in xe
        </Text>
      </View>

      {/* Search bar + Sort */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
          paddingHorizontal: 16,
          paddingBottom: 8,
        }}
      >
        <View
          style={{
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            backgroundColor: Colors.surface,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: Colors.border,
            paddingHorizontal: 12,
            height: 44,
          }}
        >
          <Search size={18} color={Colors.textSecondary} strokeWidth={1.5} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Tìm biển số xe hoặc tên khách hàng"
            placeholderTextColor={Colors.textDisabled}
            autoCapitalize="characters"
            autoCorrect={false}
            style={{
              flex: 1,
              fontSize: 14,
              color: Colors.textPrimary,
              padding: 0,
            }}
          />
          {search.length > 0 && (
            <Pressable onPress={() => setSearch('')} hitSlop={8}>
              <X size={18} color={Colors.textSecondary} strokeWidth={1.5} />
            </Pressable>
          )}
        </View>

        {/* Nút sort: bấm để đổi giữa 'Giờ đặt' (LIFO) và 'Giờ hẹn'. */}
        <Pressable
          onPress={() =>
            setSortKey((k) => (k === 'booked' ? 'scheduled' : 'booked'))
          }
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            height: 44,
            paddingHorizontal: 12,
            borderRadius: 12,
            backgroundColor: Colors.surface,
            borderWidth: 1,
            borderColor: Colors.border,
          }}
        >
          <ArrowUpDown size={16} color={Colors.primary} strokeWidth={1.5} />
          <Text
            style={{
              fontSize: 13,
              fontWeight: '600',
              color: Colors.textPrimary,
            }}
          >
            {sortKey === 'booked' ? 'Giờ đặt' : 'Giờ hẹn'}
          </Text>
        </Pressable>
      </View>

      {/* Filter tabs */}
      <View
        style={{
          flexDirection: 'row',
          gap: 8,
          paddingHorizontal: 16,
          paddingBottom: 8,
        }}
      >
        {(
          [
            { key: 'all', label: 'Tất cả' },
            { key: 'pending', label: 'Chờ check-in' },
            { key: 'checked_in', label: 'Đã nhận xe' },
          ] as const
        ).map((tab) => {
          const active = filter === tab.key;
          return (
            <Pressable
              key={tab.key}
              onPress={() => setFilter(tab.key)}
              style={{
                paddingHorizontal: 14,
                paddingVertical: 7,
                borderRadius: 999,
                backgroundColor: active ? Colors.primary : Colors.surface,
                borderWidth: 1,
                borderColor: active ? Colors.primary : Colors.border,
              }}
            >
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: '600',
                  color: active ? Colors.white : Colors.textSecondary,
                }}
              >
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {isLoading ? (
        <LoadingSpinner />
      ) : !sections.length ? (
        <EmptyState
          icon={Camera}
          title={search.trim() ? 'Không tìm thấy' : 'Không có xe'}
          description={
            search.trim()
              ? 'Không có xe nào khớp với từ khoá tìm kiếm'
              : filter === 'pending'
                ? 'Chưa có xe nào cần check-in'
                : filter === 'checked_in'
                  ? 'Chưa có xe nào đã nhận'
                  : 'Chưa có lịch hẹn nào'
          }
        />
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16, paddingTop: 4 }}
          showsVerticalScrollIndicator={false}
          stickySectionHeadersEnabled={false}
          onRefresh={onRefresh}
          refreshing={refreshing}
          renderSectionHeader={({ section }) => (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 8,
                marginTop: 8,
                marginBottom: 10,
              }}
            >
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: '700',
                  color: Colors.textPrimary,
                  textTransform: 'capitalize',
                }}
              >
                {section.title}
              </Text>
              <View
                style={{ flex: 1, height: 1, backgroundColor: Colors.border }}
              />
              <Text style={{ fontSize: 12, color: Colors.textSecondary }}>
                {section.data.length} xe
              </Text>
            </View>
          )}
          renderItem={({ item, index }) => (
            <Animated.View
              entering={FadeInDown.delay(index * 40).springify()}
              style={{ marginBottom: 12 }}
            >
              <CheckInCard
                order={item}
                onPress={() =>
                  router.push({
                    pathname: '/check-in/[id]' as any,
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
