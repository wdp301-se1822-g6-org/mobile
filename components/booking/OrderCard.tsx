import { Colors } from '@/constants/Colors';
import { useLocale, useT } from '@/i18n/useT';
import { Order, OrderStatus } from '@/types/booking';
import { formatPrice } from '@/utils/formatters';
import { vehicleIcon } from '@/utils/vehicleIcon';
import { localizedVehicleTypeName } from '@/utils/vehicleTypeLabel';
import { Text, View } from 'react-native';
import { PressableCard } from '../ui/PressableCard';
import { StatusBadge } from './StatusBadge';

type Props = {
  order: Order;
  onPress?: () => void;
  /** Resolved from the customer's vehicle list when OrderResponse omits it. */
  vehicleTypeName?: string;
  /** Hide the date under the time when the list already groups by day. */
  showDate?: boolean;
};

const STATUS_ACCENT: Record<OrderStatus, string> = {
  pending:         Colors.warning,
  pending_payment: Colors.warning,
  confirmed:       Colors.primary,
  checked_in:      '#7C3AED',
  in_progress:     Colors.primary,
  completed:       Colors.success,
  cancelled:       Colors.danger,
  no_show:         Colors.textSecondary,
};

const PAYMENT_STYLE = {
  unpaid:             { color: '#92400E',            bg: '#FEF3C7' },
  paid:               { color: Colors.success,       bg: '#DCFCE7' },
  refunded:           { color: Colors.textSecondary, bg: Colors.border },
  no_payment_required: { color: Colors.textSecondary, bg: Colors.border },
};

export function OrderCard({
  order,
  onPress,
  vehicleTypeName,
  showDate = true,
}: Props) {
  const t = useT();
  const locale = useLocale();
  const tag = locale === 'vi' ? 'vi-VN' : 'en-US';
  const resolvedVehicleTypeName =
    vehicleTypeName?.trim() || order.vehicleTypeName?.trim() || '';
  const VehicleIcon = vehicleIcon(resolvedVehicleTypeName);

  const date = new Date(order.scheduledAt);
  const dateStr = date.toLocaleDateString(tag, { day: '2-digit', month: '2-digit' });
  const timeStr = date.toLocaleTimeString(tag, { hour: '2-digit', minute: '2-digit', hour12: false });
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
        <View style={{ flexDirection: 'row', paddingHorizontal: 12, paddingTop: 12, paddingBottom: 12, gap: 12 }}>
          {/* Time column */}
          <View style={{
            minWidth: 52, alignItems: 'center', justifyContent: 'center',
            paddingRight: 12, borderRightWidth: 1, borderRightColor: Colors.border,
          }}>
            <Text style={{ fontSize: 17, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.3 }}>
              {timeStr}
            </Text>
            {showDate && (
              <Text style={{ fontSize: 11, color: Colors.textSecondary, marginTop: 2 }}>{dateStr}</Text>
            )}
          </View>

          {/* Service + vehicle */}
          <View style={{ flex: 1, gap: 5 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Text style={{ flex: 1, fontSize: 15, fontWeight: '700', color: Colors.textPrimary }} numberOfLines={1}>
                {order.serviceName || t('common.noData')}
              </Text>
              <StatusBadge status={order.status} />
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <VehicleIcon
                size={13}
                color={Colors.textSecondary}
                strokeWidth={1.5}
              />
              <Text style={{ flex: 1, fontSize: 13, color: Colors.textSecondary }} numberOfLines={1}>
                {order.licensePlate
                  ? `${order.licensePlate}${
                      resolvedVehicleTypeName
                        ? ` · ${localizedVehicleTypeName(resolvedVehicleTypeName, t)}`
                        : ''
                    }`
                  : '—'}
              </Text>
            </View>
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
