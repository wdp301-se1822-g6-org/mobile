import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Colors } from '@/constants/Colors';
import { useT } from '@/i18n/useT';
import { useLoyaltyTransactions } from '@/hooks/loyalty/useLoyalty';
import { formatTimeAgo } from '@/utils/formatters';
import { router } from 'expo-router';
import { ArrowLeft, Star, TrendingDown, TrendingUp } from 'lucide-react-native';
import { FlatList, Pressable, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LoyaltyTransactionsScreen() {
  const t = useT();
  const { data, isLoading } = useLoyaltyTransactions();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 }}>
        <Pressable onPress={() => router.back()} style={{ padding: 4 }}>
          <ArrowLeft size={22} color={Colors.textPrimary} strokeWidth={1.5} />
        </Pressable>
        <Text style={{ fontSize: 17, fontWeight: '700', color: Colors.textPrimary }}>{t('loyalty.historyTitle')}</Text>
      </View>

      {isLoading ? <LoadingSpinner /> : !data?.data.length ? (
        <EmptyState icon={Star} title={t('loyalty.historyEmpty')} />
      ) : (
        <FlatList
          data={data.data}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16, gap: 10 }}
          renderItem={({ item, index }) => {
            const isPositive = item.pointsDelta > 0;
            return (
              <Animated.View
                entering={FadeInDown.delay(index * 50).springify()}
                style={{
                  backgroundColor: Colors.surface, borderRadius: 14, padding: 14,
                  flexDirection: 'row', alignItems: 'center', gap: 12,
                  shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1,
                }}
              >
                <View style={{
                  width: 40, height: 40, borderRadius: 12,
                  backgroundColor: isPositive ? '#DCFCE7' : '#FEE2E2',
                  alignItems: 'center', justifyContent: 'center',
                }}>
                  {isPositive
                    ? <TrendingUp size={18} color={Colors.success} strokeWidth={1.5} />
                    : <TrendingDown size={18} color={Colors.danger} strokeWidth={1.5} />
                  }
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 13, fontWeight: '500', color: Colors.textPrimary }}>{item.reason}</Text>
                  <Text style={{ fontSize: 12, color: Colors.textSecondary, marginTop: 2 }}>{formatTimeAgo(item.createdAt)}</Text>
                </View>
                <Text style={{ fontSize: 15, fontWeight: '700', color: isPositive ? Colors.success : Colors.danger }}>
                  {isPositive ? '+' : ''}{item.pointsDelta}
                </Text>
              </Animated.View>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}
