import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Colors } from '@/constants/Colors';
import {
  useAvailableSlots,
  useOrder,
  useRescheduleOrder,
} from '@/hooks/booking/useBooking';
import {
  useLoyaltyAccount,
  useTierConfigs,
} from '@/hooks/loyalty/useLoyalty';
import { useVehicles } from '@/hooks/vehicle/useVehicle';
import { useLocale, useT } from '@/i18n/useT';
import { AvailableSlot, OrderStatus } from '@/types/booking';
import { vehicleIcon } from '@/utils/vehicleIcon';
import { localizedVehicleTypeName } from '@/utils/vehicleTypeLabel';
import { router, useLocalSearchParams } from 'expo-router';
import {
  AlertTriangle,
  ArrowLeft,
  CalendarDays,
  Clock3,
  RefreshCw,
  Sparkles,
  StarPlus,
} from 'lucide-react-native';
import { useEffect, useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

const DEFAULT_BOOKING_WINDOW_DAYS = 7;
const RESCHEDULABLE_STATUSES = new Set<OrderStatus>([
  'pending',
  'pending_payment',
  'confirmed',
]);

function localDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function dateFromKey(key: string): Date {
  return new Date(`${key}T00:00:00`);
}

function slotRangeForDay(key: string) {
  const from = dateFromKey(key);
  from.setHours(0, 0, 0, 0);
  const to = new Date(from);
  to.setHours(23, 59, 59, 999);
  return { from: from.toISOString(), to: to.toISOString() };
}

function sameMinute(first: string, second: string): boolean {
  return (
    Math.abs(new Date(first).getTime() - new Date(second).getTime()) < 60_000
  );
}

function apiStatus(error: unknown): number | undefined {
  return (error as { response?: { status?: number } }).response?.status;
}

export default function RescheduleScreen() {
  const t = useT();
  const locale = useLocale();
  const localeTag = locale === 'vi' ? 'vi-VN' : 'en-US';
  const { id } = useLocalSearchParams<{ id: string }>();

  const {
    data: order,
    isLoading: loadingOrder,
    isError: orderError,
    refetch: refetchOrder,
  } = useOrder(id);
  const {
    data: vehicles,
    isLoading: loadingVehicles,
    isError: vehiclesError,
    refetch: refetchVehicles,
  } = useVehicles();
  const { data: loyalty } = useLoyaltyAccount();
  const { data: tierConfigs } = useTierConfigs();
  const { mutateAsync: reschedule, isPending: rescheduling } =
    useRescheduleOrder();

  const [selectedDate, setSelectedDate] = useState(() =>
    localDateKey(new Date()),
  );
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  const vehicle = useMemo(
    () => vehicles?.find((item) => item.id === order?.vehicleId),
    [vehicles, order?.vehicleId],
  );

  const bookingWindowDays =
    tierConfigs?.find((config) => config.tierName === loyalty?.tierName)
      ?.bookingWindowDays ?? DEFAULT_BOOKING_WINDOW_DAYS;

  const dateOptions = useMemo(() => {
    const count = Math.max(1, bookingWindowDays);
    const base = new Date();
    base.setHours(0, 0, 0, 0);

    return Array.from({ length: count }, (_, index) => {
      const date = new Date(base);
      date.setDate(base.getDate() + index);
      return { key: localDateKey(date), date };
    });
  }, [bookingWindowDays]);

  const selectedRange = useMemo(
    () => slotRangeForDay(selectedDate),
    [selectedDate],
  );
  const canReschedule =
    !!order && RESCHEDULABLE_STATUSES.has(order.status);

  const slotParams =
    order && vehicle?.vehicleTypeId && canReschedule
      ? {
          serviceTypeId: order.serviceTypeId,
          vehicleTypeId: vehicle.vehicleTypeId,
          from: selectedRange.from,
          to: selectedRange.to,
        }
      : null;

  const {
    data: slots,
    isLoading: loadingSlots,
    isError: slotsError,
    refetch: refetchSlots,
  } = useAvailableSlots(slotParams);

  const availableSlots = useMemo(() => {
    const now = Date.now();
    return (slots ?? [])
      .filter(
        (slot) =>
          slot.remainingCapacity > 0 &&
          new Date(slot.scheduledAt).getTime() > now &&
          (!order || !sameMinute(slot.scheduledAt, order.scheduledAt)),
      )
      .sort(
        (first, second) =>
          new Date(first.scheduledAt).getTime() -
          new Date(second.scheduledAt).getTime(),
      );
  }, [slots, order?.scheduledAt]);

  useEffect(() => {
    if (
      selectedSlot &&
      !availableSlots.some((slot) => slot.scheduledAt === selectedSlot)
    ) {
      setSelectedSlot(null);
    }
  }, [availableSlots, selectedSlot]);

  const chooseDate = (key: string) => {
    setSelectedDate(key);
    setSelectedSlot(null);
  };

  const handleConfirm = async () => {
    if (!selectedSlot) return;

    try {
      await reschedule({
        id,
        // staffShiftId is intentionally omitted: the current API contract lets
        // the server choose a shift with capacity covering this start time.
        dto: { scheduledAt: selectedSlot },
      });
      Toast.show({
        type: 'success',
        text1: t('reschedule.successTitle'),
      });
      router.back();
    } catch (error) {
      if (apiStatus(error) === 409) {
        setSelectedSlot(null);
        void refetchSlots();
        Toast.show({
          type: 'error',
          text1: t('reschedule.conflictTitle'),
          text2: t('reschedule.conflictSub'),
        });
        return;
      }

      Toast.show({
        type: 'error',
        text1: t('reschedule.failedTitle'),
      });
    }
  };

  const header = (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        gap: 12,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
        backgroundColor: Colors.surface,
      }}
    >
      <Pressable onPress={() => router.back()} style={{ padding: 4 }}>
        <ArrowLeft size={22} color={Colors.textPrimary} strokeWidth={1.5} />
      </Pressable>
      <Text
        style={{
          fontSize: 17,
          fontWeight: '700',
          color: Colors.textPrimary,
        }}
      >
        {t('reschedule.title')}
      </Text>
    </View>
  );

  if (loadingOrder || loadingVehicles) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }}>
        {header}
        <LoadingSpinner />
      </SafeAreaView>
    );
  }

  if (orderError || vehiclesError || !order) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }}>
        {header}
        <Notice
          title={t('common.error')}
          description={t('reschedule.loadSlotsError')}
          onRetry={() => {
            void refetchOrder();
            void refetchVehicles();
          }}
          retryLabel={t('common.retry')}
        />
      </SafeAreaView>
    );
  }

  if (!canReschedule) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }}>
        {header}
        <Notice
          title={t('reschedule.notAllowed')}
          description={t('reschedule.notAllowedSub')}
        />
      </SafeAreaView>
    );
  }

  if (!vehicle?.vehicleTypeId) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }}>
        {header}
        <Notice
          title={t('reschedule.vehicleUnavailable')}
          description={t('reschedule.vehicleUnavailableSub')}
        />
      </SafeAreaView>
    );
  }

  const currentDate = new Date(order.scheduledAt);
  const vehicleTypeName = vehicle.vehicleTypeName?.trim()
    ? localizedVehicleTypeName(vehicle.vehicleTypeName, t)
    : '';
  const VehicleIcon = vehicleIcon(vehicle.vehicleTypeName);
  const licensePlate =
    order.licensePlate?.trim() || vehicle.licensePlate?.trim() || '';
  const vehicleLabel =
    [vehicleTypeName, licensePlate].filter(Boolean).join(' · ') ||
    t('common.noData');
  const selectedSlotData = availableSlots.find(
    (slot) => slot.scheduledAt === selectedSlot,
  );
  const selectedDateTime = selectedSlot ? new Date(selectedSlot) : null;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }}>
      {header}

      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 24, gap: 20 }}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          entering={FadeInDown.springify()}
          style={{
            backgroundColor: Colors.surface,
            borderRadius: 16,
            padding: 16,
            borderWidth: 1,
            borderColor: Colors.border,
          }}
        >
          <Text
            style={{
              fontSize: 12,
              fontWeight: '700',
              color: Colors.textSecondary,
              textTransform: 'uppercase',
              letterSpacing: 0.5,
            }}
          >
            {t('reschedule.currentAppointment')}
          </Text>
          {order.serviceName?.trim() ? (
            <Text
              style={{
                fontSize: 16,
                fontWeight: '800',
                color: Colors.textPrimary,
                marginTop: 10,
              }}
            >
              {order.serviceName}
            </Text>
          ) : null}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
              marginTop: 10,
            }}
          >
            <VehicleIcon
              size={17}
              color={Colors.primary}
              strokeWidth={1.7}
            />
            <Text
              style={{
                flex: 1,
                fontSize: 14,
                fontWeight: '700',
                color: Colors.textPrimary,
              }}
              numberOfLines={1}
            >
              {vehicleLabel}
            </Text>
          </View>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
              marginTop: 12,
              paddingTop: 12,
              borderTopWidth: 1,
              borderTopColor: Colors.border,
            }}
          >
            <CalendarDays
              size={16}
              color={Colors.primary}
              strokeWidth={1.7}
            />
            <Text
              style={{
                fontSize: 13,
                fontWeight: '600',
                color: Colors.textPrimary,
              }}
            >
              {currentDate.toLocaleDateString(localeTag, {
                weekday: 'long',
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
              })}
              {' · '}
              {currentDate.toLocaleTimeString(localeTag, {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false,
              })}
            </Text>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(60).springify()}>
          <Text
            style={{
              fontSize: 15,
              fontWeight: '700',
              color: Colors.textPrimary,
              marginBottom: 12,
            }}
          >
            {t('reschedule.newDate')}
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 10, paddingRight: 8 }}
          >
            {dateOptions.map(({ key, date }, index) => {
              const active = key === selectedDate;
              const weekday =
                index === 0
                  ? t('bookingNew.today')
                  : index === 1
                    ? t('bookingNew.tomorrow')
                    : date.toLocaleDateString(undefined, {
                        weekday: 'short',
                      });
              const dayMonth = date.toLocaleDateString(undefined, {
                day: '2-digit',
                month: '2-digit',
              });
              return (
                <Pressable
                  key={key}
                  onPress={() => chooseDate(key)}
                  style={{
                    backgroundColor: active
                      ? Colors.primaryLight
                      : Colors.surface,
                    borderRadius: 12,
                    paddingVertical: 12,
                    paddingHorizontal: 14,
                    minWidth: 76,
                    alignItems: 'center',
                    borderWidth: 1.5,
                    borderColor: active ? Colors.primary : Colors.border,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 11,
                      fontWeight: '600',
                      color: active
                        ? Colors.primary
                        : Colors.textSecondary,
                      textTransform: 'uppercase',
                    }}
                  >
                    {weekday}
                  </Text>
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: '800',
                      color: active ? Colors.primary : Colors.textPrimary,
                      marginTop: 4,
                    }}
                  >
                    {dayMonth}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(100).springify()}>
          <Text
            style={{
              fontSize: 15,
              fontWeight: '700',
              color: Colors.textPrimary,
              marginBottom: 12,
            }}
          >
            {t('reschedule.pickNewSlot')}
          </Text>

          {loadingSlots ? (
            <LoadingSpinner size="small" />
          ) : slotsError ? (
            <View
              style={{
                alignItems: 'center',
                backgroundColor: Colors.surface,
                borderRadius: 16,
                padding: 24,
                borderWidth: 1,
                borderColor: Colors.border,
              }}
            >
              <AlertTriangle
                size={28}
                color={Colors.warning}
                strokeWidth={1.5}
              />
              <Text
                style={{
                  color: Colors.textSecondary,
                  fontSize: 13,
                  textAlign: 'center',
                  marginTop: 10,
                }}
              >
                {t('reschedule.loadSlotsError')}
              </Text>
              <Pressable
                onPress={() => void refetchSlots()}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 6,
                  padding: 10,
                  marginTop: 8,
                }}
              >
                <RefreshCw
                  size={15}
                  color={Colors.primary}
                  strokeWidth={1.8}
                />
                <Text
                  style={{
                    color: Colors.primary,
                    fontSize: 13,
                    fontWeight: '700',
                  }}
                >
                  {t('common.retry')}
                </Text>
              </Pressable>
            </View>
          ) : availableSlots.length === 0 ? (
            <View
              style={{
                alignItems: 'center',
                backgroundColor: Colors.surface,
                borderRadius: 16,
                padding: 28,
                borderWidth: 1,
                borderColor: Colors.border,
              }}
            >
              <Clock3
                size={30}
                color={Colors.textDisabled}
                strokeWidth={1.5}
              />
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: '700',
                  color: Colors.textPrimary,
                  textAlign: 'center',
                  marginTop: 10,
                }}
              >
                {t('reschedule.noSlots')}
              </Text>
              <Text
                style={{
                  fontSize: 12,
                  lineHeight: 18,
                  color: Colors.textSecondary,
                  textAlign: 'center',
                  marginTop: 5,
                }}
              >
                {t('reschedule.noSlotsSub')}
              </Text>
            </View>
          ) : (
            <>
              {availableSlots.some((slot) => slot.isGoldenHour) ? (
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 8,
                    backgroundColor: Colors.goldLight,
                    borderRadius: 10,
                    padding: 10,
                    marginBottom: 8,
                  }}
                >
                  <StarPlus
                    size={16}
                    color={Colors.gold}
                    strokeWidth={2}
                    fill={Colors.gold}
                  />
                  <Text
                    style={{
                      flex: 1,
                      fontSize: 12,
                      fontWeight: '600',
                      color: Colors.textSecondary,
                    }}
                  >
                    {t('bookingNew.goldenHourHint')}
                  </Text>
                </View>
              ) : null}
              <View
                style={{
                  flexDirection: 'row',
                  flexWrap: 'wrap',
                  gap: 10,
                }}
              >
                {availableSlots.map((slot) => (
                  <SlotCard
                    key={slot.scheduledAt}
                    slot={slot}
                    selected={selectedSlot === slot.scheduledAt}
                    goldenHourLabel={
                      slot.discountPercent > 0
                        ? `-${slot.discountPercent}%`
                        : t('bookingNew.goldenHourTag')
                    }
                    onPress={() => setSelectedSlot(slot.scheduledAt)}
                  />
                ))}
              </View>
            </>
          )}
        </Animated.View>
      </ScrollView>

      <View
        style={{
          backgroundColor: Colors.surface,
          borderTopWidth: 1,
          borderTopColor: Colors.border,
          padding: 16,
          gap: 12,
        }}
      >
        {selectedDateTime ? (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 10,
            }}
          >
            <View
              style={{
                width: 38,
                height: 38,
                borderRadius: 12,
                backgroundColor: selectedSlotData?.isGoldenHour
                  ? Colors.goldLight
                  : Colors.primaryLight,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {selectedSlotData?.isGoldenHour ? (
                <Sparkles size={18} color={Colors.gold} strokeWidth={1.6} />
              ) : (
                <Clock3 size={18} color={Colors.primary} strokeWidth={1.6} />
              )}
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: 11,
                  color: Colors.textSecondary,
                }}
              >
                {t('reschedule.selectedTime')}
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: '700',
                  color: Colors.textPrimary,
                  marginTop: 2,
                }}
              >
                {selectedDateTime.toLocaleDateString(localeTag, {
                  weekday: 'short',
                  day: '2-digit',
                  month: '2-digit',
                })}
                {' · '}
                {selectedDateTime.toLocaleTimeString(localeTag, {
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: false,
                })}
              </Text>
            </View>
          </View>
        ) : null}
        <Button
          title={t('reschedule.confirm')}
          onPress={handleConfirm}
          loading={rescheduling}
          disabled={!selectedSlot || loadingSlots || slotsError}
        />
      </View>
    </SafeAreaView>
  );
}

