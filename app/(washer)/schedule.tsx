import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Colors } from '@/constants/Colors';
import { useWasherSchedule } from '@/hooks/washer/useWasher';
import { BookingStatus, WasherScheduleItem } from '@/services/washer.service';
import { Calendar, Car, Clock, MapPin, User } from 'lucide-react-native';
import { useState } from 'react';
import { FlatList, Pressable, ScrollView, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

const STATUS_MAP: Record<BookingStatus, { label: string; color: string; bg: string }> = {
  pending_payment: { label: 'Chờ TT',      color: Colors.warning,       bg: '#FEF9C3' },
  confirmed:       { label: 'Xác nhận',    color: Colors.primary,       bg: Colors.primaryLight },
  checked_in:      { label: 'Đã check-in', color: '#7C3AED',            bg: '#EDE9FE' },
  in_progress:     { label: 'Đang rửa',   color: '#0891B2',            bg: '#ECFEFF' },
  completed:       { label: 'Hoàn thành', color: Colors.success,       bg: '#DCFCE7' },
  cancelled:       { label: 'Đã huỷ',     color: Colors.danger,        bg: '#FEE2E2' },
  no_show:         { label: 'Vắng mặt',   color: Colors.textSecondary, bg: Colors.border },
};

function toDateStr(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function addDays(d: Date, n: number) {
  const copy = new Date(d);
  copy.setDate(copy.getDate() + n);
  return copy;
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
}

const WEEKDAYS = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

function DatePill({
  date,
  selected,
  onPress,
}: {
  date: Date;
  selected: boolean;
  onPress: () => void;
}) {
  const today = toDateStr(new Date());
  const isToday = toDateStr(date) === today;

  return (
    <Pressable
      onPress={onPress}
      style={{
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderRadius: 16,
        backgroundColor: selected ? Colors.primary : Colors.surface,
        borderWidth: selected ? 0 : 1,
        borderColor: isToday && !selected ? Colors.primary : Colors.border,
        minWidth: 52,
      }}
    >
      <Text style={{
        fontSize: 11,
        fontWeight: '600',
        color: selected ? 'rgba(255,255,255,0.75)' : (isToday ? Colors.primary : Colors.textSecondary),
      }}>
        {WEEKDAYS[date.getDay()]}
      </Text>
      <Text style={{
        fontSize: 18,
        fontWeight: '800',
        color: selected ? Colors.white : (isToday ? Colors.primary : Colors.textPrimary),
        marginTop: 2,
      }}>
        {date.getDate()}
      </Text>
    </Pressable>
  );
}

function BookingCard({ item, index }: { item: WasherScheduleItem; index: number }) {
  const s = STATUS_MAP[item.status] ?? { label: item.status, color: Colors.textSecondary, bg: Colors.border };
  const isPaid = item.paymentStatus === 'paid';

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 70).springify()}
      style={{ flexDirection: 'row', gap: 12, marginBottom: 12 }}
    >
      {/* Timeline column */}
      <View style={{ width: 52, alignItems: 'center' }}>
        <View style={{
          backgroundColor: Colors.primaryLight,
          borderRadius: 10,
          paddingHorizontal: 4,
          paddingVertical: 6,
          alignItems: 'center',
        }}>
          <Text style={{ fontSize: 12, fontWeight: '800', color: Colors.primary, lineHeight: 14 }}>
            {formatTime(item.scheduledAt)}
          </Text>
        </View>
        <View style={{ flex: 1, width: 2, backgroundColor: Colors.border, marginTop: 4, borderRadius: 1 }} />
      </View>

      {/* Card */}
      <View style={{
        flex: 1,
        backgroundColor: Colors.surface,
        borderRadius: 16,
        padding: 14,
        marginBottom: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2,
      }}>
        {/* Service name + status */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <Text style={{ fontSize: 15, fontWeight: '700', color: Colors.textPrimary }}>
              {item.service.name}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 }}>
              <Clock size={12} color={Colors.textSecondary} strokeWidth={1.5} />
              <Text style={{ fontSize: 12, color: Colors.textSecondary }}>
                {item.service.durationMinutes} phút
              </Text>
            </View>
          </View>
          <View style={{ backgroundColor: s.bg, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 }}>
            <Text style={{ color: s.color, fontSize: 11, fontWeight: '700' }}>{s.label}</Text>
          </View>
        </View>

        <View style={{ height: 1, backgroundColor: Colors.border, marginVertical: 10 }} />

        {/* Info rows */}
        <View style={{ gap: 7 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <View style={{ width: 24, alignItems: 'center' }}>
              <User size={13} color={Colors.textSecondary} strokeWidth={1.5} />
            </View>
            <Text style={{ fontSize: 13, fontWeight: '600', color: Colors.textPrimary }}>
              {item.customer.name}
            </Text>
            <Text style={{ fontSize: 12, color: Colors.textSecondary }}>
              {item.customer.phone}
            </Text>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <View style={{ width: 24, alignItems: 'center' }}>
              <Car size={13} color={Colors.textSecondary} strokeWidth={1.5} />
            </View>
            <Text style={{ fontSize: 13, fontWeight: '700', color: Colors.textPrimary, letterSpacing: 0.5 }}>
              {item.vehicle.licensePlate}
            </Text>
          </View>

          {item.location ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <View style={{ width: 24, alignItems: 'center' }}>
                <MapPin size={13} color={Colors.textSecondary} strokeWidth={1.5} />
              </View>
              <Text style={{ fontSize: 13, color: Colors.textSecondary }}>{item.location}</Text>
            </View>
          ) : null}
        </View>

        {/* Payment badge */}
        <View style={{ marginTop: 10, alignSelf: 'flex-start' }}>
          <View style={{
            backgroundColor: isPaid ? '#DCFCE7' : '#FEF9C3',
            borderRadius: 6,
            paddingHorizontal: 8,
            paddingVertical: 3,
          }}>
            <Text style={{ fontSize: 11, fontWeight: '600', color: isPaid ? Colors.success : Colors.warning }}>
              {isPaid ? '✓ Đã thanh toán' : '⏳ Chưa thanh toán'}
            </Text>
          </View>
        </View>
      </View>
    </Animated.View>
  );
}

