import { Colors } from '@/constants/Colors';
import { LucideIcon } from 'lucide-react-native';
import { Text, View } from 'react-native';

type Props = {
  icon?: LucideIcon;
  title: string;
  description?: string;
};

export function EmptyState({ icon: Icon, title, description }: Props) {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32, paddingVertical: 64 }}>
      {Icon && (
        <View style={{
          width: 84, height: 84, borderRadius: 42,
          backgroundColor: Colors.primaryLight,
          alignItems: 'center', justifyContent: 'center',
          marginBottom: 16,
        }}>
          <Icon size={36} color={Colors.primary} strokeWidth={1.5} />
        </View>
      )}
      <Text style={{ fontSize: 16, fontWeight: '700', color: Colors.textPrimary, textAlign: 'center' }}>
        {title}
      </Text>
      {description && (
        <Text style={{ fontSize: 13, color: Colors.textSecondary, textAlign: 'center', marginTop: 6, lineHeight: 19, maxWidth: 280 }}>
          {description}
        </Text>
      )}
    </View>
  );
}
