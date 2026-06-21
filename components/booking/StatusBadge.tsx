import { Colors } from '@/constants/Colors';
import { OrderStatus } from '@/types/booking';
import { Text, View } from 'react-native';

const STATUS_MAP: Record<OrderStatus, { label: string; color: string; bg: string }> = {
  pending:     { label: 'Chờ xác nhận', color: Colors.warning, bg: '#FEF9C3' },
  confirmed:   { label: 'Đã xác nhận',  color: Colors.primary, bg: Colors.primaryLight },
  in_progress: { label: 'Đang rửa',     color: Colors.primary, bg: Colors.primaryMid },
  completed:   { label: 'Hoàn thành',   color: Colors.success, bg: '#DCFCE7' },
  cancelled:   { label: 'Đã huỷ',       color: Colors.danger,  bg: '#FEE2E2' },
  no_show:     { label: 'Vắng mặt',     color: Colors.textSecondary, bg: Colors.border },
};

export function StatusBadge({ status }: { status: OrderStatus }) {
  const { label, color, bg } = STATUS_MAP[status] ?? STATUS_MAP.pending;
  return (
    <View style={{ backgroundColor: bg, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 3 }}>
      <Text style={{ color, fontSize: 12, fontWeight: '600' }}>{label}</Text>
    </View>
  );
}
