import { Colors } from '@/constants/Colors';
import { Vehicle } from '@/types/vehicle';
import { vehicleIcon } from '@/utils/vehicleIcon';
import { Star } from 'lucide-react-native';
import { Text, View } from 'react-native';
import { PressableCard } from '../ui/PressableCard';

type Props = {
  vehicle: Vehicle;
  onPress?: () => void;
  onSetDefault?: () => void;
};

export function VehicleCard({ vehicle, onPress }: Props) {
  const Icon = vehicleIcon(vehicle.vehicleTypeName);
  return (
    <PressableCard
      onPress={onPress}
      style={{
        backgroundColor: Colors.surface,
        borderRadius: 16,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <View style={{
          width: 44, height: 44, borderRadius: 12,
          backgroundColor: Colors.primaryLight,
          alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon size={22} color={Colors.primary} strokeWidth={1.5} />
        </View>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text style={{ fontSize: 15, fontWeight: '600', color: Colors.textPrimary }}>
              {vehicle.licensePlate}
            </Text>
            {vehicle.isDefault && (
              <Star size={14} color={Colors.gold} fill={Colors.gold} />
            )}
          </View>
          <Text style={{ fontSize: 13, color: Colors.textSecondary, marginTop: 2 }}>
            {vehicle.vehicleTypeName}
          </Text>
        </View>
      </View>
    </PressableCard>
  );
}
