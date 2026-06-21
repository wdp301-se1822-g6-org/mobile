import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Colors } from '@/constants/Colors';
import { useT } from '@/i18n/useT';
import { useLoyaltyAccount } from '@/hooks/loyalty/useLoyalty';
import { useServiceTypes } from '@/hooks/useServiceTypes';
import { useAuthStore } from '@/stores/useAuthStore';
import { ServiceType } from '@/types/service';
import { formatPrice } from '@/utils/formatters';
import { router } from 'expo-router';
import {
  Bot, Calendar, Car, ChevronRight, Clock, Droplets,
  Gift, Sparkles, Star, Tag, Waves, Zap,
} from 'lucide-react-native';
import { Pressable, ScrollView, Text, View } from 'react-native';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

const TIER_LABELS: Record<string, string> = {
  none: 'NEW',
  bronze: 'BRONZE',
  silver: 'SILVER',
  gold: 'GOLD',
  platinum: 'PLATINUM',
};

const QUICK_ACTIONS = [
  { key: 'book',     icon: Calendar, color: Colors.primary,                 bg: Colors.primaryLight, route: '/booking/new' as const, label: 'home.bookNow' },
  { key: 'vehicles', icon: Car,      color: '#0EA5E9',                      bg: '#E0F2FE',           route: '/vehicles' as const,    label: 'home.myVehicles' },
  { key: 'vouchers', icon: Tag,      color: '#EC4899',                      bg: '#FCE7F3',           route: '/vouchers' as const,    label: 'home.myVouchers' },
  { key: 'chat',     icon: Bot,      color: '#8B5CF6',                      bg: '#EDE9FE',           route: '/chat' as const,        label: 'home.aiAssistant' },
] as const;

function HeroCard({ name, points, washes, tier }: {
  name: string; points: number; washes: number; tier: string;
}) {
  const t = useT();
  return (
    <View
      style={{
        backgroundColor: Colors.primary,
        borderRadius: 24,
        padding: 22,
        overflow: 'hidden',
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.25,
        shadowRadius: 12,
        elevation: 6,
      }}
    >
      {/* Decorative bubbles */}
      <View style={{ position: 'absolute', top: -30, right: -30, width: 130, height: 130, borderRadius: 65, backgroundColor: 'rgba(255,255,255,0.08)' }} />
      <View style={{ position: 'absolute', top: 30, right: 40, width: 60, height: 60, borderRadius: 30, backgroundColor: 'rgba(255,255,255,0.06)' }} />
      <View style={{ position: 'absolute', bottom: -40, left: -10, width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(255,255,255,0.05)' }} />

      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Waves size={14} color="rgba(255,255,255,0.85)" strokeWidth={2} />
          <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 12, fontWeight: '600', letterSpacing: 1 }}>WAVE</Text>
        </View>
        <View style={{
          backgroundColor: 'rgba(255,255,255,0.18)',
          borderRadius: 999,
          paddingHorizontal: 10, paddingVertical: 4,
          flexDirection: 'row', alignItems: 'center', gap: 4,
        }}>
          <Star size={12} color={Colors.white} fill={Colors.white} strokeWidth={2} />
          <Text style={{ color: Colors.white, fontSize: 11, fontWeight: '800', letterSpacing: 0.5 }}>
            {TIER_LABELS[tier] ?? tier.toUpperCase()}
          </Text>
        </View>
      </View>

      <Text style={{ color: 'rgba(255,255,255,0.75)', fontSize: 13 }}>
        {t('home.hello')},
      </Text>
      <Text style={{ color: Colors.white, fontSize: 22, fontWeight: '800', marginTop: 2, marginBottom: 18 }} numberOfLines={1}>
        {name} 👋
      </Text>

      <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <View>
          <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>{t('home.loyaltyPoints')}</Text>
          <Text style={{ color: Colors.white, fontSize: 32, fontWeight: '900', marginTop: 2, letterSpacing: -1 }}>
            {points.toLocaleString()}
          </Text>
          <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, marginTop: 2 }}>
            {t('home.washCount', { n: washes })}
          </Text>
        </View>

        <Pressable
          onPress={() => router.push('/(tabs)/loyalty')}
          style={{
            backgroundColor: 'rgba(255,255,255,0.18)',
            paddingHorizontal: 14, paddingVertical: 9,
            borderRadius: 12,
            flexDirection: 'row', alignItems: 'center', gap: 6,
          }}
        >
          <Gift size={14} color={Colors.white} strokeWidth={2} />
          <Text style={{ color: Colors.white, fontSize: 12, fontWeight: '700' }}>{t('home.pointHistory')}</Text>
        </Pressable>
      </View>
    </View>
  );
}

