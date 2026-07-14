import { OrderCard } from '@/components/booking/OrderCard';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Colors } from '@/constants/Colors';
import { useOrders } from '@/hooks/booking/useBooking';
import { useLocale, useT } from '@/i18n/useT';
import { Order, OrderStatus } from '@/types/booking';
import { router } from 'expo-router';
import { CalendarCheck, Plus, Waves } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, SectionList, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

const FILTERS: { value: OrderStatus | 'all'; labelKey: string }[] = [
  { value: 'all',         labelKey: 'bookings.filterAll' },
  { value: 'pending',     labelKey: 'bookings.filterPending' },
  { value: 'confirmed',   labelKey: 'bookings.filterConfirmed' },
  { value: 'in_progress', labelKey: 'bookings.filterInProgress' },
  { value: 'completed',   labelKey: 'bookings.filterCompleted' },
  { value: 'cancelled',   labelKey: 'bookings.filterCancelled' },
];

type DaySection = { key: string; day: number; past: boolean; data: Order[] };

const DAY_MS = 86400000;

function startOfDay(value: string | number | Date): number {
  const d = new Date(value);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

/** One section per calendar day: future days ascending, then past days descending. */
function groupByDay(orders: Order[]): DaySection[] {
  const today = startOfDay(Date.now());
  const byDay = new Map<number, Order[]>();

  for (const o of orders) {
    const day = startOfDay(o.scheduledAt);
    const bucket = byDay.get(day);
    if (bucket) bucket.push(o);
    else byDay.set(day, [o]);
  }

  const upcoming: DaySection[] = [];
  const past: DaySection[] = [];

  for (const [day, list] of byDay) {
    const isPast = day < today;
    list.sort((a, b) => {
      const at = new Date(a.scheduledAt).getTime();
      const bt = new Date(b.scheduledAt).getTime();
      return isPast ? bt - at : at - bt;
    });
    (isPast ? past : upcoming).push({ key: String(day), day, past: isPast, data: list });
  }

  upcoming.sort((a, b) => a.day - b.day);
  past.sort((a, b) => b.day - a.day);
  return [...upcoming, ...past];
}

function useDayLabel() {
  const t = useT();
  const locale = useLocale();
  const tag = locale === 'vi' ? 'vi-VN' : 'en-US';

  return (day: number): { title: string; sub: string } => {
    const date = new Date(day);
    const sub = date.toLocaleDateString(tag, { day: '2-digit', month: '2-digit', year: 'numeric' });
    const offset = Math.round((day - startOfDay(Date.now())) / DAY_MS);

    if (offset === 0) return { title: t('bookings.today'), sub };
    if (offset === 1) return { title: t('bookings.tomorrow'), sub };
    if (offset === -1) return { title: t('bookings.yesterday'), sub };
    return { title: date.toLocaleDateString(tag, { weekday: 'long' }), sub };
  };
}

function DayHeader({ title, sub, count, past }: { title: string; sub: string; count: number; past: boolean }) {
  return (
    <View style={{
      backgroundColor: Colors.background,
      flexDirection: 'row', alignItems: 'center', gap: 8,
      paddingTop: 16, paddingBottom: 8,
    }}>
      <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: past ? Colors.textDisabled : Colors.primary }} />
      <Text style={{ fontSize: 14, fontWeight: '800', color: past ? Colors.textSecondary : Colors.textPrimary }}>
        {title}
      </Text>
      <Text style={{ fontSize: 12, color: Colors.textSecondary }}>{sub}</Text>
      <View style={{ flex: 1, height: 1, backgroundColor: Colors.border, marginHorizontal: 2 }} />
      <View style={{ backgroundColor: Colors.border, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2 }}>
        <Text style={{ fontSize: 11, fontWeight: '700', color: Colors.textSecondary }}>{count}</Text>
      </View>
    </View>
  );
}