export default function ScheduleScreen() {
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState(toDateStr(today));

  const days = Array.from({ length: 7 }, (_, i) => addDays(today, i - 1));

  const { data: schedule, isLoading } = useWasherSchedule({ date: selectedDate });

  const selectedDay = new Date(selectedDate + 'T00:00:00');
  const dayLabel = toDateStr(selectedDay) === toDateStr(today)
    ? 'Hôm nay'
    : selectedDay.toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit' });

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: Colors.background }}>
      {/* Header */}
      <View style={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12 }}>
        <Text style={{ fontSize: 22, fontWeight: '700', color: Colors.textPrimary }}>Lịch làm việc</Text>
        <Text style={{ fontSize: 13, color: Colors.textSecondary, marginTop: 2 }}>{dayLabel}</Text>
      </View>

      {/* Date picker */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 8, paddingBottom: 12 }}
      >
        {days.map((d) => (
          <DatePill
            key={toDateStr(d)}
            date={d}
            selected={toDateStr(d) === selectedDate}
            onPress={() => setSelectedDate(toDateStr(d))}
          />
        ))}
      </ScrollView>

      {/* Divider */}
      <View style={{ height: 1, backgroundColor: Colors.border, marginHorizontal: 16, marginBottom: 16 }} />

      {/* Content */}
      {isLoading ? (
        <LoadingSpinner />
      ) : !schedule?.length ? (
        <EmptyState
          icon={Calendar}
          title="Không có lịch"
          description="Ngày này bạn không có lịch rửa xe nào"
        />
      ) : (
        <FlatList
          data={schedule}
          keyExtractor={(item) => item.bookingId}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item, index }) => <BookingCard item={item} index={index} />}
        />
      )}
    </SafeAreaView>
  );
}
