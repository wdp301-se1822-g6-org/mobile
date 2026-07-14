import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Colors } from '@/constants/Colors';
import { useLoyaltyAccount, useLoyaltyTransactions } from '@/hooks/loyalty/useLoyalty';
import { useT } from '@/i18n/useT';
import { LoyaltyTransaction } from '@/types/loyalty';
import { describeLoyaltyTransaction, LoyaltyTxnKind } from '@/utils/loyaltyReason';
import { router } from 'expo-router';
import {
  ArrowLeft,
  Award,
  ChevronRight,
  Clock,
  LucideIcon,
  RefreshCw,
  RotateCcw,
  Star,
  Ticket,
  TrendingDown,
  Wallet,
} from 'lucide-react-native';
import { useMemo } from 'react';
import { ActivityIndicator, Pressable, SectionList, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

type Translate = ReturnType<typeof useT>;
type Section = { title: string; data: LoyaltyTransaction[] };

const KIND_STYLE: Record<LoyaltyTxnKind, { icon: LucideIcon; color: string; background: string }> = {
  earn:    { icon: Star,         color: Colors.success,       background: '#DCFCE7' },
  redeem:  { icon: Ticket,       color: Colors.gold,          background: Colors.goldLight },
  tier:    { icon: Award,        color: Colors.primary,       background: Colors.primaryLight },
  expire:  { icon: Clock,        color: Colors.danger,        background: '#FEE2E2' },
  refund:  { icon: RotateCcw,    color: Colors.warning,       background: '#FEF3C7' },
  adjust:  { icon: RefreshCw,    color: Colors.textSecondary, background: '#F1F5F9' },
  deduct:  { icon: TrendingDown, color: Colors.danger,        background: '#FEE2E2' },
  neutral: { icon: RefreshCw,    color: Colors.textSecondary, background: '#F1F5F9' },
};

const pad = (n: number) => String(n).padStart(2, '0');
const dayKey = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const formatTime = (d: Date) => `${pad(d.getHours())}:${pad(d.getMinutes())}`;

function formatDayLabel(date: Date, t: Translate): string {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  if (dayKey(date) === dayKey(today)) return t('loyalty.historyToday');
  if (dayKey(date) === dayKey(yesterday)) return t('loyalty.historyYesterday');
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
}

/** The ledger only makes sense newest-first, and only if each day is labelled. */
function buildSections(items: LoyaltyTransaction[], t: Translate): Section[] {
  const sections: Section[] = [];
  const byDay = new Map<string, Section>();

  for (const item of [...items].sort((a, b) => b.createdAt.localeCompare(a.createdAt))) {
    const date = new Date(item.createdAt);
    const key = dayKey(date);
    let section = byDay.get(key);

    if (!section) {
      section = { title: formatDayLabel(date, t), data: [] };
      byDay.set(key, section);
      sections.push(section);
    }
    section.data.push(item);
  }

  return sections;
}

export default function LoyaltyTransactionsScreen() {
  const t = useT();
  const { data: loyalty } = useLoyaltyAccount();
  const { data: items, isLoading, hasNextPage, isFetchingNextPage, fetchNextPage } = useLoyaltyTransactions();

  const sections = useMemo(() => buildSections(items ?? [], t), [items, t]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 }}>
        <Pressable onPress={() => router.back()} style={{ padding: 4 }}>
          <ArrowLeft size={22} color={Colors.textPrimary} strokeWidth={1.5} />
        </Pressable>
        <Text style={{ fontSize: 17, fontWeight: '700', color: Colors.textPrimary }}>{t('loyalty.historyTitle')}</Text>
      </View>

      {loyalty && (
        <View
          style={{
            flexDirection: 'row', alignItems: 'center', gap: 12,
            backgroundColor: Colors.surface, borderRadius: 14,
            marginHorizontal: 16, marginBottom: 4, padding: 14,
            borderWidth: 1, borderColor: Colors.border,
          }}
        >
          <View style={{
            width: 38, height: 38, borderRadius: 12, backgroundColor: Colors.primaryLight,
            alignItems: 'center', justifyContent: 'center',
          }}>
            <Wallet size={18} color={Colors.primary} strokeWidth={1.5} />
          </View>
          <Text style={{ flex: 1, fontSize: 13, color: Colors.textSecondary }}>{t('loyalty.historyBalance')}</Text>
          <Text style={{ fontSize: 18, fontWeight: '800', color: Colors.textPrimary }}>
            {loyalty.pointsBalance.toLocaleString()} <Text style={{ fontSize: 13, fontWeight: '600', color: Colors.textSecondary }}>{t('loyalty.pointsUnit')}</Text>
          </Text>
        </View>
      )}

      {isLoading ? (
        <LoadingSpinner />
      ) : !sections.length ? (
        <EmptyState icon={Star} title={t('loyalty.historyEmpty')} description={t('loyalty.historyEmptyDesc')} />
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16, paddingTop: 8, paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
          onEndReachedThreshold={0.4}
          onEndReached={() => {
            if (hasNextPage && !isFetchingNextPage) void fetchNextPage();
          }}
          renderSectionHeader={({ section }) => (
            <View style={{ backgroundColor: Colors.background, paddingTop: 8, paddingBottom: 8 }}>
              <Text style={{ fontSize: 12, fontWeight: '700', color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.4 }}>
                {section.title}
              </Text>
            </View>
          )}
          renderItem={({ item, index }) => <TransactionRow item={item} index={index} t={t} />}
          ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
          ListFooterComponent={
            isFetchingNextPage ? (
              <ActivityIndicator color={Colors.primary} style={{ marginTop: 16 }} />
            ) : null
          }
        />
      )}
    </SafeAreaView>
  );
}

