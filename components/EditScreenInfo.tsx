import { Colors } from '@/constants/Colors';
import { Text, View } from 'react-native';

export default function EditScreenInfo({ path }: { path: string }) {
  return (
    <View style={{ alignItems: 'center', marginHorizontal: 50 }}>
      <Text style={{ fontSize: 14, color: Colors.textSecondary, textAlign: 'center' }}>
        {path}
      </Text>
    </View>
  );
}
