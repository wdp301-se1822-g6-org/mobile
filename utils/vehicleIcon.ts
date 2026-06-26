import { Bike, Car, type LucideIcon } from 'lucide-react-native';

// Pick an icon based on the vehicle type name (e.g. "Car", "Motorbike").
// Matches case-insensitively and falls back to the car icon for unknown types.
export function vehicleIcon(typeName?: string): LucideIcon {
  const n = (typeName ?? '').toLowerCase();
  if (n.includes('moto') || n.includes('bike') || n.includes('xe máy') || n.includes('xe may')) {
    return Bike;
  }
  return Car;
}
