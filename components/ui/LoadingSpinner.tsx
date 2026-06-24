import { Colors } from '@/constants/Colors';
import { ActivityIndicator, View } from 'react-native';

export function LoadingSpinner({ size = 'large' }: { size?: 'small' | 'large' }) {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <ActivityIndicator size={size} color={Colors.primary} />
    </View>
  );
}
