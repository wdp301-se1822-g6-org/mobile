import { TierBadge } from '@/components/loyalty/TierBadge';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Colors } from '@/constants/Colors';
import { useLoyaltyAccount } from '@/hooks/loyalty/useLoyalty';
import { useServiceTypes } from '@/hooks/useServiceTypes';
import { useVehicles } from '@/hooks/vehicle/useVehicle';
import { useT } from '@/i18n/useT';
import { useAuthStore } from '@/stores/useAuthStore';
import { normalizeTier, TierName, WASHES_PER_VOUCHER } from '@/types/loyalty';
import { ServiceType } from '@/types/service';
import { Vehicle } from '@/types/vehicle';
import { formatPrice } from '@/utils/formatters';
import { resolveVehiclePricing } from '@/utils/servicePricing';
import { vehicleIcon } from '@/utils/vehicleIcon';
import { router } from 'expo-router';
import {
  Bot,
  Calendar,
  Car,
  ChevronRight,
  Clock,
  Droplets,
  Sparkles,
  Tag,
  Ticket,
  Zap,
} from 'lucide-react-native';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import Animated, {
  FadeInDown,
  FadeInRight,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

// The tier colour on the hero has to read against the blue card, so these are lighter
// than the on-white tints used by TierBadge.
const TIER_ACCENT: Record<TierName, string> = {
  basic: '#FFFFFF',
  bronze: '#F2B98A',
  silver: '#E2E8F0',
  gold: '#FCD34D',
};

const QUICK_ACTIONS = [
  {
    key: 'book',
    icon: Calendar,
    color: Colors.primary,
    bg: Colors.primaryLight,
    route: '/booking/new' as const,
    label: 'home.bookNow',
  },
  {
    key: 'vehicles',
    icon: Car,
    color: '#0EA5E9',
    bg: '#E0F2FE',
    route: '/vehicles' as const,
    label: 'home.myVehicles',
  },
  {
    key: 'vouchers',
    icon: Tag,
    color: '#EC4899',
    bg: '#FCE7F3',
    route: '/vouchers' as const,
    label: 'home.myVouchers',
  },
  {
    key: 'chat',
    icon: Bot,
    color: '#8B5CF6',
    bg: '#EDE9FE',
    route: '/chat' as const,
    label: 'home.aiAssistant',
  },
] as const;

// One vehicle type the customer owns, with the car we book against when they pick a
// package for it (their default car of that type, otherwise the first one).
type OwnedVehicleType = {
  id: string;
  name: string;
  vehicle: Vehicle;
};

// A service offered for the selected vehicle type, priced for that type.
type PricedService = {
  service: ServiceType;
  price: number;
  duration: number;
};

// How close the customer is to their next voucher, counted off their total washes: the bar
// fills over ten and starts a fresh cycle after that. Landing exactly on a multiple of ten
// is the wash that earns the voucher, so it reads as a full bar rather than an empty one.
function VoucherProgress({
  washes,
  accent,
}: {
  washes: number;
  accent: string;
}) {
  const t = useT();
  const total = Math.max(washes, 0);
  const cycle = total % WASHES_PER_VOUCHER;
  const done = total > 0 && cycle === 0 ? WASHES_PER_VOUCHER : cycle;
  const remaining = WASHES_PER_VOUCHER - done;
  const progress = done / WASHES_PER_VOUCHER;

  const width = useSharedValue(0);
  useEffect(() => {
    width.value = withTiming(progress, { duration: 800 });
  }, [progress]);
  const barStyle = useAnimatedStyle(() => ({
    width: `${width.value * 100}%` as `${number}%`,
  }));

  return (
    <View>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 8,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Ticket size={13} color="rgba(255,255,255,0.85)" strokeWidth={2} />
          <Text
            style={{
              color: 'rgba(255,255,255,0.85)',
              fontSize: 12,
              fontWeight: '600',
            }}
          >
            {t('home.voucherProgress')}
          </Text>
        </View>
        <Text style={{ color: Colors.white, fontSize: 12, fontWeight: '800' }}>
          {done}/{WASHES_PER_VOUCHER}
        </Text>
      </View>

      <View
        style={{
          height: 8,
          borderRadius: 999,
          backgroundColor: 'rgba(255,255,255,0.22)',
          overflow: 'hidden',
        }}
      >
        <Animated.View
          style={[
            barStyle,
            { height: '100%', borderRadius: 999, backgroundColor: accent },
          ]}
        />
      </View>

      <Text
        style={{
          color: 'rgba(255,255,255,0.75)',
          fontSize: 11,
          lineHeight: 16,
          marginTop: 8,
        }}
      >
        {remaining > 0
          ? t('home.voucherRemain', { n: remaining })
          : t('home.voucherReady')}
      </Text>
    </View>
  );
}

// Sits on the light background above the hero card, like the titles on the other tabs.
function GreetingBar({ name, tier }: { name: string; tier: TierName }) {
  const t = useT();
  const initial = name.trim().charAt(0).toUpperCase() || '?';

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
      <View
        style={{
          width: 46,
          height: 46,
          borderRadius: 100,
          backgroundColor: Colors.primaryLight,
          borderWidth: 1,
          borderColor: Colors.primaryMid,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text
          style={{ color: Colors.primary, fontSize: 19, fontWeight: '800' }}
        >
          {initial}
        </Text>
      </View>

      <View style={{ flex: 1 }}>
        <Text style={{ color: Colors.textSecondary, fontSize: 13 }}>
          {t('home.hello')},
        </Text>
        <Text
          style={{
            color: Colors.textPrimary,
            fontSize: 20,
            fontWeight: '800',
            marginTop: 1,
          }}
          numberOfLines={1}
        >
          {name}
        </Text>
      </View>

      <TierBadge tier={tier} size="sm" />
    </View>
  );
}

function HeroCard({
  points,
  washes,
  tier,
}: {
  points: number;
  washes: number;
  tier: TierName;
}) {
  const t = useT();
  const accent = TIER_ACCENT[tier];

  return (
    <View
      style={{
        backgroundColor: Colors.primary,
        borderRadius: 24,
        padding: 20,
        overflow: 'hidden',
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.28,
        shadowRadius: 18,
        elevation: 8,
      }}
    >
      {/* Soft light from the top-right and a deeper pool bottom-left, so the flat brand
          blue reads as a gradient without pulling in a gradient dependency. */}
      <View
        style={{
          position: 'absolute',
          top: -80,
          right: -60,
          width: 220,
          height: 220,
          borderRadius: 110,
          backgroundColor: 'rgba(255,255,255,0.12)',
        }}
      />
      <View
        style={{
          position: 'absolute',
          top: -20,
          right: 10,
          width: 110,
          height: 110,
          borderRadius: 55,
          backgroundColor: 'rgba(255,255,255,0.07)',
        }}
      />
      <View
        style={{
          position: 'absolute',
          bottom: -90,
          left: -50,
          width: 220,
          height: 220,
          borderRadius: 110,
          backgroundColor: 'rgba(30,58,138,0.30)',
        }}
      />

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
            <Sparkles size={13} color={accent} strokeWidth={2} />
            <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12 }}>
              {t('home.loyaltyPoints')}
            </Text>
          </View>
          <Text
            style={{
              color: Colors.white,
              fontSize: 34,
              fontWeight: '900',
              marginTop: 2,
              letterSpacing: -1,
            }}
            numberOfLines={1}
          >
            {points.toLocaleString()}
          </Text>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
              marginTop: 4,
            }}
          >
            <Droplets size={13} color="rgba(255,255,255,0.8)" strokeWidth={2} />
            <Text
              style={{
                color: 'rgba(255,255,255,0.8)',
                fontSize: 12,
                fontWeight: '600',
              }}
            >
              {t('home.washCount', { n: washes })}
            </Text>
          </View>
        </View>

        <Pressable
          onPress={() => router.push('/(tabs)/loyalty')}
          style={{
            backgroundColor: Colors.white,
            paddingLeft: 14,
            paddingRight: 10,
            paddingVertical: 10,
            borderRadius: 14,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <Text
            style={{ color: Colors.primary, fontSize: 12, fontWeight: '800' }}
          >
            {t('home.pointHistory')}
          </Text>
          <ChevronRight size={15} color={Colors.primary} strokeWidth={2.5} />
        </Pressable>
      </View>

      <View
        style={{
          height: 1,
          backgroundColor: 'rgba(255,255,255,0.18)',
          marginVertical: 16,
        }}
      />

      <VoucherProgress washes={washes} accent={accent} />
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
          <Animated.View
            key={a.key}
            entering={FadeInRight.delay(i * 60).springify()}
            style={{ flex: 1 }}
          >
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
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  backgroundColor: a.bg,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Icon size={20} color={a.color} strokeWidth={1.8} />
              </View>
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: '600',
                  color: Colors.textPrimary,
                  textAlign: 'center',
                }}
                numberOfLines={2}
              >
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
      <View
        style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          backgroundColor: Colors.warning,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Zap
          size={18}
          color={Colors.white}
          fill={Colors.white}
          strokeWidth={1.5}
        />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 13, fontWeight: '800', color: '#92400E' }}>
          {t('home.promoTitle')}
        </Text>
        <Text style={{ fontSize: 12, color: '#92400E', marginTop: 1 }}>
          {t('home.promoSub')}
        </Text>
      </View>
      <ChevronRight size={16} color="#92400E" strokeWidth={2} />
    </Pressable>
  );
}

