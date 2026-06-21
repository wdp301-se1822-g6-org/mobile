import { Colors } from '@/constants/Colors';
import { useT } from '@/i18n/useT';
import { OrderStatus } from '@/types/booking';
import { Text, View } from 'react-native';

const STYLE: Record<OrderStatus, { color: string; bg: string }> = {
  pending:     { color: Colors.warning,       bg: '#FEF9C3' },
  confirmed:   { color: Colors.primary,       bg: Colors.primaryLight },
  in_progress: { color: Colors.primary,       bg: Colors.primaryMid },
  completed:   { color: Colors.success,       bg: '#DCFCE7' },
  cancelled:   { color: Colors.danger,        bg: '#FEE2E2' },
  no_show:     { color: Colors.textSecondary, bg: Colors.border },
};

export function StatusBadge({ status }: { status: OrderStatus }) {
  const t = useT();
  const { color, bg } = STYLE[status] ?? STYLE.pending;
  return (
    <View style={{ backgroundColor: bg, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 3 }}>
      <Text style={{ color, fontSize: 12, fontWeight: '600' }}>{t(`status.${status}` as any)}</Text>
    </View>
  );
}