function QuickActions() {
  const t = useT();
  return (
    <View style={{ flexDirection: 'row', gap: 10 }}>
      {QUICK_ACTIONS.map((a, i) => {
        const Icon = a.icon;
        return (
          <Animated.View key={a.key} entering={FadeInRight.delay(i * 60).springify()} style={{ flex: 1 }}>
            <Pressable
              onPress={() => router.push(a.route as any)}
              style={{
                backgroundColor: Colors.surface,
                borderRadius: 16,
                paddingVertical: 14,
                alignItems: 'center',
                gap: 6,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 6,
                elevation: 2,
              }}
            >
              <View style={{
                width: 40, height: 40, borderRadius: 12,
                backgroundColor: a.bg,
                alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon size={20} color={a.color} strokeWidth={1.8} />
              </View>
              <Text style={{ fontSize: 11, fontWeight: '600', color: Colors.textPrimary, textAlign: 'center' }} numberOfLines={2}>
                {t(a.label as any)}
              </Text>
            </Pressable>
          </Animated.View>
        );
      })}
    </View>
  );
}

function PromoBanner() {
  const t = useT();
  return (
    <Pressable
      onPress={() => router.push('/booking/new')}
      style={{
        backgroundColor: '#FEF3C7',
        borderRadius: 16,
        padding: 14,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        borderLeftWidth: 4,
        borderLeftColor: Colors.warning,
      }}
    >
      <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: Colors.warning, alignItems: 'center', justifyContent: 'center' }}>
        <Zap size={18} color={Colors.white} fill={Colors.white} strokeWidth={1.5} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 13, fontWeight: '800', color: '#92400E' }}>{t('home.promoTitle')}</Text>
        <Text style={{ fontSize: 12, color: '#92400E', marginTop: 1 }}>{t('home.promoSub')}</Text>
      </View>
      <ChevronRight size={16} color="#92400E" strokeWidth={2} />
    </Pressable>
  );
}

function FeaturedServiceCard({ service }: { service: ServiceType }) {
  const t = useT();
  return (
    <Pressable
      onPress={() => router.push({ pathname: '/booking/new', params: { serviceId: service.id } })}
      style={{
        backgroundColor: Colors.textPrimary,
        borderRadius: 20,
        padding: 18,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
        elevation: 4,
      }}
    >
      {/* Decorative shapes */}
      <View style={{ position: 'absolute', top: -20, right: -20, width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(37,99,235,0.18)' }} />
      <View style={{ position: 'absolute', top: 20, right: 10, width: 60, height: 60, borderRadius: 30, backgroundColor: 'rgba(37,99,235,0.12)' }} />

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 }}>
        <View style={{ backgroundColor: Colors.primary, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <Sparkles size={11} color={Colors.white} strokeWidth={2} />
          <Text style={{ color: Colors.white, fontSize: 10, fontWeight: '800', letterSpacing: 0.5 }}>{t('home.featuredBadge')}</Text>
        </View>
      </View>

      <Text style={{ color: Colors.white, fontSize: 20, fontWeight: '800', letterSpacing: -0.3 }}>{service.name}</Text>
      {service.description ? (
        <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, marginTop: 4, lineHeight: 18 }} numberOfLines={2}>
          {service.description}
        </Text>
      ) : null}

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 14 }}>
        {service.durationMinutes ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Clock size={13} color="rgba(255,255,255,0.7)" strokeWidth={1.5} />
            <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>{service.durationMinutes} {t('common.minutes')}</Text>
          </View>
        ) : null}
      </View>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, paddingTop: 14, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.12)' }}>
        <View>
          <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11 }}>{t('home.perWash')}</Text>
          <Text style={{ color: Colors.white, fontSize: 22, fontWeight: '900', marginTop: 2 }}>{formatPrice(service.basePrice)}</Text>
        </View>
        <View style={{
          backgroundColor: Colors.primary,
          paddingHorizontal: 18, paddingVertical: 11,
          borderRadius: 12,
          flexDirection: 'row', alignItems: 'center', gap: 6,
        }}>
          <Text style={{ color: Colors.white, fontWeight: '700', fontSize: 13 }}>{t('home.bookNow')}</Text>
          <ChevronRight size={14} color={Colors.white} strokeWidth={2.5} />
        </View>
      </View>
    </Pressable>
  );
}

