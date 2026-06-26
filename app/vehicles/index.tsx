import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Colors } from '@/constants/Colors';
import { useT } from '@/i18n/useT';
import { useDeleteVehicle, useSetDefaultVehicle, useVehicles } from '@/hooks/vehicle/useVehicle';
import { Vehicle } from '@/types/vehicle';
import { vehicleIcon } from '@/utils/vehicleIcon';
import { router } from 'expo-router';
import { ArrowLeft, Car, MoreVertical, Plus, Star, Trash2 } from 'lucide-react-native';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

function VehicleRow({
  vehicle, onSetDefault, onDelete,
}: {
  vehicle: Vehicle;
  onSetDefault: () => void;
  onDelete: () => void;
}) {
  const t = useT();
  const isDefault = vehicle.isDefault;
  const Icon = vehicleIcon(vehicle.vehicleTypeName);

  return (
    <View
      style={{
        backgroundColor: Colors.surface,
        borderRadius: 18,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.07,
        shadowRadius: 10,
        elevation: 3,
        borderWidth: isDefault ? 1.5 : 0,
        borderColor: isDefault ? Colors.primary : 'transparent',
      }}
    >
      {/* Top "plate" stripe */}
      <View style={{
        backgroundColor: isDefault ? Colors.primary : Colors.textPrimary,
        paddingVertical: 14, paddingHorizontal: 16,
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <View style={{
            width: 32, height: 32, borderRadius: 8,
            backgroundColor: 'rgba(255,255,255,0.15)',
            alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon size={18} color={Colors.white} strokeWidth={1.8} />
          </View>
          <Text style={{ fontSize: 20, fontWeight: '900', color: Colors.white, letterSpacing: 1 }}>
            {vehicle.licensePlate}
          </Text>
        </View>
        {isDefault && (
          <View style={{
            flexDirection: 'row', alignItems: 'center', gap: 4,
            backgroundColor: 'rgba(255,255,255,0.2)',
            paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999,
          }}>
            <Star size={11} color={Colors.white} fill={Colors.white} strokeWidth={2} />
            <Text style={{ color: Colors.white, fontSize: 10, fontWeight: '800', letterSpacing: 0.5 }}>
              {t('vehicle.defaultBadge').toUpperCase()}
            </Text>
          </View>
        )}
      </View>

      {/* Body */}
      <View style={{ paddingHorizontal: 16, paddingVertical: 14 }}>
        <Text style={{ fontSize: 13, color: Colors.textSecondary, fontWeight: '500' }}>
          {vehicle.vehicleTypeName}
        </Text>
      </View>

      {/* Actions */}
      <View style={{
        flexDirection: 'row',
        borderTopWidth: 1, borderTopColor: Colors.border,
      }}>
        {!isDefault && (
          <Pressable
            onPress={onSetDefault}
            style={{
              flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
              paddingVertical: 12, gap: 6,
              borderRightWidth: 1, borderRightColor: Colors.border,
            }}
          >
            <Star size={14} color={Colors.gold} strokeWidth={1.8} />
            <Text style={{ fontSize: 13, fontWeight: '600', color: Colors.textPrimary }}>
              {t('vehicle.setDefault')}
            </Text>
          </Pressable>
        )}
        <Pressable
          onPress={onDelete}
          style={{
            flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
            paddingVertical: 12, gap: 6,
          }}
        >
          <Trash2 size={14} color={Colors.danger} strokeWidth={1.8} />
          <Text style={{ fontSize: 13, fontWeight: '600', color: Colors.danger }}>
            {t('vehicle.delete')}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

function EmptyVehicles() {
  const t = useT();
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 }}>
      {/* Decorative illustration */}
      <View style={{ position: 'relative', width: 180, height: 180, marginBottom: 24 }}>
        <View style={{
          position: 'absolute', width: 180, height: 180, borderRadius: 90,
          backgroundColor: Colors.primaryLight,
        }} />
        <View style={{
          position: 'absolute', top: 25, left: 25,
          width: 130, height: 130, borderRadius: 65,
          backgroundColor: Colors.primaryMid,
        }} />
        <View style={{
          position: 'absolute', top: 50, left: 50,
          width: 80, height: 80, borderRadius: 24,
          backgroundColor: Colors.primary,
          alignItems: 'center', justifyContent: 'center',
          shadowColor: Colors.primary,
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.4,
          shadowRadius: 10,
          elevation: 6,
        }}>
          <Car size={40} color={Colors.white} strokeWidth={1.8} />
        </View>
      </View>

      <Text style={{ fontSize: 18, fontWeight: '800', color: Colors.textPrimary, marginBottom: 8, textAlign: 'center' }}>
        {t('vehicle.empty')}
      </Text>
      <Text style={{ fontSize: 13, color: Colors.textSecondary, textAlign: 'center', lineHeight: 19, marginBottom: 24, maxWidth: 280 }}>
        {t('vehicle.emptySub')}
      </Text>

      <Pressable
        onPress={() => router.push('/vehicles/new')}
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
        <Text style={{ color: Colors.white, fontWeight: '700', fontSize: 14 }}>
          {t('vehicle.add').replace(/^\+\s*/, '')}
        </Text>
      </Pressable>
    </View>
  );
}

export default function VehiclesScreen() {
  const t = useT();
  const { data: vehicles, isLoading } = useVehicles();
  const { mutate: deleteVehicle } = useDeleteVehicle();
  const { mutate: setDefault } = useSetDefaultVehicle();

  const handleDelete = (v: Vehicle) => {
    Alert.alert(t('vehicle.deleteTitle'), t('vehicle.deleteBody', { plate: v.licensePlate }), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.delete'), style: 'destructive',
        onPress: () => deleteVehicle(v.id, {
          onSuccess: () => Toast.show({ type: 'success', text1: t('vehicle.deleteOk') }),
          onError: () => Toast.show({ type: 'error', text1: t('vehicle.deleteErr') }),
        }),
      },
    ]);
  };

  const handleSetDefault = (v: Vehicle) => {
    setDefault(v.id, {
      onSuccess: () => Toast.show({ type: 'success', text1: t('vehicle.setDefaultOk') }),
    });
  };

  const hasAny = (vehicles?.length ?? 0) > 0;

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: Colors.background }}>
      {/* Header */}
      <View style={{ paddingHorizontal: 16, paddingTop: 14, paddingBottom: 12, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <Pressable onPress={() => router.back()} style={{ padding: 4 }}>
          <ArrowLeft size={22} color={Colors.textPrimary} strokeWidth={1.8} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 22, fontWeight: '900', color: Colors.textPrimary, letterSpacing: -0.3 }}>
            {t('vehicle.title')}
          </Text>
          {hasAny ? (
            <Text style={{ fontSize: 12, color: Colors.textSecondary, marginTop: 2 }}>
              {vehicles!.length} {vehicles!.length === 1 ? 'vehicle' : 'vehicles'}
            </Text>
          ) : null}
        </View>
        {hasAny && (
          <Pressable
            onPress={() => router.push('/vehicles/new')}
            style={{
              flexDirection: 'row', alignItems: 'center', gap: 6,
              backgroundColor: Colors.primary, borderRadius: 12,
              paddingHorizontal: 14, paddingVertical: 10,
              shadowColor: Colors.primary, shadowOffset: { width: 0, height: 3 },
              shadowOpacity: 0.3, shadowRadius: 6, elevation: 3,
            }}
          >
            <Plus size={15} color={Colors.white} strokeWidth={2.5} />
            <Text style={{ color: Colors.white, fontSize: 13, fontWeight: '700' }}>
              {t('vehicle.add').replace(/^\+\s*/, '')}
            </Text>
          </Pressable>
        )}
      </View>

      {isLoading ? (
        <LoadingSpinner />
      ) : !hasAny ? (
        <EmptyVehicles />
      ) : (
        <ScrollView contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
          {vehicles!.map((v, i) => (
            <Animated.View key={v.id} entering={FadeInDown.delay(i * 70).springify()}>
              <VehicleRow
                vehicle={v}
                onSetDefault={() => handleSetDefault(v)}
                onDelete={() => handleDelete(v)}
              />
            </Animated.View>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
