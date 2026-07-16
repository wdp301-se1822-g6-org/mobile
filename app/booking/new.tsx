import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Colors } from '@/constants/Colors';
import {
  useAvailableSlots,
  useCreateOrder,
  usePreviewOrder,
} from '@/hooks/booking/useBooking';
import { useServiceTypes } from '@/hooks/useServiceTypes';
import { useVehicles } from '@/hooks/vehicle/useVehicle';
import { useVouchers } from '@/hooks/voucher/useVoucher';
import { useT } from '@/i18n/useT';
import { PaymentMethod } from '@/types/booking';
import { ServiceType } from '@/types/service';
import { Vehicle } from '@/types/vehicle';
import { Voucher } from '@/types/voucher';
import { formatPrice } from '@/utils/formatters';
import { resolveVehiclePricing } from '@/utils/servicePricing';
import { vehicleIcon } from '@/utils/vehicleIcon';
import { localizedVehicleTypeName } from '@/utils/vehicleTypeLabel';
import { router, useLocalSearchParams } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import {
  ArrowLeft,
  Banknote,
  Calendar,
  Car,
  CheckCircle,
  ChevronRight,
  Clock,
  CreditCard,
  StarPlus,
  Tag,
} from 'lucide-react-native';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import Animated, { FadeInDown, SlideInRight } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

type Step = 'service' | 'vehicle' | 'slot' | 'confirm';

const STEPS: Step[] = ['vehicle', 'service', 'slot', 'confirm'];

function StepIndicator({
  current,
  isReachable,
  onStepPress,
}: {
  current: Step;
  isReachable: (step: Step) => boolean;
  onStepPress: (step: Step) => void;
}) {
  const idx = STEPS.indexOf(current);
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
      }}
    >
      {STEPS.map((s, i) => {
        const reachable = isReachable(s);
        return (
          <View
            key={s}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              flex: i < STEPS.length - 1 ? 1 : 0,
            }}
          >
            <Pressable
              disabled={!reachable || s === current}
              onPress={() => onStepPress(s)}
              hitSlop={8}
              style={{
                width: 28,
                height: 28,
                borderRadius: 14,
                backgroundColor: i <= idx ? Colors.primary : Colors.border,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {i < idx ? (
                <CheckCircle size={16} color={Colors.white} strokeWidth={2} />
              ) : (
                <Text
                  style={{
                    color: i === idx ? Colors.white : Colors.textDisabled,
                    fontSize: 12,
                    fontWeight: '700',
                  }}
                >
                  {i + 1}
                </Text>
              )}
            </Pressable>
            {i < STEPS.length - 1 && (
              <View
                style={{
                  flex: 1,
                  height: 2,
                  backgroundColor: i < idx ? Colors.primary : Colors.border,
                  marginHorizontal: 4,
                }}
              />
            )}
          </View>
        );
      })}
    </View>
  );
}