// Lets the customer switch which of their vehicle types the packages are priced for.
function VehicleTypeTabs({
  types,
  activeId,
  onSelect,
}: {
  types: OwnedVehicleType[];
  activeId?: string;
  onSelect: (id: string) => void;
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={{ flexGrow: 0 }}
      contentContainerStyle={{ gap: 8 }}
    >
      {types.map((ty) => {
        const Icon = vehicleIcon(ty.name);
        const active = ty.id === activeId;
        return (
          <Pressable
            key={ty.id}
            onPress={() => onSelect(ty.id)}
            style={{
              backgroundColor: active ? Colors.primaryLight : Colors.surface,
              borderRadius: 999,
              paddingHorizontal: 14,
              paddingVertical: 9,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 7,
              borderWidth: 1.5,
              borderColor: active ? Colors.primary : Colors.border,
            }}
          >
            <Icon
              size={16}
              color={active ? Colors.primary : Colors.textSecondary}
              strokeWidth={1.8}
            />
            <Text
              style={{
                fontSize: 13,
                fontWeight: '700',
                color: active ? Colors.primary : Colors.textSecondary,
              }}
            >
              {ty.name}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

function ServiceCard({
  item,
  onPress,
}: {
  item: PricedService;
  onPress: () => void;
}) {
  const t = useT();
  const { service, price, duration } = item;
  return (
    <Pressable
      onPress={onPress}
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
      <View
        style={{
          width: 52,
          height: 52,
          borderRadius: 14,
          backgroundColor: Colors.primaryLight,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Droplets size={24} color={Colors.primary} strokeWidth={1.8} />
      </View>
      <View style={{ flex: 1 }}>
        <Text
          style={{ fontSize: 14, fontWeight: '700', color: Colors.textPrimary }}
          numberOfLines={1}
        >
          {service.name}
        </Text>
        {service.description ? (
          <Text
            style={{ fontSize: 12, color: Colors.textSecondary, marginTop: 2 }}
            numberOfLines={1}
          >
            {service.description}
          </Text>
        ) : null}
        <View
          style={{
            flexDirection: 'row',
            gap: 10,
            marginTop: 6,
            alignItems: 'center',
          }}
        >
          {duration ? (
            <View
              style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}
            >
              <Clock size={11} color={Colors.textSecondary} strokeWidth={1.5} />
              <Text style={{ fontSize: 11, color: Colors.textSecondary }}>
                {duration} {t('common.minutes')}
              </Text>
            </View>
          ) : null}
          <Text
            style={{ fontSize: 14, fontWeight: '800', color: Colors.primary }}
          >
            {formatPrice(price)}
          </Text>
        </View>
      </View>
      <ChevronRight size={16} color={Colors.textDisabled} strokeWidth={2} />
    </Pressable>
  );
}

export default function HomeScreen() {
  const t = useT();
  const user = useAuthStore((s) => s.authUser);
  const { data: services, isLoading: loadingServices } = useServiceTypes();
  const { data: vehicles, isLoading: loadingVehicles } = useVehicles();
  const { data: loyalty } = useLoyaltyAccount();

  const [pickedTypeId, setPickedTypeId] = useState<string | null>(null);

  // The vehicle types the customer actually owns — packages are only listed for these.
  // Their default car leads, and it is the car we book against for its type.
  const ownedTypes = useMemo<OwnedVehicleType[]>(() => {
    const byType = new Map<string, OwnedVehicleType>();
    for (const v of vehicles ?? []) {
      if (v.isActive === false) continue;
      const seen = byType.get(v.vehicleTypeId);
      if (!seen || (v.isDefault && !seen.vehicle.isDefault)) {
        byType.set(v.vehicleTypeId, {
          id: v.vehicleTypeId,
          name: v.vehicleTypeName,
          vehicle: v,
        });
      }
    }
    return [...byType.values()].sort(
      (a, b) => Number(b.vehicle.isDefault) - Number(a.vehicle.isDefault),
    );
  }, [vehicles]);

  const activeType =
    ownedTypes.find((ty) => ty.id === pickedTypeId) ?? ownedTypes[0] ?? null;

  // The packages offered for the active vehicle type, priced for that type. Until the
  // customer adds a vehicle there is no type to price against, so every package is
  // listed at its base price and the vehicle is picked during booking instead.
  const pricedServices = useMemo<PricedService[]>(() => {
    return (services ?? []).flatMap((service) => {
      if (!service.isActive) return [];
      if (!activeType) {
        return [
          {
            service,
            price: service.basePrice,
            duration: service.durationMinutes,
          },
        ];
      }
      const pricing = resolveVehiclePricing(service, activeType.id);
      return pricing ? [{ service, ...pricing }] : [];
    });
  }, [services, activeType?.id]);

  const isLoading = loadingServices || loadingVehicles;
  const tier = normalizeTier(loyalty?.tierName);

  // With a vehicle known, booking already has the car and the package and opens at the
  // time step; without one it starts at the vehicle step as usual.
  const bookService = (service: ServiceType) => {
    router.push({
      pathname: '/booking/new',
      params: activeType
        ? { serviceId: service.id, vehicleId: activeType.vehicle.id }
        : { serviceId: service.id },
    });
  };

  return (
    <SafeAreaView
      edges={['top']}
      style={{ flex: 1, backgroundColor: Colors.background }}
    >
      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Greeting + hero */}
        <Animated.View
          entering={FadeInDown.springify()}
          style={{ marginBottom: 16 }}
        >
          <GreetingBar name={user?.name ?? t('home.friend')} tier={tier} />
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(40).springify()}
          style={{ marginBottom: 18 }}
        >
          <HeroCard
            points={loyalty?.pointsBalance ?? 0}
            washes={loyalty?.totalSuccessfulWashes ?? 0}
            tier={tier}
          />
        </Animated.View>

        {/* Quick actions */}
        <Animated.View
          entering={FadeInDown.delay(60).springify()}
          style={{ marginBottom: 18 }}
        >
          <Text
            style={{
              fontSize: 14,
              fontWeight: '700',
              color: Colors.textPrimary,
              marginBottom: 10,
            }}
          >
            {t('home.quickActions')}
          </Text>
          <QuickActions />
        </Animated.View>

        {/* Promo banner */}
        <Animated.View
          entering={FadeInDown.delay(120).springify()}
          style={{ marginBottom: 18 }}
        >
          <PromoBanner />
        </Animated.View>

        {/* Vehicle type switcher — only when they own more than one type */}
        {ownedTypes.length > 1 && activeType && (
          <Animated.View
            entering={FadeInDown.delay(150).springify()}
            style={{ marginBottom: 18 }}
          >
            <Text
              style={{
                fontSize: 14,
                fontWeight: '700',
                color: Colors.textPrimary,
                marginBottom: 10,
              }}
            >
              {t('home.yourVehicles')}
            </Text>
            <VehicleTypeTabs
              types={ownedTypes}
              activeId={activeType.id}
              onSelect={setPickedTypeId}
            />
          </Animated.View>
        )}

        {/* All services, priced for the active vehicle type */}
        <Animated.View
          entering={FadeInDown.delay(180).springify()}
          style={{ marginBottom: 10 }}
        >
          <View style={{ marginBottom: 10 }}>
            <Text
              style={{
                fontSize: 16,
                fontWeight: '800',
                color: Colors.textPrimary,
              }}
            >
              {t('home.allServices')}
            </Text>
            <Text
              style={{
                fontSize: 12,
                color: Colors.textSecondary,
                marginTop: 2,
              }}
            >
              {activeType
                ? t('home.pricesFor', { type: activeType.name })
                : t('home.servicesSub')}
            </Text>
          </View>

          {isLoading ? (
            <LoadingSpinner />
          ) : !pricedServices.length ? (
            <EmptyState
              icon={Droplets}
              title={
                activeType
                  ? t('home.noServicesForVehicle', { type: activeType.name })
                  : t('home.noServices')
              }
              description={t('home.noServicesSub')}
            />
          ) : (
            <View style={{ gap: 10 }}>
              {pricedServices.map((item, i) => (
                <Animated.View
                  key={item.service.id}
                  entering={FadeInDown.delay(220 + i * 60).springify()}
                >
                  <ServiceCard
                    item={item}
                    onPress={() => bookService(item.service)}
                  />
                </Animated.View>
              ))}
            </View>
          )}
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}
