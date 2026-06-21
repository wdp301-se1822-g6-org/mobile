import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Colors } from '@/constants/Colors';
import { useT } from '@/i18n/useT';
import { useAvailableSlots, useCreateOrder, usePreviewOrder } from '@/hooks/booking/useBooking';
import { useServiceTypes } from '@/hooks/useServiceTypes';
import { useVehicles } from '@/hooks/vehicle/useVehicle';
import { useVouchers } from '@/hooks/voucher/useVoucher';
import { PaymentMethod } from '@/types/booking';
import { ServiceType } from '@/types/service';
import { Vehicle } from '@/types/vehicle';
import { Voucher } from '@/types/voucher';
import { formatPrice } from '@/utils/formatters';
import { router, useLocalSearchParams } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { ArrowLeft, Banknote, Calendar, Car, CheckCircle, ChevronRight, Clock, CreditCard, Tag } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import Animated, { FadeInDown, SlideInRight } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

type Step = 'service' | 'vehicle' | 'slot' | 'confirm';

const STEPS: Step[] = ['service', 'vehicle', 'slot', 'confirm'];

function StepIndicator({ current }: { current: Step }) {
  const idx = STEPS.indexOf(current);
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 }}>
      {STEPS.map((s, i) => (
        <View key={s} style={{ flexDirection: 'row', alignItems: 'center', flex: i < STEPS.length - 1 ? 1 : 0 }}>
          <View style={{
            width: 28, height: 28, borderRadius: 14,
            backgroundColor: i <= idx ? Colors.primary : Colors.border,
            alignItems: 'center', justifyContent: 'center',
          }}>
            {i < idx
              ? <CheckCircle size={16} color={Colors.white} strokeWidth={2} />
              : <Text style={{ color: i === idx ? Colors.white : Colors.textDisabled, fontSize: 12, fontWeight: '700' }}>{i + 1}</Text>
            }
          </View>
          {i < STEPS.length - 1 && (
            <View style={{ flex: 1, height: 2, backgroundColor: i < idx ? Colors.primary : Colors.border, marginHorizontal: 4 }} />
          )}
        </View>
      ))}
    </View>
  );
}

