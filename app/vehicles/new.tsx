import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Colors } from '@/constants/Colors';
import { useCreateVehicle, useVehicleTypes } from '@/hooks/vehicle/useVehicle';
import { router } from 'expo-router';
import { ArrowLeft, ChevronRight } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

export default function NewVehicleScreen() {
  const { data: vehicleTypes, isLoading } = useVehicleTypes();
  const { mutateAsync: createVehicle, isPending } = useCreateVehicle();

  const [licensePlate, setLicensePlate] = useState('');
  const [selectedTypeId, setSelectedTypeId] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!licensePlate.trim() || !selectedTypeId) {
      Toast.show({ type: 'error', text1: 'Vui lòng điền đầy đủ thông tin' });
      return;
    }
    try {
      await createVehicle({ vehicleTypeId: selectedTypeId, licensePlate: licensePlate.trim().toUpperCase() });
      Toast.show({ type: 'success', text1: 'Đã thêm xe' });
      router.back();
    } catch {
      Toast.show({ type: 'error', text1: 'Không thể thêm xe' });
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 }}>
        <Pressable onPress={() => router.back()} style={{ padding: 4 }}>
          <ArrowLeft size={22} color={Colors.textPrimary} strokeWidth={1.5} />
        </Pressable>
        <Text style={{ fontSize: 17, fontWeight: '700', color: Colors.textPrimary }}>Thêm xe mới</Text>
      </View>

      <View style={{ padding: 16, gap: 20, flex: 1 }}>
        {/* License plate */}
        <Animated.View entering={FadeInDown.springify()}>
          <Text style={{ fontSize: 13, fontWeight: '600', color: Colors.textSecondary, marginBottom: 8 }}>BIỂN SỐ XE</Text>
          <TextInput
            value={licensePlate}
            onChangeText={setLicensePlate}
            placeholder="VD: 51G-123.45"
            placeholderTextColor={Colors.textDisabled}
            autoCapitalize="characters"
            style={{
              backgroundColor: Colors.surface,
              borderRadius: 12,
              padding: 14,
              fontSize: 16,
              fontWeight: '600',
              color: Colors.textPrimary,
              borderWidth: 1.5,
              borderColor: licensePlate ? Colors.primary : Colors.border,
            }}
          />
        </Animated.View>

        {/* Vehicle type */}
        <Animated.View entering={FadeInDown.delay(80).springify()}>
          <Text style={{ fontSize: 13, fontWeight: '600', color: Colors.textSecondary, marginBottom: 8 }}>LOẠI XE</Text>
          {isLoading ? <LoadingSpinner size="small" /> : (
            <View style={{ gap: 8 }}>
              {vehicleTypes?.map((t) => (
                <Pressable
                  key={t.id}
                  onPress={() => setSelectedTypeId(t.id)}
                  style={{
                    backgroundColor: selectedTypeId === t.id ? Colors.primaryLight : Colors.surface,
                    borderRadius: 12,
                    padding: 14,
                    flexDirection: 'row',
                    alignItems: 'center',
                    borderWidth: 1.5,
                    borderColor: selectedTypeId === t.id ? Colors.primary : Colors.border,
                  }}
                >
                  <Text style={{ flex: 1, fontSize: 14, fontWeight: '500', color: Colors.textPrimary }}>{t.name}</Text>
                  <ChevronRight size={16} color={selectedTypeId === t.id ? Colors.primary : Colors.textDisabled} strokeWidth={1.5} />
                </Pressable>
              ))}
            </View>
          )}
        </Animated.View>

        <Button
          title="Thêm xe"
          onPress={handleSubmit}
          loading={isPending}
          disabled={!licensePlate.trim() || !selectedTypeId}
          className="mt-auto"
        />
      </View>
    </SafeAreaView>
  );
}
