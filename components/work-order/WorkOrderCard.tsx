import { Colors } from '@/constants/Colors';
import { WorkOrder, WorkOrderStatus } from '@/types/work-order';
import { Car, MapPin, Ticket, User, UserCog } from 'lucide-react-native';
import { Text, View } from 'react-native';
import { PressableCard } from '../ui/PressableCard';

const STATUS_MAP: Record<WorkOrderStatus, { label: string; color: string; bg: string }> = {
  waiting:    { label: 'Đang chờ',    color: Colors.warning,       bg: '#FEF9C3' },
  in_progress:{ label: 'Đang rửa',    color: Colors.primary,       bg: Colors.primaryLight },
  done:       { label: 'Xong',        color: Colors.success,       bg: '#DCFCE7' },
  qc_passed:  { label: 'QC đạt',      color: Colors.success,       bg: '#DCFCE7' },
  qc_failed:  { label: 'QC không đạt',color: Colors.danger,        bg: '#FEE2E2' },
};

export function WorkOrderCard({
  workOrder,
  washerName,
  onPress,
}: {
  workOrder: WorkOrder;
  washerName?: string;
  onPress?: () => void;
}) {
  const s = STATUS_MAP[workOrder.status];
  const { vehicleSnapshot: vehicle } = workOrder;
  const washer = washerName ?? workOrder.assignedWasherName;

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
        <Text style={{ fontSize: 15, fontWeight: '600', color: Colors.textPrimary }}>
          {workOrder.serviceName}
        </Text>
        <View style={{ backgroundColor: s.bg, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 3 }}>
          <Text style={{ color: s.color, fontSize: 12, fontWeight: '600' }}>{s.label}</Text>
        </View>
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10, gap: 6 }}>
        <Car size={14} color={Colors.textSecondary} strokeWidth={1.5} />
        <Text style={{ fontSize: 13, fontWeight: '700', color: Colors.textPrimary, letterSpacing: 0.5 }}>
          {vehicle.plate}
        </Text>
        <Text style={{ fontSize: 13, color: Colors.textSecondary }}>· {vehicle.vehicleTypeName}</Text>
      </View>

      {workOrder.customerName ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 6 }}>
          <User size={14} color={Colors.textSecondary} strokeWidth={1.5} />
          <Text style={{ fontSize: 13, color: Colors.textSecondary }}>
            KH: {workOrder.customerName}{workOrder.customerPhone ? ` · ${workOrder.customerPhone}` : ''}
          </Text>
        </View>
      ) : null}

      {washer ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 6 }}>
          <UserCog size={14} color={Colors.textSecondary} strokeWidth={1.5} />
          <Text style={{ fontSize: 13, color: Colors.textSecondary }}>NV rửa: {washer}</Text>
        </View>
      ) : null}

      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 6 }}>
        <Ticket size={14} color={Colors.textSecondary} strokeWidth={1.5} />
        <Text style={{ fontSize: 13, color: Colors.textSecondary }}>{workOrder.code}</Text>
        {workOrder.stationName ? (
          <>
            <MapPin size={14} color={Colors.textSecondary} strokeWidth={1.5} style={{ marginLeft: 6 }} />
            <Text style={{ fontSize: 13, color: Colors.textSecondary }}>{workOrder.stationName}</Text>
          </>
        ) : null}
      </View>
    </PressableCard>
  );
}
