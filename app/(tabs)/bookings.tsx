import { OrderCard } from '@/components/booking/OrderCard';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Colors } from '@/constants/Colors';
import { useT } from '@/i18n/useT';
import { useOrders } from '@/hooks/booking/useBooking';
import { Order, OrderStatus } from '@/types/booking';
import { router } from 'expo-router';
import { CalendarCheck, ChevronRight, Clock, Plus, Sparkles, Waves } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, ScrollView, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

const UPCOMING_STATUSES: OrderStatus[] = ['pending', 'confirmed', 'in_progress'];

const FILTERS: { value: OrderStatus | 'all'; labelKey: string }[] = [
  { value: 'all',         labelKey: 'bookings.filterAll' },
  { value: 'pending',     labelKey: 'bookings.filterPending' },
  { value: 'confirmed',   labelKey: 'bookings.filterConfirmed' },
  { value: 'in_progress', labelKey: 'bookings.filterInProgress' },
  { value: 'completed',   labelKey: 'bookings.filterCompleted' },
  { value: 'cancelled',   labelKey: 'bookings.filterCancelled' },
];

function formatCountdown(target: Date, t: ReturnType<typeof useT>): string {
  const diffMs = target.getTime() - Date.now();
  if (diffMs <= 0) return t('bookings.now');
  const totalMin = Math.floor(diffMs / 60000);
  const days = Math.floor(totalMin / (60 * 24));
  const hours = Math.floor((totalMin - days * 24 * 60) / 60);
  const mins = totalMin - days * 24 * 60 - hours * 60;
  if (days > 0) return `${t('bookings.countdown')} ${days}${t('bookings.day')} ${hours}${t('bookings.hour')}`;
  if (hours > 0) return `${t('bookings.countdown')} ${hours}${t('bookings.hour')} ${mins}${t('bookings.min')}`;
  return `${t('bookings.countdown')} ${mins}${t('bookings.min')}`;
}

function NextBookingHero({ order }: { order: Order }) {
  const t = useT();
  const date = new Date(order.scheduledAt);
  const dateLabel = date.toLocaleDateString(undefined, { weekday: 'short', day: '2-digit', month: '2-digit' });
  const timeLabel = date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });

  return (
    <Pressable
      onPress={() => router.push({ pathname: '/booking/[id]', params: { id: order.id } })}
      style={{
        backgroundColor: Colors.primary,
        borderRadius: 22,
        padding: 18,
        overflow: 'hidden',
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
        elevation: 5,
      }}
    >
      {/* Decorative shapes */}
      <View style={{ position: 'absolute', top: -25, right: -25, width: 110, height: 110, borderRadius: 55, backgroundColor: 'rgba(255,255,255,0.10)' }} />
      <View style={{ position: 'absolute', bottom: -35, left: -10, width: 90, height: 90, borderRadius: 45, backgroundColor: 'rgba(255,255,255,0.06)' }} />

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
        <Sparkles size={12} color="rgba(255,255,255,0.9)" strokeWidth={2} />
        <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 11, fontWeight: '700', letterSpacing: 1 }}>
          {t('bookings.upcoming').toUpperCase()}
        </Text>
      </View>

      <Text style={{ color: Colors.white, fontSize: 18, fontWeight: '800', marginTop: 4 }} numberOfLines={1}>
        {order.serviceName}
      </Text>
      <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13, marginTop: 4 }} numberOfLines={1}>
        {order.licensePlate}{order.vehicleTypeName ? ` · ${order.vehicleTypeName}` : ''}
      </Text>

      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 14, gap: 12 }}>
        <View style={{
          backgroundColor: 'rgba(255,255,255,0.18)',
          paddingHorizontal: 10, paddingVertical: 6,
          borderRadius: 10,
          flexDirection: 'row', alignItems: 'center', gap: 6,
        }}>
          <Clock size={13} color={Colors.white} strokeWidth={2} />
          <Text style={{ color: Colors.white, fontSize: 12, fontWeight: '700' }}>
            {dateLabel} {t('bookings.atTime')} {timeLabel}
          </Text>
        </View>
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 14, paddingTop: 12, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.15)' }}>
        <Text style={{ color: Colors.white, fontSize: 13, fontWeight: '700' }}>
          {formatCountdown(date, t)}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <Text style={{ color: Colors.white, fontSize: 12, fontWeight: '700' }}>{t('common.detail')}</Text>
          <ChevronRight size={14} color={Colors.white} strokeWidth={2.5} />
        </View>
      </View>
    </Pressable>
  );
}