function SlotCard({
  slot,
  selected,
  goldenHourLabel,
  onPress,
}: {
  slot: AvailableSlot;
  selected: boolean;
  goldenHourLabel: string;
  onPress: () => void;
}) {
  const date = new Date(slot.scheduledAt);

  return (
    <Pressable
      onPress={onPress}
      style={{
        backgroundColor: selected
          ? Colors.primary
          : slot.isGoldenHour
            ? Colors.goldLight
            : Colors.surface,
        borderRadius: 12,
        padding: 12,
        minWidth: '30%',
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: slot.isGoldenHour
          ? Colors.gold
          : selected
            ? Colors.primary
            : Colors.border,
      }}
    >
      <Text
        style={{
          fontSize: 14,
          fontWeight: '700',
          color: selected ? Colors.white : Colors.textPrimary,
        }}
      >
        {date.toLocaleTimeString(undefined, {
          hour: '2-digit',
          minute: '2-digit',
        })}
      </Text>
      {slot.isGoldenHour ? (
        <View
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 2,
            backgroundColor: Colors.gold,
            paddingHorizontal: 5,
            paddingVertical: 2,
            borderTopRightRadius: 11,
            borderBottomLeftRadius: 10,
          }}
        >
          <StarPlus
            size={9}
            color={Colors.white}
            strokeWidth={2.5}
            fill={Colors.white}
          />
          <Text
            style={{
              fontSize: 9,
              fontWeight: '800',
              color: Colors.white,
            }}
          >
            {goldenHourLabel}
          </Text>
        </View>
      ) : null}
    </Pressable>
  );
}