function TransactionRow({ item, index, t }: { item: LoyaltyTransaction; index: number; t: Translate }) {
  const { kind, title, note } = describeLoyaltyTransaction(item, t);
  const { icon: Icon, color, background } = KIND_STYLE[kind];

  const delta = item.pointsDelta;
  const sign = delta > 0 ? '+' : delta < 0 ? '-' : '';
  const amountColor = delta > 0 ? Colors.success : delta < 0 ? Colors.danger : Colors.textSecondary;

  const time = formatTime(new Date(item.createdAt));
  const subtitle = note ? `${time} · ${note}` : time;
  const openOrder = item.orderId
    ? () => router.push({ pathname: '/booking/[id]', params: { id: item.orderId as string } })
    : undefined;

  return (
    <Animated.View entering={FadeInDown.delay(Math.min(index, 8) * 40).springify()}>
      <Pressable
        onPress={openOrder}
        disabled={!openOrder}
        style={{
          backgroundColor: Colors.surface, borderRadius: 14, padding: 14,
          flexDirection: 'row', alignItems: 'center', gap: 12,
          borderWidth: 1, borderColor: Colors.border,
        }}
      >
        <View style={{
          width: 40, height: 40, borderRadius: 12, backgroundColor: background,
          alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon size={18} color={color} strokeWidth={1.5} />
        </View>

        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 13.5, fontWeight: '600', color: Colors.textPrimary }} numberOfLines={2}>
            {title}
          </Text>
          <Text style={{ fontSize: 12, color: Colors.textSecondary, marginTop: 3 }} numberOfLines={1}>
            {subtitle}
          </Text>
        </View>

        <View style={{ alignItems: 'flex-end' }}>
          <Text style={{ fontSize: 15, fontWeight: '700', color: amountColor }}>
            {sign}{Math.abs(delta).toLocaleString()} {t('loyalty.pointsUnit')}
          </Text>
          <Text style={{ fontSize: 11, color: Colors.textDisabled, marginTop: 2 }}>
            {t('loyalty.historyBalanceAfter', { n: item.balanceAfter.toLocaleString() })}
          </Text>
        </View>

        {openOrder && <ChevronRight size={16} color={Colors.textDisabled} strokeWidth={1.5} />}
      </Pressable>
    </Animated.View>
  );
}