function SectionHeader({ title, count }: { title: string; count: number }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginVertical: 12 }}>
      <Text style={{ fontSize: 14, fontWeight: '800', color: Colors.textPrimary }}>{title}</Text>
      <View style={{ backgroundColor: Colors.border, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2 }}>
        <Text style={{ fontSize: 11, fontWeight: '700', color: Colors.textSecondary }}>{count}</Text>
      </View>
      <View style={{ flex: 1, height: 1, backgroundColor: Colors.border, marginLeft: 4 }} />
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
  const { data: orders, isLoading } = useOrders();
  const [filter, setFilter] = useState<OrderStatus | 'all'>('all');

  const filtered = useMemo(() => {
    const list = orders ?? [];
    if (filter === 'all') return list;
    return list.filter((o) => o.status === filter);
  }, [orders, filter]);

  const grouped = useMemo(() => {
    const upcoming: Order[] = [];
    const history: Order[] = [];
    for (const o of filtered) {
      if (UPCOMING_STATUSES.includes(o.status)) upcoming.push(o);
      else history.push(o);
    }
    upcoming.sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());
    history.sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime());
    return { upcoming, history, nextOne: upcoming[0] };
  }, [filtered]);

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
              {orders?.length} {t('bookings.filterAll').toLowerCase()}
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
        <FlatList
          data={[]}
          renderItem={null as any}
          keyExtractor={() => ''}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
          ListHeaderComponent={
            <View>
              {/* Hero card for next booking */}
              {grouped.nextOne ? (
                <Animated.View entering={FadeInDown.springify()} style={{ marginBottom: 8 }}>
                  <NextBookingHero order={grouped.nextOne} />
                </Animated.View>
              ) : null}

              {/* Upcoming section */}
              {grouped.upcoming.length > 1 && (
                <>
                  <SectionHeader title={t('bookings.upcoming')} count={grouped.upcoming.length - 1} />
                  <View style={{ gap: 10 }}>
                    {grouped.upcoming.slice(1).map((o, i) => (
                      <Animated.View key={o.id} entering={FadeInDown.delay(i * 50).springify()}>
                        <OrderCard order={o} onPress={() => router.push({ pathname: '/booking/[id]', params: { id: o.id } })} />
                      </Animated.View>
                    ))}
                  </View>
                </>
              )}

              {/* History section */}
              {grouped.history.length > 0 && (
                <>
                  <SectionHeader title={t('bookings.history')} count={grouped.history.length} />
                  <View style={{ gap: 10 }}>
                    {grouped.history.map((o, i) => (
                      <Animated.View key={o.id} entering={FadeInDown.delay(i * 50).springify()}>
                        <OrderCard order={o} onPress={() => router.push({ pathname: '/booking/[id]', params: { id: o.id } })} />
                      </Animated.View>
                    ))}
                  </View>
                </>
              )}

              {/* If filtering returned no results */}
              {filtered.length === 0 && (
                <View style={{ alignItems: 'center', paddingVertical: 40 }}>
                  <CalendarCheck size={48} color={Colors.textDisabled} strokeWidth={1.5} />
                  <Text style={{ fontSize: 14, color: Colors.textSecondary, marginTop: 12 }}>
                    {t('bookings.empty')}
                  </Text>
                </View>
              )}
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}