function Notice({
  title,
  description,
  onRetry,
  retryLabel,
}: {
  title: string;
  description: string;
  onRetry?: () => void;
  retryLabel?: string;
}) {
  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 32,
      }}
    >
      <View
        style={{
          width: 72,
          height: 72,
          borderRadius: 36,
          backgroundColor: Colors.primaryLight,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CalendarDays size={30} color={Colors.primary} strokeWidth={1.5} />
      </View>
      <Text
        style={{
          fontSize: 16,
          fontWeight: '700',
          color: Colors.textPrimary,
          textAlign: 'center',
          marginTop: 16,
        }}
      >
        {title}
      </Text>
      <Text
        style={{
          fontSize: 13,
          lineHeight: 19,
          color: Colors.textSecondary,
          textAlign: 'center',
          marginTop: 6,
          maxWidth: 300,
        }}
      >
        {description}
      </Text>
      {onRetry && retryLabel ? (
        <Pressable
          onPress={onRetry}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 7,
            marginTop: 16,
            paddingHorizontal: 16,
            paddingVertical: 10,
            borderRadius: 12,
            backgroundColor: Colors.primaryLight,
          }}
        >
          <RefreshCw size={15} color={Colors.primary} strokeWidth={1.8} />
          <Text
            style={{
              color: Colors.primary,
              fontSize: 13,
              fontWeight: '700',
            }}
          >
            {retryLabel}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}
