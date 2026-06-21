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
    <View className="flex-1 items-center justify-center px-8 py-16">
      {Icon && <Icon size={48} color={Colors.textDisabled} strokeWidth={1.5} />}
      <Text className="mt-4 text-base font-semibold text-center" style={{ color: Colors.textPrimary }}>
        {title}
      </Text>
      {description && (
        <Text className="mt-2 text-sm text-center" style={{ color: Colors.textSecondary }}>
          {description}
        </Text>
      )}
    </View>
  );
}