export default function NewBookingScreen() {
  const t = useT();
  const { serviceId, vehicleId } = useLocalSearchParams<{
    serviceId?: string;
    vehicleId?: string;
  }>();

  const [step, setStep] = useState<Step>('vehicle');
  const [selectedService, setSelectedService] = useState<ServiceType | null>(
    null,
  );
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [previewFailed, setPreviewFailed] = useState(false);

  const { data: services, isLoading: loadingServices } = useServiceTypes();
  const { data: vehicles, isLoading: loadingVehicles } = useVehicles();
  const { data: vouchers } = useVouchers('unused');
  const { mutateAsync: createOrder, isPending: creating } = useCreateOrder();
  const {
    mutateAsync: previewOrder,
    data: preview,
    isPending: previewing,
    reset: resetPreview,
  } = usePreviewOrder();

  const service = selectedService;

  // Only show packages offered for the selected vehicle's type, priced for that type.
  const availableServices = useMemo(
    () =>
      (services ?? []).filter(
        (s) =>
          s.isActive &&
          resolveVehiclePricing(s, selectedVehicle?.vehicleTypeId),
      ),
    [services, selectedVehicle?.vehicleTypeId],
  );
  const selectedPricing = service
    ? resolveVehiclePricing(service, selectedVehicle?.vehicleTypeId)
    : null;

  // The home screen already lists packages per vehicle, so it hands us both the car and
  // the package: prefill them and open straight at the time step. Only when several cars
  // share that vehicle type do we still stop at the vehicle step to ask which one.
  const prefilled = useRef(false);
  useEffect(() => {
    if (prefilled.current || !services || !vehicles) return;
    prefilled.current = true;

    const preService = serviceId
      ? services.find((s) => s.id === serviceId)
      : undefined;
    if (preService) setSelectedService(preService);

    const preVehicle = vehicleId
      ? vehicles.find((v) => v.id === vehicleId)
      : undefined;
    if (!preVehicle) return;
    setSelectedVehicle(preVehicle);

    const sameType = vehicles.filter(
      (v) => v.vehicleTypeId === preVehicle.vehicleTypeId,
    );
    const offered =
      preService &&
      resolveVehiclePricing(preService, preVehicle.vehicleTypeId);
    if (offered && sameType.length === 1) setStep('slot');
  }, [services, vehicles, serviceId, vehicleId]);

  // The next 7 days the customer can book, each as a local calendar day.
  const upcomingDays = useMemo(() => {
    const days: { key: string; date: Date }[] = [];
    const base = new Date();
    base.setHours(0, 0, 0, 0);
    for (let i = 0; i < 7; i++) {
      const d = new Date(base);
      d.setDate(base.getDate() + i);
      days.push({ key: d.toISOString(), date: d });
    }
    return days;
  }, []);

  // The selected day spans local 00:00:00.000 → 23:59:59.999, sent to the API as ISO (UTC).
  const slotRange = useMemo(() => {
    if (!selectedDate) return null;
    const from = new Date(selectedDate);
    from.setHours(0, 0, 0, 0);
    const to = new Date(from);
    to.setHours(23, 59, 59, 999);
    return { from: from.toISOString(), to: to.toISOString() };
  }, [selectedDate]);

  const { data: slots, isLoading: loadingSlots } = useAvailableSlots(
    step === 'slot' && service && selectedVehicle && slotRange
      ? {
          serviceTypeId: service.id,
          vehicleTypeId: selectedVehicle.vehicleTypeId,
          from: slotRange.from,
          to: slotRange.to,
        }
      : null,
  );

  // The API is the only source of truth for the total: it is what applies the golden-hour,
  // tier and voucher discounts. A failure must surface, never quietly fall back to the
  // undiscounted price.
  const runPreview = useCallback(() => {
    if (!service || !selectedVehicle || !selectedSlot) return;
    setPreviewFailed(false);
    previewOrder({
      serviceTypeId: service.id,
      vehicleTypeId: selectedVehicle.vehicleTypeId,
      scheduledAt: selectedSlot,
      voucherId: selectedVoucher?.id,
    }).catch(() => {
      resetPreview();
      setPreviewFailed(true);
    });
  }, [service?.id, selectedVehicle?.id, selectedSlot, selectedVoucher?.id]);

  useEffect(() => {
    if (step !== 'confirm') return;
    runPreview();
  }, [step, runPreview]);

  // A step can be jumped to only once its prerequisites are filled in, so the
  // tappable indicators never land the user on an incomplete screen.
  const isStepReachable = (s: Step) => {
    switch (s) {
      case 'vehicle':
        return true;
      case 'service':
        return !!selectedVehicle;
      case 'slot':
        return !!selectedVehicle && !!service;
      case 'confirm':
        return !!selectedVehicle && !!service && !!selectedSlot;
    }
  };

  const goNext = () => {
    const idx = STEPS.indexOf(step);
    if (idx < STEPS.length - 1) setStep(STEPS[idx + 1]);
  };

  const goBack = () => {
    const idx = STEPS.indexOf(step);
    if (idx > 0) setStep(STEPS[idx - 1]);
    else router.back();
  };

  const handleConfirm = async () => {
    if (!service || !selectedVehicle || !selectedSlot) return;
    try {
      const order = await createOrder({
        serviceTypeId: service.id,
        vehicleId: selectedVehicle.id,
        scheduledAt: selectedSlot,
        voucherId: selectedVoucher?.id,
        paymentMethod,
      });

      Toast.show({ type: 'success', text1: t('bookingNew.successTitle') });

      if (paymentMethod === 'online' && order.payosCheckoutUrl) {
        try {
          await WebBrowser.openBrowserAsync(order.payosCheckoutUrl);
        } catch {}
      }

      router.replace({ pathname: '/booking/[id]', params: { id: order.id } });
    } catch {
      Toast.show({
        type: 'error',
        text1: t('bookingNew.failedTitle'),
        text2: t('bookingNew.failedSub'),
      });
    }
  };

  // The base price is known locally, so it can be shown while the preview is in flight.
  // The total cannot: without a preview it is unknown, not "the base price".
  const basePrice = preview?.basePrice ?? selectedPricing?.price ?? 0;
  const discountAmount = preview?.discountAmount ?? 0;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          padding: 16,
          gap: 12,
        }}
      >
        <Pressable onPress={goBack} style={{ padding: 4 }}>
          <ArrowLeft size={22} color={Colors.textPrimary} strokeWidth={1.5} />
        </Pressable>
        <Text
          style={{ fontSize: 17, fontWeight: '700', color: Colors.textPrimary }}
        >
          {t('bookingNew.title')}
        </Text>
      </View>

      <StepIndicator
        current={step}
        isReachable={isStepReachable}
        onStepPress={setStep}
      />

      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        {/* STEP: Service */}
        {step === 'service' && (
          <Animated.View
            entering={SlideInRight.springify()}
            style={{ gap: 12 }}
          >
            <Text
              style={{
                fontSize: 15,
                fontWeight: '600',
                color: Colors.textPrimary,
                marginBottom: 4,
              }}
            >
              {t('bookingNew.pickService')}
            </Text>
            {loadingServices ? (
              <LoadingSpinner />
            ) : !availableServices.length ? (
              <Text
                style={{
                  color: Colors.textSecondary,
                  textAlign: 'center',
                  marginTop: 24,
                }}
              >
                {t('bookingNew.noServices')}
              </Text>
            ) : (
              availableServices.map((s, i) => {
                const pricing = resolveVehiclePricing(
                  s,
                  selectedVehicle?.vehicleTypeId,
                )!;
                return (
                  <Animated.View
                    key={s.id}
                    entering={FadeInDown.delay(i * 60).springify()}
                  >
                    <Pressable
                      onPress={() => {
                        setSelectedService(s);
                        goNext();
                      }}
                      style={{
                        backgroundColor: Colors.surface,
                        borderRadius: 16,
                        padding: 16,
                        borderWidth: 2,
                        borderColor:
                          selectedService?.id === s.id
                            ? Colors.primary
                            : 'transparent',
                        flexDirection: 'row',
                        alignItems: 'center',
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.05,
                        shadowRadius: 6,
                        elevation: 2,
                      }}
                    >
                      <View style={{ flex: 1 }}>
                        <Text
                          style={{
                            fontSize: 15,
                            fontWeight: '600',
                            color: Colors.textPrimary,
                          }}
                        >
                          {s.name}
                        </Text>
                        {pricing.duration ? (
                          <View
                            style={{
                              flexDirection: 'row',
                              alignItems: 'center',
                              gap: 4,
                              marginTop: 6,
                            }}
                          >
                            <Clock
                              size={13}
                              color={Colors.textSecondary}
                              strokeWidth={1.5}
                            />
                            <Text
                              style={{
                                fontSize: 12,
                                color: Colors.textSecondary,
                              }}
                            >
                              {pricing.duration} {t('common.minutes')}
                            </Text>
                          </View>
                        ) : null}
                      </View>
                      <View style={{ alignItems: 'flex-end', gap: 6 }}>
                        <Text
                          style={{
                            fontSize: 16,
                            fontWeight: '700',
                            color: Colors.primary,
                          }}
                        >
                          {formatPrice(pricing.price)}
                        </Text>
                        <ChevronRight
                          size={18}
                          color={Colors.textDisabled}
                          strokeWidth={1.5}
                        />
                      </View>
                    </Pressable>
                  </Animated.View>
                );
              })
            )}
          </Animated.View>
        )}

        {/* STEP: Vehicle */}
        {step === 'vehicle' && (
          <Animated.View
            entering={SlideInRight.springify()}
            style={{ gap: 12 }}
          >
            <Text
              style={{
                fontSize: 15,
                fontWeight: '600',
                color: Colors.textPrimary,
                marginBottom: 4,
              }}
            >
              {t('bookingNew.pickVehicle')}
            </Text>
            {loadingVehicles ? (
              <LoadingSpinner />
            ) : (
              vehicles?.map((v, i) => {
                const VehicleIcon = vehicleIcon(v.vehicleTypeName);
                return (
                  <Animated.View
                    key={v.id}
                    entering={FadeInDown.delay(i * 60).springify()}
                  >
                    <Pressable
                      onPress={() => {
                        setSelectedVehicle(v);
                        setSelectedSlot(null); // slots depend on the vehicle type
                        // Keep a package that is offered for this car's type — that is the
                        // one picked on the home screen — and go straight to the time step.
                        // Otherwise it cannot be priced here, so it has to be picked again.
                        if (
                          service &&
                          resolveVehiclePricing(service, v.vehicleTypeId)
                        ) {
                          setStep('slot');
                        } else {
                          setSelectedService(null);
                          setStep('service');
                        }
                      }}
                      style={{
                        backgroundColor: Colors.surface,
                        borderRadius: 16,
                        padding: 16,
                        borderWidth: 2,
                        borderColor:
                          selectedVehicle?.id === v.id
                            ? Colors.primary
                            : 'transparent',
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 12,
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.05,
                        shadowRadius: 6,
                        elevation: 2,
                      }}
                    >
                      <View
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: 12,
                          backgroundColor: Colors.primaryLight,
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <VehicleIcon
                          size={22}
                          color={Colors.primary}
                          strokeWidth={1.5}
                        />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text
                          style={{
                            fontSize: 15,
                            fontWeight: '600',
                            color: Colors.textPrimary,
                          }}
                        >
                          {v.licensePlate}
                        </Text>
                        <Text
                          style={{
                            fontSize: 13,
                            color: Colors.textSecondary,
                            marginTop: 2,
                          }}
                        >
                          {localizedVehicleTypeName(v.vehicleTypeName, t)}
                        </Text>
                      </View>
                      <ChevronRight
                        size={18}
                        color={Colors.textDisabled}
                        strokeWidth={1.5}
                      />
                    </Pressable>
                  </Animated.View>
                );
              })
            )}
            <Pressable
              onPress={() => router.push('/vehicles/new')}
              style={{
                borderRadius: 16,
                borderWidth: 1.5,
                borderColor: Colors.primary,
                borderStyle: 'dashed',
                padding: 16,
                alignItems: 'center',
              }}
            >
              <Text style={{ color: Colors.primary, fontWeight: '600' }}>
                {t('bookingNew.addVehicle')}
              </Text>
            </Pressable>
          </Animated.View>
        )}

        {/* STEP: Slot */}
        {step === 'slot' && (
          <Animated.View
            entering={SlideInRight.springify()}
            style={{ gap: 12 }}
          >
            {/* 1. Pick a date */}
            <Text
              style={{
                fontSize: 15,
                fontWeight: '600',
                color: Colors.textPrimary,
                marginBottom: 4,
              }}
            >
              {t('bookingNew.pickDate')}
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ flexGrow: 0 }}
              contentContainerStyle={{ gap: 10 }}
            >
              {upcomingDays.map((day, i) => {
                const isSelected = selectedDate === day.key;
                const weekday =
                  i === 0
                    ? t('bookingNew.today')
                    : i === 1
                      ? t('bookingNew.tomorrow')
                      : day.date.toLocaleDateString(undefined, {
                          weekday: 'short',
                        });
                const dayMonth = day.date.toLocaleDateString(undefined, {
                  day: '2-digit',
                  month: '2-digit',
                });
                return (
                  <Pressable
                    key={day.key}
                    onPress={() => {
                      setSelectedDate(day.key);
                      setSelectedSlot(null); // a new day invalidates the chosen time
                    }}
                    style={{
                      backgroundColor: isSelected
                        ? Colors.primaryLight
                        : Colors.surface,
                      borderRadius: 12,
                      paddingVertical: 12,
                      paddingHorizontal: 14,
                      minWidth: 76,
                      alignItems: 'center',
                      borderWidth: 1.5,
                      borderColor: isSelected ? Colors.primary : Colors.border,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 11,
                        fontWeight: '600',
                        color: isSelected
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
                        color: isSelected
                          ? Colors.primary
                          : Colors.textPrimary,
                        marginTop: 4,
                      }}
                    >
                      {dayMonth}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            {/* 2. Pick a time within the selected date */}
            {!selectedDate ? (
              <Text
                style={{
                  color: Colors.textSecondary,
                  textAlign: 'center',
                  marginTop: 24,
                }}
              >
                {t('bookingNew.pickDate')}
              </Text>
            ) : (
              <>
                <Text
                  style={{
                    fontSize: 15,
                    fontWeight: '600',
                    color: Colors.textPrimary,
                    marginTop: 8,
                    marginBottom: 4,
                  }}
                >
                  {t('bookingNew.pickTime')}
                </Text>
                {loadingSlots ? (
                  <LoadingSpinner />
                ) : !slots?.length ? (
                  <Text
                    style={{
                      color: Colors.textSecondary,
                      textAlign: 'center',
                      marginTop: 24,
                    }}
                  >
                    {t('bookingNew.noSlotsForDate')}
                  </Text>
                ) : (
                  <>
                    {slots.some((s) => s.isGoldenHour) && (
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 8,
                      backgroundColor: Colors.goldLight,
                      borderRadius: 10,
                      padding: 10,
                      marginBottom: 4,
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
                )}
                <View
                  style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}
                >
                  {slots.map((slot) => {
                    const tt = new Date(slot.scheduledAt);
                    const label = tt.toLocaleTimeString(undefined, {
                      hour: '2-digit',
                      minute: '2-digit',
                    });
                    const isSelected = selectedSlot === slot.scheduledAt;
                    const golden = slot.isGoldenHour;
                    return (
                      <Pressable
                        key={slot.scheduledAt}
                        onPress={() => setSelectedSlot(slot.scheduledAt)}
                        style={{
                          backgroundColor: isSelected
                            ? Colors.primary
                            : golden
                              ? Colors.goldLight
                              : Colors.surface,
                          borderRadius: 12,
                          padding: 12,
                          minWidth: '30%',
                          alignItems: 'center',
                          borderWidth: 1.5,
                          borderColor: isSelected
                            ? Colors.primary
                            : golden
                              ? Colors.gold
                              : Colors.border,
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 14,
                            fontWeight: '700',
                            color: isSelected
                              ? Colors.white
                              : Colors.textPrimary,
                          }}
                        >
                          {label}
                        </Text>
                        {golden && slot.discountPercent > 0 && (
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
                              -{slot.discountPercent}%
                            </Text>
                          </View>
                        )}
                      </Pressable>
                    );
                  })}
                </View>
              </>
                )}
              </>
            )}
            {selectedSlot && (
              <Button
                title={t('common.next')}
                onPress={goNext}
                className="mt-4"
              />
            )}
          </Animated.View>
        )}

        {/* STEP: Confirm */}
        {step === 'confirm' && service && selectedVehicle && selectedSlot && (
          <Animated.View
            entering={SlideInRight.springify()}
            style={{ gap: 14 }}
          >
            <Text
              style={{
                fontSize: 15,
                fontWeight: '600',
                color: Colors.textPrimary,
              }}
            >
              {t('bookingNew.summary')}
            </Text>

            <View
              style={{
                backgroundColor: Colors.surface,
                borderRadius: 16,
                padding: 16,
                gap: 12,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 6,
                elevation: 2,
              }}
            >
              {[
                {
                  icon: (
                    <Car
                      size={16}
                      color={Colors.textSecondary}
                      strokeWidth={1.5}
                    />
                  ),
                  label: t('bookingNew.service'),
                  value: service.name,
                },
                {
                  icon: (() => {
                    const VIcon = vehicleIcon(selectedVehicle.vehicleTypeName);
                    return (
                      <VIcon
                        size={16}
                        color={Colors.textSecondary}
                        strokeWidth={1.5}
                      />
                    );
                  })(),
                  label: t('bookingNew.vehicle'),
                  value: `${selectedVehicle.licensePlate} (${localizedVehicleTypeName(
                    selectedVehicle.vehicleTypeName,
                    t,
                  )})`,
                },
                {
                  icon: (
                    <Calendar
                      size={16}
                      color={Colors.textSecondary}
                      strokeWidth={1.5}
                    />
                  ),
                  label: t('bookingNew.time'),
                  value: new Date(selectedSlot).toLocaleString(),
                },
                {
                  icon: (
                    <Clock
                      size={16}
                      color={Colors.textSecondary}
                      strokeWidth={1.5}
                    />
                  ),
                  label: t('bookingNew.duration'),
                  value: `${selectedPricing?.duration ?? service.durationMinutes ?? '—'} ${t('common.minutes')}`,
                },
              ].map((row) => (
                <View
                  key={row.label}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 10,
                  }}
                >
                  {row.icon}
                  <Text
                    style={{
                      color: Colors.textSecondary,
                      fontSize: 13,
                      width: 80,
                    }}
                  >
                    {row.label}
                  </Text>
                  <Text
                    style={{
                      flex: 1,
                      fontSize: 13,
                      fontWeight: '600',
                      color: Colors.textPrimary,
                    }}
                  >
                    {row.value}
                  </Text>
                </View>
              ))}
            </View>

            {/* Voucher picker */}
            <View>
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: '600',
                  color: Colors.textSecondary,
                  marginBottom: 8,
                }}
              >
                {t('bookingNew.voucher')}
              </Text>
              {selectedVoucher ? (
                <Pressable
                  onPress={() => setSelectedVoucher(null)}
                  style={{
                    backgroundColor: Colors.primaryLight,
                    borderRadius: 12,
                    padding: 14,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 12,
                    borderWidth: 1.5,
                    borderColor: Colors.primary,
                  }}
                >
                  <View
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 10,
                      backgroundColor: Colors.primary,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Tag size={18} color={Colors.white} strokeWidth={1.5} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: '700',
                        color: Colors.textPrimary,
                      }}
                    >
                      {t('bookingNew.discountUpTo')}{' '}
                      {formatPrice(selectedVoucher.discountCapVnd)}
                    </Text>
                    <Text
                      style={{
                        fontSize: 12,
                        color: Colors.textSecondary,
                        marginTop: 2,
                      }}
                    >
                      {t('bookingNew.code')}: {selectedVoucher.code}
                    </Text>
                  </View>
                  <Text
                    style={{
                      fontSize: 12,
                      color: Colors.danger,
                      fontWeight: '600',
                    }}
                  >
                    {t('common.remove')}
                  </Text>
                </Pressable>
              ) : !vouchers?.length ? (
                <View
                  style={{
                    backgroundColor: Colors.surface,
                    borderRadius: 12,
                    padding: 14,
                    borderWidth: 1,
                    borderColor: Colors.border,
                    borderStyle: 'dashed',
                  }}
                >
                  <Text
                    style={{
                      fontSize: 13,
                      color: Colors.textSecondary,
                      textAlign: 'center',
                    }}
                  >
                    {t('bookingNew.noVouchers')}
                  </Text>
                </View>
              ) : (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={{ flexGrow: 0 }}
                  contentContainerStyle={{ gap: 8 }}
                >
                  {vouchers.map((v) => (
                    <Pressable
                      key={v.id}
                      onPress={() => setSelectedVoucher(v)}
                      style={{
                        backgroundColor: Colors.surface,
                        borderRadius: 12,
                        padding: 12,
                        minWidth: 180,
                        borderWidth: 1.5,
                        borderColor: Colors.border,
                      }}
                    >
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: 6,
                        }}
                      >
                        <Tag
                          size={14}
                          color={Colors.primary}
                          strokeWidth={1.5}
                        />
                        <Text
                          style={{
                            fontSize: 13,
                            fontWeight: '700',
                            color: Colors.primary,
                          }}
                        >
                          -{formatPrice(v.discountCapVnd)}
                        </Text>
                      </View>
                      <Text
                        style={{
                          fontSize: 11,
                          color: Colors.textSecondary,
                          marginTop: 4,
                        }}
                      >
                        {t('bookingNew.code')}: {v.code}
                      </Text>
                      <Text
                        style={{ fontSize: 11, color: Colors.textSecondary }}
                      >
                        {t('bookingNew.expires')}:{' '}
                        {new Date(v.expiresAt).toLocaleDateString()}
                      </Text>
                    </Pressable>
                  ))}
                </ScrollView>
              )}
            </View>

            {/* Payment method */}
            <View>
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: '600',
                  color: Colors.textSecondary,
                  marginBottom: 8,
                }}
              >
                {t('bookingNew.paymentMethod')}
              </Text>
              <View style={{ flexDirection: 'row', gap: 10 }}>
                {[
                  {
                    key: 'cash' as const,
                    label: t('bookingNew.cash'),
                    sub: t('bookingNew.cashSub'),
                    icon: Banknote,
                  },
                  {
                    key: 'online' as const,
                    label: t('bookingNew.online'),
                    sub: t('bookingNew.onlineSub'),
                    icon: CreditCard,
                  },
                ].map((opt) => {
                  const Icon = opt.icon;
                  const active = paymentMethod === opt.key;
                  return (
                    <Pressable
                      key={opt.key}
                      onPress={() => setPaymentMethod(opt.key)}
                      style={{
                        flex: 1,
                        backgroundColor: active
                          ? Colors.primaryLight
                          : Colors.surface,
                        borderRadius: 12,
                        padding: 14,
                        borderWidth: 1.5,
                        borderColor: active ? Colors.primary : Colors.border,
                        alignItems: 'center',
                        gap: 6,
                      }}
                    >
                      <Icon
                        size={22}
                        color={active ? Colors.primary : Colors.textSecondary}
                        strokeWidth={1.5}
                      />
                      <Text
                        style={{
                          fontSize: 13,
                          fontWeight: '700',
                          color: active ? Colors.primary : Colors.textPrimary,
                        }}
                      >
                        {opt.label}
                      </Text>
                      <Text
                        style={{ fontSize: 11, color: Colors.textSecondary }}
                      >
                        {opt.sub}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* Price breakdown */}
            <View
              style={{
                backgroundColor: Colors.surface,
                borderRadius: 16,
                padding: 16,
                gap: 8,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 6,
                elevation: 2,
              }}
            >
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                }}
              >
                <Text style={{ fontSize: 13, color: Colors.textSecondary }}>
                  {t('bookingNew.basePrice')}
                </Text>
                <Text style={{ fontSize: 13, color: Colors.textPrimary }}>
                  {formatPrice(basePrice)}
                </Text>
              </View>

              {preview?.appliedDiscounts?.map((d, i) => (
                <View
                  key={i}
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                  }}
                >
                  <Text style={{ fontSize: 13, color: Colors.textSecondary }}>
                    {d.label}
                  </Text>
                  <Text
                    style={{
                      fontSize: 13,
                      color: Colors.success,
                      fontWeight: '600',
                    }}
                  >
                    -{formatPrice(d.amount)}
                  </Text>
                </View>
              ))}

              {!preview?.appliedDiscounts?.length && discountAmount > 0 && (
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                  }}
                >
                  <Text style={{ fontSize: 13, color: Colors.textSecondary }}>
                    {t('bookingNew.discount')}
                  </Text>
                  <Text
                    style={{
                      fontSize: 13,
                      color: Colors.success,
                      fontWeight: '600',
                    }}
                  >
                    -{formatPrice(discountAmount)}
                  </Text>
                </View>
              )}

              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  paddingTop: 8,
                  borderTopWidth: 1,
                  borderTopColor: Colors.border,
                }}
              >
                <Text
                  style={{
                    fontSize: 15,
                    fontWeight: '700',
                    color: Colors.textPrimary,
                  }}
                >
                  {t('bookingNew.total')}
                </Text>
                <Text
                  style={{
                    fontSize: 20,
                    fontWeight: '800',
                    color: Colors.primary,
                  }}
                >
                  {previewing
                    ? '...'
                    : preview
                      ? formatPrice(preview.finalPrice)
                      : '—'}
                </Text>
              </View>

              {previewFailed && (
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 10,
                    marginTop: 4,
                  }}
                >
                  <Text
                    style={{ flex: 1, fontSize: 12, color: Colors.danger }}
                  >
                    {t('bookingNew.previewFailed')}
                  </Text>
                  <Pressable onPress={runPreview} hitSlop={8}>
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: '700',
                        color: Colors.primary,
                      }}
                    >
                      {t('bookingNew.previewRetry')}
                    </Text>
                  </Pressable>
                </View>
              )}
            </View>

            <Button
              title={
                paymentMethod === 'online'
                  ? t('bookingNew.confirmAndPay')
                  : t('bookingNew.confirm')
              }
              onPress={handleConfirm}
              loading={creating}
            />
          </Animated.View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
