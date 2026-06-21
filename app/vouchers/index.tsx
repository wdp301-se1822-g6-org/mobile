import { VoucherCard } from '@/components/voucher/VoucherCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Colors } from '@/constants/Colors';
import { useT } from '@/i18n/useT';
import { useVouchers } from '@/hooks/voucher/useVoucher';
import { VoucherStatus } from '@/types/voucher';
import { router } from 'expo-router';
import { ArrowLeft, Tag } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function VouchersScreen() {
  const t = useT();
  const [status, setStatus] = useState<VoucherStatus | undefined>(undefined);
  const { data: vouchers, isLoading } = useVouchers(status);

  const TABS: { labelKey: string; value: VoucherStatus | undefined }[] = [
    { labelKey: 'voucher.filterAll',     value: undefined },
    { labelKey: 'voucher.filterUnused',  value: 'unused' },
    { labelKey: 'voucher.filterUsed',    value: 'used' },
    { labelKey: 'voucher.filterExpired', value: 'expired' },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 }}>
        <Pressable onPress={() => router.back()} style={{ padding: 4 }}>
          <ArrowLeft size={22} color={Colors.textPrimary} strokeWidth={1.5} />
        </Pressable>
        <Text style={{ fontSize: 17, fontWeight: '700', color: Colors.textPrimary }}>{t('voucher.title')}</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ flexGrow: 0, flexShrink: 0 }}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 8, paddingBottom: 12, alignItems: 'center' }}
      >
        {TABS.map((tab) => {
          const active = status === tab.value;
          return (
            <Pressable
              key={tab.labelKey}
              onPress={() => setStatus(tab.value)}
              style={{
                paddingHorizontal: 14, paddingVertical: 7, borderRadius: 999,
                backgroundColor: active ? Colors.primary : Colors.surface,
                borderWidth: 1, borderColor: active ? Colors.primary : Colors.border,
              }}
            >
              <Text style={{ fontSize: 13, fontWeight: '600', color: active ? Colors.white : Colors.textSecondary }}>
                {t(tab.labelKey as any)}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {isLoading ? <LoadingSpinner /> : !vouchers?.length ? (
        <EmptyState icon={Tag} title={t('voucher.empty')} description={t('voucher.emptySub')} />
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
