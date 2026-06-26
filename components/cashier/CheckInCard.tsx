import { Colors } from '@/constants/Colors';
import { AdminOrder, OrderStatus } from '@/services/cashier.service';
import { Car, Clock, User } from 'lucide-react-native';
import { Text, View } from 'react-native';
import { PressableCard } from '../ui/PressableCard';

const STATUS_MAP: Record<OrderStatus, { label: string; color: string; bg: string }> = {
  pending_payment: { label: 'Chờ thanh toán', color: Colors.textSecondary, bg: Colors.primaryLight },
  confirmed:       { label: 'Chờ check-in',   color: Colors.warning,       bg: '#FEF9C3' },
  checked_in:      { label: 'Đã nhận xe',      color: Colors.success,       bg: '#DCFCE7' },
  in_progress:     { label: 'Đang rửa',        color: Colors.primary,       bg: Colors.primaryLight },
  completed:       { label: 'Hoàn thành',      color: Colors.success,       bg: '#DCFCE7' },
  cancelled:       { label: 'Đã huỷ',          color: Colors.danger,        bg: '#FEE2E2' },
  no_show:         { label: 'Vắng mặt',        color: Colors.danger,        bg: '#FEE2E2' },
};

function formatTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' });
}

function formatVnd(n?: number): string {
  if (n == null) return '';
  return n.toLocaleString('vi-VN') + 'đ';
}

export function CheckInCard({ order, onPress }: { order: AdminOrder; onPress?: () => void }) {
  const s = STATUS_MAP[order.status] ?? { label: order.status, color: Colors.textSecondary, bg: Colors.primaryLight };

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
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <View style={{ flex: 1, paddingRight: 8 }}>
          <Text style={{ fontSize: 15, fontWeight: '700', color: Colors.textPrimary }}>{order.licensePlate}</Text>
          <Text style={{ fontSize: 13, color: Colors.textSecondary, marginTop: 1 }}>{order.serviceName}</Text>
        </View>
        <View style={{ backgroundColor: s.bg, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 3 }}>
          <Text style={{ color: s.color, fontSize: 12, fontWeight: '600' }}>{s.label}</Text>
        </View>
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10, gap: 6 }}>
        <User size={14} color={Colors.textSecondary} strokeWidth={1.5} />
        <Text style={{ fontSize: 13, color: Colors.textSecondary }}>{order.customerName}</Text>
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Clock size={14} color={Colors.textSecondary} strokeWidth={1.5} />
          <Text style={{ fontSize: 13, color: Colors.textSecondary }}>{formatTime(order.scheduledAt)}</Text>
        </View>
        {order.amount != null && (
          <Text style={{ fontSize: 13, fontWeight: '700', color: Colors.textPrimary }}>{formatVnd(order.amount)}</Text>
        )}
      </View>
    </PressableCard>
  );
}
