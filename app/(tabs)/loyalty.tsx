import { TierBadge } from '@/components/loyalty/TierBadge';
import { TierProgressBar } from '@/components/loyalty/TierProgressBar';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Colors } from '@/constants/Colors';
import { useLoyaltyAccount, useTierConfigs } from '@/hooks/loyalty/useLoyalty';
import { TierName } from '@/types/loyalty';
import { router } from 'expo-router';
import { ChevronRight, Gift, Star } from 'lucide-react-native';
import { Pressable, ScrollView, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

const TIER_ORDER: TierName[] = ['bronze', 'silver', 'gold', 'platinum'];

export default function LoyaltyScreen() {
  const { data: loyalty, isLoading: loadingLoyalty } = useLoyaltyAccount();
  const { data: tierConfigs } = useTierConfigs();

  if (loadingLoyalty) return <LoadingSpinner />;

  const currentTierIdx = loyalty ? TIER_ORDER.indexOf(loyalty.tierName) : 0;
  const nextTier = currentTierIdx < TIER_ORDER.length - 1 ? TIER_ORDER[currentTierIdx + 1] : undefined;
  const currentConfig = tierConfigs?.find((t) => t.tierName === loyalty?.tierName);
  const nextConfig = tierConfigs?.find((t) => t.tierName === nextTier);

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: Colors.background }}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.springify()} style={{ marginBottom: 20 }}>
          <Text style={{ fontSize: 22, fontWeight: '700', color: Colors.textPrimary }}>Điểm thưởng</Text>
        </Animated.View>

        {loyalty && (
          <>
            {/* Points card */}
            <Animated.View
              entering={FadeInDown.delay(60).springify()}
              style={{
                backgroundColor: Colors.primary,
                borderRadius: 24,
                padding: 24,
                marginBottom: 16,
              }}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <View>
                  <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>Điểm hiện tại</Text>
                  <Text style={{ color: Colors.white, fontSize: 40, fontWeight: '900', marginTop: 4 }}>
                    {loyalty.pointsBalance.toLocaleString()}
                  </Text>
                  <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, marginTop: 2 }}>
                    {loyalty.totalSuccessfulWashes} lần rửa xe
                  </Text>
                </View>
                <View style={{ alignItems: 'flex-end', gap: 8 }}>
                  <Star size={40} color="rgba(255,255,255,0.2)" strokeWidth={1.5} />
                  <TierBadge tier={loyalty.tierName} />
                </View>
              </View>

              {/* Progress */}
              {currentConfig && nextConfig && (
                <View style={{ marginTop: 20 }}>
                  <TierProgressBar
                    currentPoints={loyalty.pointsBalance}
                    minPoints={currentConfig.minLoyaltyPoints}
                    maxPoints={nextConfig.minLoyaltyPoints}
                    currentTier={loyalty.tierName}
                    nextTier={nextTier}
                  />
                </View>
              )}
              {!nextTier && (
                <View style={{ marginTop: 16 }}>
                  <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13, textAlign: 'center' }}>
                    🎉 Bạn đang ở hạng cao nhất — Bạch Kim!
                  </Text>
                </View>
              )}
            </Animated.View>

            {/* Current tier benefits */}
            {currentConfig && (
              <Animated.View
                entering={FadeInDown.delay(100).springify()}
                style={{
                  backgroundColor: Colors.surface,
                  borderRadius: 16,
                  padding: 16,
                  marginBottom: 16,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.05,
                  shadowRadius: 6,
                  elevation: 2,
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                  <Gift size={18} color={Colors.primary} strokeWidth={1.5} />
                  <Text style={{ fontSize: 15, fontWeight: '700', color: Colors.textPrimary }}>Quyền lợi hiện tại</Text>
                  <TierBadge tier={loyalty.tierName} size="sm" />
                </View>
                {[
                  { label: 'Giảm giá', value: `${currentConfig.discountPercent}%` },
                  { label: 'Điểm / 1.000đ', value: `${currentConfig.pointsPer1000Vnd} điểm` },
                  { label: 'Đặt lịch trước', value: `${currentConfig.bookingWindowDays} ngày` },
                ].map((item) => (
                  <View key={item.label} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: Colors.border }}>
                    <Text style={{ fontSize: 13, color: Colors.textSecondary }}>{item.label}</Text>
                    <Text style={{ fontSize: 13, fontWeight: '700', color: Colors.textPrimary }}>{item.value}</Text>
                  </View>
                ))}
              </Animated.View>
            )}

            {/* All tiers */}
            <Animated.View entering={FadeInDown.delay(140).springify()} style={{ marginBottom: 16 }}>
              <Text style={{ fontSize: 15, fontWeight: '700', color: Colors.textPrimary, marginBottom: 12 }}>Các hạng thành viên</Text>
              <View style={{ gap: 8 }}>
                {TIER_ORDER.map((tier, i) => {
                  const config = tierConfigs?.find((t) => t.tierName === tier);
                  const isActive = tier === loyalty.tierName;
                  return (
                    <View
                      key={tier}
                      style={{
                        backgroundColor: isActive ? Colors.primaryLight : Colors.surface,
                        borderRadius: 14,
                        padding: 14,
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 12,
                        borderWidth: isActive ? 1.5 : 1,
                        borderColor: isActive ? Colors.primary : Colors.border,
                      }}
                    >
                      <TierBadge tier={tier} size="sm" />
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 13, color: Colors.textSecondary }}>
                          {config ? `Từ ${(config.minLoyaltyPoints ?? 0).toLocaleString()} điểm` : '—'}
                        </Text>
                        {config && (
                          <Text style={{ fontSize: 12, color: Colors.textSecondary, marginTop: 2 }}>
                            Giảm {config.discountPercent}% · {config.pointsPer1000Vnd}đ/1k
                          </Text>
                        )}
                      </View>
                      {isActive && <Star size={14} color={Colors.primary} fill={Colors.primary} />}
                    </View>
                  );
                })}
              </View>
            </Animated.View>

            {/* View history */}
            <Animated.View entering={FadeInDown.delay(160).springify()}>
              <Pressable
                onPress={() => router.push('/loyalty/transactions')}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: Colors.surface,
                  borderRadius: 14,
                  padding: 16,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.04,
                  shadowRadius: 4,
                  elevation: 1,
                }}
              >
                <Text style={{ flex: 1, fontSize: 14, fontWeight: '500', color: Colors.textPrimary }}>Lịch sử điểm</Text>
                <ChevronRight size={18} color={Colors.textDisabled} strokeWidth={1.5} />
              </Pressable>
            </Animated.View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
