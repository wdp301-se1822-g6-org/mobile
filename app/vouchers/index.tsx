import { VoucherCard } from '@/components/voucher/VoucherCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Colors } from '@/constants/Colors';
import { useVouchers } from '@/hooks/voucher/useVoucher';
import { VoucherStatus } from '@/types/voucher';
import { router } from 'expo-router';
import { ArrowLeft, Tag } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

const TABS: { label: string; value: VoucherStatus | undefined }[] = [
  { label: 'Tất cả', value: undefined },
  { label: 'Có thể dùng', value: 'unused' },
  { label: 'Đã dùng', value: 'used' },
  { label: 'Hết hạn', value: 'expired' },
];

export default function VouchersScreen() {
  const [status, setStatus] = useState<VoucherStatus | undefined>(undefined);
  const { data: vouchers, isLoading } = useVouchers(status);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 }}>
        <Pressable onPress={() => router.back()} style={{ padding: 4 }}>
          <ArrowLeft size={22} color={Colors.textPrimary} strokeWidth={1.5} />
        </Pressable>
        <Text style={{ fontSize: 17, fontWeight: '700', color: Colors.textPrimary }}>Voucher của tôi</Text>
      </View>

      {/* Filter tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 8, paddingBottom: 12 }}>
        {TABS.map((t) => (
          <Pressable
            key={t.label}
            onPress={() => setStatus(t.value)}
            style={{
              paddingHorizontal: 14, paddingVertical: 7, borderRadius: 999,
              backgroundColor: status === t.value ? Colors.primary : Colors.surface,
              borderWidth: 1, borderColor: status === t.value ? Colors.primary : Colors.border,
            }}
          >
            <Text style={{ fontSize: 13, fontWeight: '600', color: status === t.value ? Colors.white : Colors.textSecondary }}>
              {t.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {isLoading ? <LoadingSpinner /> : !vouchers?.length ? (
        <EmptyState icon={Tag} title="Không có voucher" description="Hoàn thành dịch vụ để nhận voucher ưu đãi" />
      ) : (
        <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }} showsVerticalScrollIndicator={false}>
          {vouchers.map((v, i) => (
            <Animated.View key={v.id} entering={FadeInDown.delay(i * 60).springify()}>
              <VoucherCard voucher={v} />
            </Animated.View>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