export default function NewBookingScreen() {
  const t = useT();
  const { serviceId } = useLocalSearchParams<{ serviceId?: string }>();

  const [step, setStep] = useState<Step>(serviceId ? 'vehicle' : 'service');
  const [selectedService, setSelectedService] = useState<ServiceType | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');

  const { data: services, isLoading: loadingServices } = useServiceTypes();
  const { data: vehicles, isLoading: loadingVehicles } = useVehicles();
  const { data: vouchers } = useVouchers('unused');
  const { mutateAsync: createOrder, isPending: creating } = useCreateOrder();
  const { mutateAsync: previewOrder, data: preview, isPending: previewing, reset: resetPreview } = usePreviewOrder();

  const service = selectedService ?? services?.find((s) => s.id === serviceId) ?? null;

  const fromDate = new Date();
  const toDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
  const { data: slots, isLoading: loadingSlots } = useAvailableSlots(
    step === 'slot' && service && selectedVehicle
      ? {
          serviceTypeId: service.id,
          vehicleTypeId: selectedVehicle.vehicleTypeId,
          from: fromDate.toISOString(),
          to: toDate.toISOString(),
        }
      : null,
  );

  useEffect(() => {
    if (step !== 'confirm' || !service || !selectedVehicle || !selectedSlot) return;
    previewOrder({
      serviceTypeId: service.id,
      vehicleTypeId: selectedVehicle.vehicleTypeId,
      scheduledAt: selectedSlot,
      voucherId: selectedVoucher?.id,
    }).catch(() => resetPreview());
  }, [step, selectedVoucher?.id, service?.id, selectedVehicle?.id, selectedSlot]);

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
        try { await WebBrowser.openBrowserAsync(order.payosCheckoutUrl); } catch {}
      }

      router.replace({ pathname: '/booking/[id]', params: { id: order.id } });
    } catch {
      Toast.show({ type: 'error', text1: t('bookingNew.failedTitle'), text2: t('bookingNew.failedSub') });
    }
  };

  const finalPrice = preview?.finalPrice ?? service?.basePrice ?? 0;
  const basePrice = preview?.basePrice ?? service?.basePrice ?? 0;
  const discountAmount = preview?.discountAmount ?? 0;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 }}>
        <Pressable onPress={goBack} style={{ padding: 4 }}>
          <ArrowLeft size={22} color={Colors.textPrimary} strokeWidth={1.5} />
        </Pressable>
        <Text style={{ fontSize: 17, fontWeight: '700', color: Colors.textPrimary }}>{t('bookingNew.title')}</Text>
      </View>

      <StepIndicator current={step} />

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
        {/* STEP: Service */}
        {step === 'service' && (
          <Animated.View entering={SlideInRight.springify()} style={{ gap: 12 }}>
            <Text style={{ fontSize: 15, fontWeight: '600', color: Colors.textPrimary, marginBottom: 4 }}>{t('bookingNew.pickService')}</Text>
            {loadingServices ? <LoadingSpinner /> : services?.map((s, i) => (
              <Animated.View key={s.id} entering={FadeInDown.delay(i * 60).springify()}>
                <Pressable
                  onPress={() => { setSelectedService(s); goNext(); }}
                  style={{
                    backgroundColor: Colors.surface, borderRadius: 16, padding: 16,
                    borderWidth: 2, borderColor: selectedService?.id === s.id ? Colors.primary : 'transparent',
                    flexDirection: 'row', alignItems: 'center',
                    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 15, fontWeight: '600', color: Colors.textPrimary }}>{s.name}</Text>
                    {s.durationMinutes ? (
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 }}>
                        <Clock size={13} color={Colors.textSecondary} strokeWidth={1.5} />
                        <Text style={{ fontSize: 12, color: Colors.textSecondary }}>{s.durationMinutes} {t('common.minutes')}</Text>
                      </View>
                    ) : null}
                  </View>
                  <View style={{ alignItems: 'flex-end', gap: 6 }}>
                    <Text style={{ fontSize: 16, fontWeight: '700', color: Colors.primary }}>{formatPrice(s.basePrice)}</Text>
                    <ChevronRight size={18} color={Colors.textDisabled} strokeWidth={1.5} />
                  </View>
                </Pressable>
              </Animated.View>
            ))}
          </Animated.View>
        )}

        {/* STEP: Vehicle */}
        {step === 'vehicle' && (
          <Animated.View entering={SlideInRight.springify()} style={{ gap: 12 }}>
            <Text style={{ fontSize: 15, fontWeight: '600', color: Colors.textPrimary, marginBottom: 4 }}>{t('bookingNew.pickVehicle')}</Text>
            {loadingVehicles ? <LoadingSpinner /> : vehicles?.map((v, i) => (
              <Animated.View key={v.id} entering={FadeInDown.delay(i * 60).springify()}>
                <Pressable
                  onPress={() => { setSelectedVehicle(v); goNext(); }}
                  style={{
                    backgroundColor: Colors.surface, borderRadius: 16, padding: 16,
                    borderWidth: 2, borderColor: selectedVehicle?.id === v.id ? Colors.primary : 'transparent',
                    flexDirection: 'row', alignItems: 'center', gap: 12,
                    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
                  }}
                >
                  <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center' }}>
                    <Car size={22} color={Colors.primary} strokeWidth={1.5} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 15, fontWeight: '600', color: Colors.textPrimary }}>{v.licensePlate}</Text>
                    <Text style={{ fontSize: 13, color: Colors.textSecondary, marginTop: 2 }}>{v.vehicleTypeName}</Text>
                  </View>
                  <ChevronRight size={18} color={Colors.textDisabled} strokeWidth={1.5} />
                </Pressable>
              </Animated.View>
            ))}
            <Pressable
              onPress={() => router.push('/vehicles/new')}
              style={{ borderRadius: 16, borderWidth: 1.5, borderColor: Colors.primary, borderStyle: 'dashed', padding: 16, alignItems: 'center' }}
            >
              <Text style={{ color: Colors.primary, fontWeight: '600' }}>{t('bookingNew.addVehicle')}</Text>
            </Pressable>
          </Animated.View>
        )}

        {/* STEP: Slot */}
        {step === 'slot' && (
          <Animated.View entering={SlideInRight.springify()} style={{ gap: 12 }}>
            <Text style={{ fontSize: 15, fontWeight: '600', color: Colors.textPrimary, marginBottom: 4 }}>{t('bookingNew.pickSlot')}</Text>
            {loadingSlots ? <LoadingSpinner /> : !slots?.length ? (
              <Text style={{ color: Colors.textSecondary, textAlign: 'center', marginTop: 24 }}>
                {t('bookingNew.noSlots')}
              </Text>
            ) : (
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                {slots.map((slot) => {
                  const tt = new Date(slot.startAt);
                  const label = tt.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
                  const dateLabel = tt.toLocaleDateString(undefined, { day: '2-digit', month: '2-digit' });
                  const isSelected = selectedSlot === slot.startAt;
                  return (
                    <Pressable
                      key={slot.startAt}
                      onPress={() => setSelectedSlot(slot.startAt)}
                      style={{
                        backgroundColor: isSelected ? Colors.primary : Colors.surface,
                        borderRadius: 12, padding: 12, minWidth: '30%', alignItems: 'center',
                        borderWidth: 1.5, borderColor: isSelected ? Colors.primary : Colors.border,
                      }}
                    >
                      <Text style={{ fontSize: 14, fontWeight: '700', color: isSelected ? Colors.white : Colors.textPrimary }}>{label}</Text>
                      <Text style={{ fontSize: 11, color: isSelected ? 'rgba(255,255,255,0.8)' : Colors.textSecondary, marginTop: 2 }}>{dateLabel}</Text>
                    </Pressable>
                  );
                })}
              </View>
            )}
            {selectedSlot && (
              <Button title={t('common.next')} onPress={goNext} className="mt-4" />
            )}
          </Animated.View>
        )}

        {/* STEP: Confirm */}
        {step === 'confirm' && service && selectedVehicle && selectedSlot && (
          <Animated.View entering={SlideInRight.springify()} style={{ gap: 14 }}>
            <Text style={{ fontSize: 15, fontWeight: '600', color: Colors.textPrimary }}>{t('bookingNew.summary')}</Text>

            <View style={{ backgroundColor: Colors.surface, borderRadius: 16, padding: 16, gap: 12,
              shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 }}>
              {[
                { icon: <Car size={16} color={Colors.textSecondary} strokeWidth={1.5} />,      label: t('bookingNew.service'),  value: service.name },
                { icon: <Car size={16} color={Colors.textSecondary} strokeWidth={1.5} />,      label: t('bookingNew.vehicle'),  value: `${selectedVehicle.licensePlate} (${selectedVehicle.vehicleTypeName})` },
                { icon: <Calendar size={16} color={Colors.textSecondary} strokeWidth={1.5} />, label: t('bookingNew.time'),     value: new Date(selectedSlot).toLocaleString() },
                { icon: <Clock size={16} color={Colors.textSecondary} strokeWidth={1.5} />,    label: t('bookingNew.duration'), value: `${service.durationMinutes ?? '—'} ${t('common.minutes')}` },
              ].map((row) => (
                <View key={row.label} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  {row.icon}
                  <Text style={{ color: Colors.textSecondary, fontSize: 13, width: 80 }}>{row.label}</Text>
                  <Text style={{ flex: 1, fontSize: 13, fontWeight: '600', color: Colors.textPrimary }}>{row.value}</Text>
                </View>
              ))}
            </View>

            {/* Voucher picker */}
            <View>
              <Text style={{ fontSize: 13, fontWeight: '600', color: Colors.textSecondary, marginBottom: 8 }}>{t('bookingNew.voucher')}</Text>
              {selectedVoucher ? (
                <Pressable
                  onPress={() => setSelectedVoucher(null)}
                  style={{
                    backgroundColor: Colors.primaryLight,
                    borderRadius: 12, padding: 14,
                    flexDirection: 'row', alignItems: 'center', gap: 12,
                    borderWidth: 1.5, borderColor: Colors.primary,
                  }}
                >
                  <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' }}>
                    <Tag size={18} color={Colors.white} strokeWidth={1.5} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 14, fontWeight: '700', color: Colors.textPrimary }}>
                      {t('bookingNew.discountUpTo')} {formatPrice(selectedVoucher.discountCapVnd)}
                    </Text>
                    <Text style={{ fontSize: 12, color: Colors.textSecondary, marginTop: 2 }}>{t('bookingNew.code')}: {selectedVoucher.code}</Text>
                  </View>
                  <Text style={{ fontSize: 12, color: Colors.danger, fontWeight: '600' }}>{t('common.remove')}</Text>
                </Pressable>
              ) : !vouchers?.length ? (
                <View style={{ backgroundColor: Colors.surface, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: Colors.border, borderStyle: 'dashed' }}>
                  <Text style={{ fontSize: 13, color: Colors.textSecondary, textAlign: 'center' }}>{t('bookingNew.noVouchers')}</Text>
                </View>
              ) : (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0 }} contentContainerStyle={{ gap: 8 }}>
                  {vouchers.map((v) => (
                    <Pressable
                      key={v.id}
                      onPress={() => setSelectedVoucher(v)}
                      style={{
                        backgroundColor: Colors.surface,
                        borderRadius: 12, padding: 12, minWidth: 180,
                        borderWidth: 1.5, borderColor: Colors.border,
                      }}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Tag size={14} color={Colors.primary} strokeWidth={1.5} />
                        <Text style={{ fontSize: 13, fontWeight: '700', color: Colors.primary }}>-{formatPrice(v.discountCapVnd)}</Text>
                      </View>
                      <Text style={{ fontSize: 11, color: Colors.textSecondary, marginTop: 4 }}>{t('bookingNew.code')}: {v.code}</Text>
                      <Text style={{ fontSize: 11, color: Colors.textSecondary }}>{t('bookingNew.expires')}: {new Date(v.expiresAt).toLocaleDateString()}</Text>
                    </Pressable>
                  ))}
                </ScrollView>
              )}
            </View>

            {/* Payment method */}
            <View>
              <Text style={{ fontSize: 13, fontWeight: '600', color: Colors.textSecondary, marginBottom: 8 }}>{t('bookingNew.paymentMethod')}</Text>
              <View style={{ flexDirection: 'row', gap: 10 }}>
                {([
                  { key: 'cash' as const,   label: t('bookingNew.cash'),   sub: t('bookingNew.cashSub'),   icon: Banknote },
                  { key: 'online' as const, label: t('bookingNew.online'), sub: t('bookingNew.onlineSub'), icon: CreditCard },
                ]).map((opt) => {
                  const Icon = opt.icon;
                  const active = paymentMethod === opt.key;
                  return (
                    <Pressable
                      key={opt.key}
                      onPress={() => setPaymentMethod(opt.key)}
                      style={{
                        flex: 1,
                        backgroundColor: active ? Colors.primaryLight : Colors.surface,
                        borderRadius: 12, padding: 14,
                        borderWidth: 1.5, borderColor: active ? Colors.primary : Colors.border,
                        alignItems: 'center', gap: 6,
                      }}
                    >
                      <Icon size={22} color={active ? Colors.primary : Colors.textSecondary} strokeWidth={1.5} />
                      <Text style={{ fontSize: 13, fontWeight: '700', color: active ? Colors.primary : Colors.textPrimary }}>{opt.label}</Text>
                      <Text style={{ fontSize: 11, color: Colors.textSecondary }}>{opt.sub}</Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* Price breakdown */}
            <View style={{ backgroundColor: Colors.surface, borderRadius: 16, padding: 16, gap: 8,
              shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 13, color: Colors.textSecondary }}>{t('bookingNew.basePrice')}</Text>
                <Text style={{ fontSize: 13, color: Colors.textPrimary }}>{formatPrice(basePrice)}</Text>
              </View>

              {preview?.appliedDiscounts?.map((d, i) => (
                <View key={i} style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ fontSize: 13, color: Colors.textSecondary }}>{d.label}</Text>
                  <Text style={{ fontSize: 13, color: Colors.success, fontWeight: '600' }}>-{formatPrice(d.amount)}</Text>
                </View>
              ))}

              {!preview?.appliedDiscounts?.length && discountAmount > 0 && (
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ fontSize: 13, color: Colors.textSecondary }}>{t('bookingNew.discount')}</Text>
                  <Text style={{ fontSize: 13, color: Colors.success, fontWeight: '600' }}>-{formatPrice(discountAmount)}</Text>
                </View>
              )}

              <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingTop: 8, borderTopWidth: 1, borderTopColor: Colors.border }}>
                <Text style={{ fontSize: 15, fontWeight: '700', color: Colors.textPrimary }}>{t('bookingNew.total')}</Text>
                <Text style={{ fontSize: 20, fontWeight: '800', color: Colors.primary }}>
                  {previewing ? '...' : formatPrice(finalPrice)}
                </Text>
              </View>
            </View>

            <Button
              title={paymentMethod === 'online' ? t('bookingNew.confirmAndPay') : t('bookingNew.confirm')}
              onPress={handleConfirm}
              loading={creating}
            />
          </Animated.View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