function ServiceCard({ service }: { service: ServiceType }) {
  const t = useT();
  return (
    <Pressable
      onPress={() => router.push({ pathname: '/booking/new', params: { serviceId: service.id } })}
      style={{
        backgroundColor: Colors.surface,
        borderRadius: 16,
        padding: 14,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
        elevation: 2,
      }}
    >
      <View style={{
        width: 52, height: 52, borderRadius: 14,
        backgroundColor: Colors.primaryLight,
        alignItems: 'center', justifyContent: 'center',
      }}>
        <Droplets size={24} color={Colors.primary} strokeWidth={1.8} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 14, fontWeight: '700', color: Colors.textPrimary }} numberOfLines={1}>
          {service.name}
        </Text>
        {service.description ? (
          <Text style={{ fontSize: 12, color: Colors.textSecondary, marginTop: 2 }} numberOfLines={1}>
            {service.description}
          </Text>
        ) : null}
        <View style={{ flexDirection: 'row', gap: 10, marginTop: 6, alignItems: 'center' }}>
          {service.durationMinutes ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
              <Clock size={11} color={Colors.textSecondary} strokeWidth={1.5} />
              <Text style={{ fontSize: 11, color: Colors.textSecondary }}>{service.durationMinutes} {t('common.minutes')}</Text>
            </View>
          ) : null}
          <Text style={{ fontSize: 14, fontWeight: '800', color: Colors.primary }}>{formatPrice(service.basePrice)}</Text>
        </View>
      </View>
      <ChevronRight size={16} color={Colors.textDisabled} strokeWidth={2} />
    </Pressable>
  );
}

export default function HomeScreen() {
  const t = useT();
  const user = useAuthStore((s) => s.authUser);
  const { data: services, isLoading } = useServiceTypes();
  const { data: loyalty } = useLoyaltyAccount();

  const [featured, ...others] = services ?? [];

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: Colors.background }}>
      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <Animated.View entering={FadeInDown.springify()} style={{ marginBottom: 18 }}>
          <HeroCard
            name={user?.name ?? t('home.friend')}
            points={loyalty?.pointsBalance ?? 0}
            washes={loyalty?.totalSuccessfulWashes ?? 0}
            tier={loyalty?.tierName ?? 'none'}
          />
        </Animated.View>

        {/* Quick actions */}
        <Animated.View entering={FadeInDown.delay(60).springify()} style={{ marginBottom: 18 }}>
          <Text style={{ fontSize: 14, fontWeight: '700', color: Colors.textPrimary, marginBottom: 10 }}>
            {t('home.quickActions')}
          </Text>
          <QuickActions />
        </Animated.View>

        {/* Promo banner */}
        <Animated.View entering={FadeInDown.delay(120).springify()} style={{ marginBottom: 18 }}>
          <PromoBanner />
        </Animated.View>

        {/* Featured service */}
        {featured && (
          <Animated.View entering={FadeInDown.delay(180).springify()} style={{ marginBottom: 18 }}>
            <Text style={{ fontSize: 14, fontWeight: '700', color: Colors.textPrimary, marginBottom: 10 }}>
              {t('home.featuredService')}
            </Text>
            <FeaturedServiceCard service={featured} />
          </Animated.View>
        )}

        {/* All services */}
        <Animated.View entering={FadeInDown.delay(240).springify()} style={{ marginBottom: 10 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <View>
              <Text style={{ fontSize: 16, fontWeight: '800', color: Colors.textPrimary }}>{t('home.allServices')}</Text>
              <Text style={{ fontSize: 12, color: Colors.textSecondary, marginTop: 2 }}>{t('home.servicesSub')}</Text>
            </View>
          </View>

          {isLoading ? (
            <LoadingSpinner />
          ) : !services?.length ? (
            <EmptyState icon={Droplets} title={t('home.noServices')} description={t('home.noServicesSub')} />
          ) : (
            <View style={{ gap: 10 }}>
              {others.map((s, i) => (
                <Animated.View key={s.id} entering={FadeInDown.delay(280 + i * 60).springify()}>
                  <ServiceCard service={s} />
                </Animated.View>
              ))}
            </View>
          )}
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}
