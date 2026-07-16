import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Colors } from '@/constants/Colors';
import { useT } from '@/i18n/useT';
import { useCreateVehicle, useVehicleTypes } from '@/hooks/vehicle/useVehicle';
import { localizedVehicleError } from '@/utils/vehicleError';
import { localizedVehicleTypeName } from '@/utils/vehicleTypeLabel';
import { router } from 'expo-router';
import { ArrowLeft, ChevronRight } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

export default function NewVehicleScreen() {
  const t = useT();
  const { data: vehicleTypes, isLoading } = useVehicleTypes();
  const { mutateAsync: createVehicle, isPending } = useCreateVehicle();

  const [licensePlate, setLicensePlate] = useState('');
  const [selectedTypeId, setSelectedTypeId] = useState<string | null>(null);
  const [plateError, setPlateError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!licensePlate.trim() || !selectedTypeId) return;
    try {
      await createVehicle({ vehicleTypeId: selectedTypeId, licensePlate: licensePlate.trim().toUpperCase() });
      Toast.show({ type: 'success', text1: t('vehicle.addOk') });
      router.back();
    } catch (error) {
      const detail = localizedVehicleError(error, t);
      setPlateError(detail.field === 'licensePlate' ? detail.message : null);
      Toast.show({
        type: 'error',
        text1: t('vehicle.addErr'),
        text2: detail.message,
      });
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 }}>
        <Pressable onPress={() => router.back()} style={{ padding: 4 }}>
          <ArrowLeft size={22} color={Colors.textPrimary} strokeWidth={1.5} />
        </Pressable>
        <Text style={{ fontSize: 17, fontWeight: '700', color: Colors.textPrimary }}>{t('vehicle.formTitle')}</Text>
      </View>

      <View style={{ padding: 16, gap: 20, flex: 1 }}>
        <Animated.View entering={FadeInDown.springify()}>
          <Text style={{ fontSize: 13, fontWeight: '600', color: Colors.textSecondary, marginBottom: 8 }}>{t('vehicle.labelPlate')}</Text>
          <TextInput
            value={licensePlate}
            onChangeText={(value) => {
              setLicensePlate(value);
              setPlateError(null);
            }}
            placeholder={t('vehicle.placeholderPlate')}
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
              borderColor: plateError ? Colors.danger : licensePlate ? Colors.primary : Colors.border,
            }}
          />
          {plateError ? (
            <Text style={{ color: Colors.danger, fontSize: 12, marginTop: 6 }}>{plateError}</Text>
          ) : null}
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(80).springify()}>
          <Text style={{ fontSize: 13, fontWeight: '600', color: Colors.textSecondary, marginBottom: 8 }}>{t('vehicle.labelType')}</Text>
          {isLoading ? <LoadingSpinner size="small" /> : (
            <View style={{ gap: 8 }}>
              {vehicleTypes?.map((vt) => (
                <Pressable
                  key={vt.id}
                  onPress={() => setSelectedTypeId(vt.id)}
                  style={{
                    backgroundColor: selectedTypeId === vt.id ? Colors.primaryLight : Colors.surface,
                    borderRadius: 12, padding: 14,
                    flexDirection: 'row', alignItems: 'center',
                    borderWidth: 1.5,
                    borderColor: selectedTypeId === vt.id ? Colors.primary : Colors.border,
                  }}
                >
                  <Text style={{ flex: 1, fontSize: 14, fontWeight: '500', color: Colors.textPrimary }}>
                    {localizedVehicleTypeName(vt.name, t)}
                  </Text>
                  <ChevronRight size={16} color={selectedTypeId === vt.id ? Colors.primary : Colors.textDisabled} strokeWidth={1.5} />
                </Pressable>
              ))}
            </View>
          )}
        </Animated.View>

        <Button
          title={t('vehicle.addBtn')}
          onPress={handleSubmit}
          loading={isPending}
          disabled={!licensePlate.trim() || !selectedTypeId}
          className="mt-auto"
        />
      </View>
    </SafeAreaView>
  );
}
