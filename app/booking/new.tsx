import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Colors } from '@/constants/Colors';
import { useCreateOrder, useAvailableSlots } from '@/hooks/booking/useBooking';
import { useVehicles } from '@/hooks/vehicle/useVehicle';
import { useServiceTypes } from '@/hooks/useServiceTypes';
import { ServiceType } from '@/types/service';
import { Vehicle } from '@/types/vehicle';
import { formatPrice } from '@/utils/formatters';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Calendar, Car, CheckCircle, ChevronRight, Clock } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import Animated, { FadeInDown, SlideInRight } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

type Step = 'service' | 'vehicle' | 'slot' | 'confirm';

const STEPS: Step[] = ['service', 'vehicle', 'slot', 'confirm'];
const STEP_LABELS: Record<Step, string> = {
  service: 'Dịch vụ',
  vehicle: 'Xe',
  slot: 'Thời gian',
  confirm: 'Xác nhận',
};

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
  const { serviceId } = useLocalSearchParams<{ serviceId?: string }>();

  const [step, setStep] = useState<Step>(serviceId ? 'vehicle' : 'service');
  const [selectedService, setSelectedService] = useState<ServiceType | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  const { data: services, isLoading: loadingServices } = useServiceTypes();
  const { data: vehicles, isLoading: loadingVehicles } = useVehicles();
  const { mutateAsync: createOrder, isPending: creating } = useCreateOrder();

  // Preselect service if passed via params
  const service = selectedService ?? services?.find((s) => s.id === serviceId) ?? null;

  // Generate slot dates for next 3 days
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
      : null
  );

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
        paymentMethod: 'cash',
      });
      Toast.show({ type: 'success', text1: 'Đặt lịch thành công!' });
      router.replace({ pathname: '/booking/[id]', params: { id: order.id } });
    } catch {
      Toast.show({ type: 'error', text1: 'Đặt lịch thất bại', text2: 'Vui lòng thử lại' });
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }}>
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 }}>
        <Pressable onPress={goBack} style={{ padding: 4 }}>
          <ArrowLeft size={22} color={Colors.textPrimary} strokeWidth={1.5} />
        </Pressable>
        <Text style={{ fontSize: 17, fontWeight: '700', color: Colors.textPrimary }}>Đặt lịch rửa xe</Text>
      </View>

      <StepIndicator current={step} />

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        {/* STEP: Service */}
        {step === 'service' && (
          <Animated.View entering={SlideInRight.springify()} style={{ gap: 12 }}>
            <Text style={{ fontSize: 15, fontWeight: '600', color: Colors.textPrimary, marginBottom: 4 }}>
              Chọn dịch vụ
            </Text>
            {loadingServices ? <LoadingSpinner /> : services?.map((s, i) => (
              <Animated.View key={s.id} entering={FadeInDown.delay(i * 60).springify()}>
                <Pressable
                  onPress={() => { setSelectedService(s); goNext(); }}
                  style={{
                    backgroundColor: Colors.surface,
                    borderRadius: 16,
                    padding: 16,
                    borderWidth: 2,
                    borderColor: selectedService?.id === s.id ? Colors.primary : 'transparent',
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
                    <Text style={{ fontSize: 15, fontWeight: '600', color: Colors.textPrimary }}>{s.name}</Text>
                    <View style={{ flexDirection: 'row', gap: 12, marginTop: 6 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                        <Clock size={13} color={Colors.textSecondary} strokeWidth={1.5} />
                        <Text style={{ fontSize: 12, color: Colors.textSecondary }}>{s.durationMinutes} phút</Text>
                      </View>
                    </View>
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
            <Text style={{ fontSize: 15, fontWeight: '600', color: Colors.textPrimary, marginBottom: 4 }}>
              Chọn xe của bạn
            </Text>
            {loadingVehicles ? <LoadingSpinner /> : vehicles?.map((v, i) => (
              <Animated.View key={v.id} entering={FadeInDown.delay(i * 60).springify()}>
                <Pressable
                  onPress={() => { setSelectedVehicle(v); goNext(); }}
                  style={{
                    backgroundColor: Colors.surface,
                    borderRadius: 16,
                    padding: 16,
                    borderWidth: 2,
                    borderColor: selectedVehicle?.id === v.id ? Colors.primary : 'transparent',
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
              <Text style={{ color: Colors.primary, fontWeight: '600' }}>+ Thêm xe mới</Text>
            </Pressable>
          </Animated.View>
        )}

        {/* STEP: Slot */}
        {step === 'slot' && (
          <Animated.View entering={SlideInRight.springify()} style={{ gap: 12 }}>
            <Text style={{ fontSize: 15, fontWeight: '600', color: Colors.textPrimary, marginBottom: 4 }}>
              Chọn thời gian
            </Text>
            {loadingSlots ? <LoadingSpinner /> : !slots?.length ? (
              <Text style={{ color: Colors.textSecondary, textAlign: 'center', marginTop: 24 }}>
                Không có khung giờ trống trong 3 ngày tới
              </Text>
            ) : (
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                {slots.map((slot) => {
                  const t = new Date(slot.startAt);
                  const label = t.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
                  const dateLabel = t.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
                  const isSelected = selectedSlot === slot.startAt;
                  return (
                    <Pressable
                      key={slot.startAt}
                      onPress={() => setSelectedSlot(slot.startAt)}
                      style={{
                        backgroundColor: isSelected ? Colors.primary : Colors.surface,
                        borderRadius: 12,
                        padding: 12,
                        minWidth: '30%',
                        alignItems: 'center',
                        borderWidth: 1.5,
                        borderColor: isSelected ? Colors.primary : Colors.border,
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
              <Button title="Tiếp tục" onPress={goNext} className="mt-4" />
            )}
          </Animated.View>
        )}

        {/* STEP: Confirm */}
        {step === 'confirm' && service && selectedVehicle && selectedSlot && (
          <Animated.View entering={SlideInRight.springify()} style={{ gap: 16 }}>
            <Text style={{ fontSize: 15, fontWeight: '600', color: Colors.textPrimary }}>Xác nhận đặt lịch</Text>

            <View style={{ backgroundColor: Colors.surface, borderRadius: 16, padding: 16, gap: 12,
              shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 }}>
              {[
                { icon: <Car size={16} color={Colors.textSecondary} strokeWidth={1.5} />, label: 'Dịch vụ', value: service.name },
                { icon: <Car size={16} color={Colors.textSecondary} strokeWidth={1.5} />, label: 'Xe', value: `${selectedVehicle.licensePlate} (${selectedVehicle.vehicleTypeName})` },
                { icon: <Calendar size={16} color={Colors.textSecondary} strokeWidth={1.5} />, label: 'Thời gian', value: new Date(selectedSlot).toLocaleString('vi-VN') },
                { icon: <Clock size={16} color={Colors.textSecondary} strokeWidth={1.5} />, label: 'Thời lượng', value: `${service.durationMinutes} phút` },
              ].map((row) => (
                <View key={row.label} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  {row.icon}
                  <Text style={{ color: Colors.textSecondary, fontSize: 13, width: 80 }}>{row.label}</Text>
                  <Text style={{ flex: 1, fontSize: 13, fontWeight: '600', color: Colors.textPrimary }}>{row.value}</Text>
                </View>
              ))}
            </View>

            <View style={{ backgroundColor: Colors.primaryLight, borderRadius: 16, padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ fontSize: 15, color: Colors.textPrimary, fontWeight: '500' }}>Tổng tiền</Text>
              <Text style={{ fontSize: 20, fontWeight: '800', color: Colors.primary }}>{formatPrice(service.basePrice)}</Text>
            </View>

            <Button title="Xác nhận đặt lịch" onPress={handleConfirm} loading={creating} />
          </Animated.View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
