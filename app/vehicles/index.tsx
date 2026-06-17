import { VehicleCard } from '@/components/vehicle/VehicleCard';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Colors } from '@/constants/Colors';
import { useDeleteVehicle, useSetDefaultVehicle, useVehicles } from '@/hooks/vehicle/useVehicle';
import { Vehicle } from '@/types/vehicle';
import { router } from 'expo-router';
import { ArrowLeft, Car, Star } from 'lucide-react-native';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

export default function VehiclesScreen() {
  const { data: vehicles, isLoading } = useVehicles();
  const { mutate: deleteVehicle } = useDeleteVehicle();
  const { mutate: setDefault } = useSetDefaultVehicle();

  const handleDelete = (v: Vehicle) => {
    Alert.alert('Xoá xe', `Xoá biển số ${v.licensePlate}?`, [
      { text: 'Huỷ', style: 'cancel' },
      {
        text: 'Xoá', style: 'destructive',
        onPress: () => deleteVehicle(v.id, {
          onSuccess: () => Toast.show({ type: 'success', text1: 'Đã xoá xe' }),
          onError: () => Toast.show({ type: 'error', text1: 'Không thể xoá xe' }),
        }),
      },
    ]);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 }}>
        <Pressable onPress={() => router.back()} style={{ padding: 4 }}>
          <ArrowLeft size={22} color={Colors.textPrimary} strokeWidth={1.5} />
        </Pressable>
        <Text style={{ fontSize: 17, fontWeight: '700', color: Colors.textPrimary, flex: 1 }}>Xe của tôi</Text>
        <Button title="+ Thêm" variant="secondary" onPress={() => router.push('/vehicles/new')} />
      </View>

      {isLoading ? <LoadingSpinner /> : !vehicles?.length ? (
        <EmptyState icon={Car} title="Chưa có xe nào" description="Thêm xe để đặt lịch nhanh hơn" />
      ) : (
        <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }} showsVerticalScrollIndicator={false}>
          {vehicles.map((v, i) => (
            <Animated.View key={v.id} entering={FadeInDown.delay(i * 60).springify()}>
              <VehicleCard vehicle={v} />
              <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
                {!v.isDefault && (
                  <Pressable
                    onPress={() => setDefault(v.id, { onSuccess: () => Toast.show({ type: 'success', text1: 'Đã đặt làm mặc định' }) })}
                    style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4,
                      borderWidth: 1, borderColor: Colors.border, borderRadius: 10, paddingVertical: 8 }}
                  >
                    <Star size={14} color={Colors.gold} strokeWidth={1.5} />
                    <Text style={{ fontSize: 13, color: Colors.textSecondary }}>Đặt mặc định</Text>
                  </Pressable>
                )}
                <Pressable
                  onPress={() => handleDelete(v)}
                  style={{ flex: 1, alignItems: 'center', justifyContent: 'center',
                    borderWidth: 1, borderColor: '#FECACA', borderRadius: 10, paddingVertical: 8 }}
                >
                  <Text style={{ fontSize: 13, color: Colors.danger }}>Xoá</Text>
                </Pressable>
              </View>
            </Animated.View>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
