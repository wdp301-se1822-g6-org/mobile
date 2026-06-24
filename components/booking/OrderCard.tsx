import { Colors } from '@/constants/Colors';
import { useT } from '@/i18n/useT';
import { Order, OrderStatus } from '@/types/booking';
import { formatPrice } from '@/utils/formatters';
import { Calendar, Car, Clock } from 'lucide-react-native';
import { Text, View } from 'react-native';
import { PressableCard } from '../ui/PressableCard';
import { StatusBadge } from './StatusBadge';

type Props = {
  order: Order;
  onPress?: () => void;
};

const STATUS_ACCENT: Record<OrderStatus, string> = {
  pending:     Colors.warning,
  confirmed:   Colors.primary,
  in_progress: Colors.primary,
  completed:   Colors.success,
  cancelled:   Colors.danger,
  no_show:     Colors.textSecondary,
};

const PAYMENT_STYLE = {
  unpaid:   { color: '#92400E',           bg: '#FEF3C7' },
  paid:     { color: Colors.success,      bg: '#DCFCE7' },
  refunded: { color: Colors.textSecondary, bg: Colors.border },
};

export function OrderCard({ order, onPress }: Props) {
  const t = useT();
  const date = new Date(order.scheduledAt);
  const dateStr = date.toLocaleDateString(undefined, { day: '2-digit', month: '2-digit', year: 'numeric' });
  const timeStr = date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  const hasDiscount = order.discountAmount > 0;
  const paymentStyle = PAYMENT_STYLE[order.paymentStatus] ?? PAYMENT_STYLE.unpaid;
  const accentColor = STATUS_ACCENT[order.status] ?? Colors.primary;

  return (
    <PressableCard
      onPress={onPress}
      style={{
        backgroundColor: Colors.surface,
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.07,
        shadowRadius: 8,
        elevation: 3,
        flexDirection: 'row',
      }}
    >
      <View style={{ width: 4, backgroundColor: accentColor }} />

      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 14, paddingTop: 14, paddingBottom: 10 }}>
          <Text style={{ fontSize: 15, fontWeight: '700', color: Colors.textPrimary, flex: 1, marginRight: 10 }} numberOfLines={1}>
            {order.serviceName || t('common.noData')}
          </Text>
          <StatusBadge status={order.status} />
        </View>

        <View style={{ height: 1, backgroundColor: Colors.border, marginHorizontal: 14 }} />

        <View style={{ paddingHorizontal: 14, paddingVertical: 12, gap: 7 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Car size={13} color={Colors.textSecondary} strokeWidth={1.5} />
            <Text style={{ fontSize: 13, color: Colors.textSecondary }}>
              {order.licensePlate
                ? `${order.licensePlate}${order.vehicleTypeName ? ' · ' + order.vehicleTypeName : ''}`
                : '—'}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Calendar size={13} color={Colors.textSecondary} strokeWidth={1.5} />
            <Text style={{ fontSize: 13, color: Colors.textSecondary }}>{dateStr}</Text>
            <View style={{ width: 3, height: 3, borderRadius: 99, backgroundColor: Colors.textDisabled }} />
            <Clock size={13} color={Colors.textSecondary} strokeWidth={1.5} />
            <Text style={{ fontSize: 13, color: Colors.textSecondary }}>{timeStr}</Text>
          </View>
        </View>

        <View style={{
          flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
          backgroundColor: Colors.background,
          paddingHorizontal: 14, paddingVertical: 10,
          borderTopWidth: 1, borderTopColor: Colors.border,
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <View style={{ backgroundColor: paymentStyle.bg, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3 }}>
              <Text style={{ fontSize: 11, fontWeight: '600', color: paymentStyle.color }}>{t(`payment.${order.paymentStatus}` as any)}</Text>
            </View>
            {hasDiscount && (
              <View style={{ backgroundColor: '#DCFCE7', borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3 }}>
                <Text style={{ fontSize: 11, fontWeight: '600', color: Colors.success }}>-{formatPrice(order.discountAmount)}</Text>
              </View>
            )}
          </View>

          <View style={{ alignItems: 'flex-end' }}>
            {hasDiscount && (
              <Text style={{ fontSize: 12, color: Colors.textDisabled, textDecorationLine: 'line-through' }}>
                {formatPrice(order.originalAmount)}
              </Text>
            )}
            <Text style={{ fontSize: 16, fontWeight: '800', color: accentColor }}>
              {formatPrice(order.amount)}
            </Text>
          </View>
        </View>
      </View>
    </PressableCard>
  );
}
