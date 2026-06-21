import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Colors } from '@/constants/Colors';
import { useT } from '@/i18n/useT';
import { useAvailableSlots, useOrder, useRescheduleOrder } from '@/hooks/booking/useBooking';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

export default function RescheduleScreen() {
  const t = useT();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: order, isLoading } = useOrder(id);
  const { mutateAsync: reschedule, isPending } = useRescheduleOrder();
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  const { data: slots, isLoading: loadingSlots } = useAvailableSlots(
    order
      ? {
          serviceTypeId: order.serviceTypeId,
          vehicleTypeId: '',
          from: new Date().toISOString(),
          to: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        }
      : null,
  );

  const handleConfirm = async () => {
    if (!selectedSlot) return;
    try {
      await reschedule({ id, dto: { scheduledAt: selectedSlot } });
      Toast.show({ type: 'success', text1: t('reschedule.successTitle') });
      router.back();
    } catch {
      Toast.show({ type: 'error', text1: t('reschedule.failedTitle') });
    }
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 }}>
        <Pressable onPress={() => router.back()} style={{ padding: 4 }}>
          <ArrowLeft size={22} color={Colors.textPrimary} strokeWidth={1.5} />
        </Pressable>
        <Text style={{ fontSize: 17, fontWeight: '700', color: Colors.textPrimary }}>{t('reschedule.title')}</Text>
      </View>

      <View style={{ padding: 16, gap: 12, flex: 1 }}>
        <Text style={{ fontSize: 15, fontWeight: '600', color: Colors.textPrimary }}>{t('reschedule.pickNewSlot')}</Text>
        {loadingSlots ? <LoadingSpinner /> : (
          <Animated.View entering={FadeInDown.springify()} style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
            {slots?.map((slot) => {
              const tt = new Date(slot.startAt);
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
                  <Text style={{ fontSize: 14, fontWeight: '700', color: isSelected ? Colors.white : Colors.textPrimary }}>
                    {tt.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                  <Text style={{ fontSize: 11, color: isSelected ? 'rgba(255,255,255,0.8)' : Colors.textSecondary, marginTop: 2 }}>
                    {tt.toLocaleDateString(undefined, { day: '2-digit', month: '2-digit' })}
                  </Text>
                </Pressable>
              );
            })}
          </Animated.View>
        )}
        {selectedSlot && (
          <Button title={t('reschedule.confirm')} onPress={handleConfirm} loading={isPending} className="mt-auto" />
        )}
      </View>
    </SafeAreaView>
  );
}