function EmptyHero() {
  const t = useT();
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, marginTop: 24 }}>
      <View style={{ position: 'relative', width: 160, height: 160, marginBottom: 24 }}>
        <View style={{
          position: 'absolute', width: 160, height: 160, borderRadius: 80,
          backgroundColor: Colors.primaryLight,
        }} />
        <View style={{
          position: 'absolute', top: 20, left: 20,
          width: 120, height: 120, borderRadius: 60,
          backgroundColor: Colors.primaryMid,
        }} />
        <View style={{
          position: 'absolute', top: 40, left: 40,
          width: 80, height: 80, borderRadius: 40,
          backgroundColor: Colors.primary,
          alignItems: 'center', justifyContent: 'center',
        }}>
          <Waves size={40} color={Colors.white} strokeWidth={1.5} />
        </View>
      </View>

      <Text style={{ fontSize: 18, fontWeight: '800', color: Colors.textPrimary, marginBottom: 8 }}>
        {t('bookings.empty')}
      </Text>
      <Text style={{ fontSize: 13, color: Colors.textSecondary, textAlign: 'center', lineHeight: 19, marginBottom: 20, maxWidth: 280 }}>
        {t('bookings.emptySub')}
      </Text>

      <Pressable
        onPress={() => router.push('/booking/new')}
        style={{
          backgroundColor: Colors.primary,
          borderRadius: 14,
          paddingHorizontal: 22, paddingVertical: 12,
          flexDirection: 'row', alignItems: 'center', gap: 8,
          shadowColor: Colors.primary,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 4,
        }}
      >
        <Plus size={16} color={Colors.white} strokeWidth={2.5} />
        <Text style={{ color: Colors.white, fontWeight: '700', fontSize: 14 }}>{t('bookings.emptyAction')}</Text>
      </Pressable>
    </View>
  );
}

export default function BookingsScreen() {
  const t = useT();
  const dayLabel = useDayLabel();
  const { data: orders, isLoading } = useOrders();
  const [filter, setFilter] = useState<OrderStatus | 'all'>('all');

  const filtered = useMemo(() => {
    const list = orders ?? [];
    if (filter === 'all') return list;
    return list.filter((o) => o.status === filter);
  }, [orders, filter]);

  const sections = useMemo(() => groupByDay(filtered), [filtered]);

  const hasAny = (orders?.length ?? 0) > 0;

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: Colors.background }}>
      {/* Header */}
      <View style={{ paddingHorizontal: 16, paddingTop: 14, paddingBottom: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View>
          <Text style={{ fontSize: 24, fontWeight: '900', color: Colors.textPrimary, letterSpacing: -0.5 }}>
            {t('bookings.title')}
          </Text>
          {hasAny ? (
            <Text style={{ fontSize: 12, color: Colors.textSecondary, marginTop: 2 }}>
              {t('bookings.count', { n: orders?.length ?? 0 })}
            </Text>
          ) : null}
        </View>
        <Pressable
          onPress={() => router.push('/booking/new')}
          style={{
            flexDirection: 'row', alignItems: 'center', gap: 6,
            backgroundColor: Colors.primary, borderRadius: 12,
            paddingHorizontal: 14, paddingVertical: 10,
            shadowColor: Colors.primary, shadowOffset: { width: 0, height: 3 },
            shadowOpacity: 0.3, shadowRadius: 6, elevation: 3,
          }}
        >
          <Plus size={15} color={Colors.white} strokeWidth={2.5} />
          <Text style={{ color: Colors.white, fontSize: 13, fontWeight: '700' }}>{t('bookings.newBooking')}</Text>
        </Pressable>
      </View>

      {/* Filter chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ flexGrow: 0, flexShrink: 0 }}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 12, gap: 8, alignItems: 'center' }}
      >
        {FILTERS.map((f) => {
          const active = filter === f.value;
          return (
            <Pressable
              key={f.value}
              onPress={() => setFilter(f.value)}
              style={{
                paddingHorizontal: 14, paddingVertical: 7, borderRadius: 999,
                backgroundColor: active ? Colors.primary : Colors.surface,
                borderWidth: 1.5, borderColor: active ? Colors.primary : Colors.border,
              }}
            >
              <Text style={{ fontSize: 12, fontWeight: '700', color: active ? Colors.white : Colors.textSecondary }}>
                {t(f.labelKey as any)}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {isLoading ? (
        <LoadingSpinner />
      ) : !hasAny ? (
        <EmptyHero />
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(o) => o.id}
          stickySectionHeadersEnabled
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
          renderSectionHeader={({ section }) => {
            const { title, sub } = dayLabel(section.day);
            return <DayHeader title={title} sub={sub} count={section.data.length} past={section.past} />;
          }}
          renderItem={({ item, index }) => (
            <Animated.View entering={FadeInDown.delay(Math.min(index, 6) * 50).springify()} style={{ marginBottom: 10 }}>
              <OrderCard
                order={item}
                showDate={false}
                onPress={() => router.push({ pathname: '/booking/[id]', params: { id: item.id } })}
              />
            </Animated.View>
          )}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', paddingVertical: 60 }}>
              <CalendarCheck size={48} color={Colors.textDisabled} strokeWidth={1.5} />
              <Text style={{ fontSize: 14, color: Colors.textSecondary, marginTop: 12 }}>
                {t('bookings.empty')}
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}
