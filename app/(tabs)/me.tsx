import { TierBadge } from '@/components/loyalty/TierBadge';
import { Colors } from '@/constants/Colors';
import { LOCALES } from '@/i18n/translations';
import { useT } from '@/i18n/useT';
import { useLogout } from '@/hooks/auth/useAuth';
import { useLoyaltyAccount } from '@/hooks/loyalty/useLoyalty';
import { useAuthStore } from '@/stores/useAuthStore';
import { useLocaleStore } from '@/stores/useLocaleStore';
import { router } from 'expo-router';
import { Car, ChevronRight, Globe, LogOut, MessageCircle, Star, Tag, User } from 'lucide-react-native';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

type MenuItem = { icon: React.ReactNode; label: string; onPress: () => void };

export default function MeScreen() {
  const t = useT();
  const { authUser } = useAuthStore();
  const { locale, setLocale } = useLocaleStore();
  const { data: loyalty } = useLoyaltyAccount();
  const { mutate: logout } = useLogout();

  const initials = authUser?.name
    ? authUser.name.split(' ').map((w) => w[0]).slice(-2).join('').toUpperCase()
    : '?';

  const handleLogout = () => {
    Alert.alert(t('me.logoutConfirmTitle'), t('me.logoutConfirmBody'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.logout'),
        style: 'destructive',
        onPress: () =>
          logout(undefined, {
            onSettled: () => router.replace('/(auth)/welcome'),
          }),
      },
    ]);
  };

  const menuItems: MenuItem[] = [
    { icon: <Car size={20} color={Colors.primary} strokeWidth={1.5} />,           label: t('me.vehicles'),     onPress: () => router.push('/vehicles') },
    { icon: <Tag size={20} color={Colors.primary} strokeWidth={1.5} />,           label: t('me.vouchers'),     onPress: () => router.push('/vouchers') },
    { icon: <Star size={20} color={Colors.primary} strokeWidth={1.5} />,          label: t('me.pointHistory'), onPress: () => router.push('/loyalty/transactions') },
    { icon: <MessageCircle size={20} color={Colors.primary} strokeWidth={1.5} />, label: t('me.aiSupport'),    onPress: () => router.push('/chat') },
  ];

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: Colors.background }}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
        {/* Profile card */}
        <Animated.View
          entering={FadeInDown.springify()}
          style={{
            backgroundColor: Colors.surface, borderRadius: 20, padding: 20,
            flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 16,
            shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
          }}
        >
          <View style={{ width: 60, height: 60, borderRadius: 30, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: 22, fontWeight: '700', color: Colors.primary }}>{initials}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 17, fontWeight: '700', color: Colors.textPrimary }}>{authUser?.name}</Text>
            <Text style={{ fontSize: 13, color: Colors.textSecondary, marginTop: 2 }}>{authUser?.email}</Text>
            {loyalty && (
              <View style={{ marginTop: 6 }}>
                <TierBadge tier={loyalty.tierName} size="sm" />
              </View>
            )}
          </View>
          <Pressable onPress={() => router.push('/profile')} style={{ padding: 8 }}>
            <User size={20} color={Colors.textSecondary} strokeWidth={1.5} />
          </Pressable>
        </Animated.View>

        {/* Loyalty summary strip */}
        {loyalty && (
          <Animated.View
            entering={FadeInDown.delay(60).springify()}
            style={{
              backgroundColor: Colors.primaryLight, borderRadius: 16, padding: 16,
              flexDirection: 'row', justifyContent: 'space-around', marginBottom: 16,
            }}
          >
            {[
              { label: t('me.stripPoints'), value: (loyalty.pointsBalance ?? 0).toLocaleString() },
              { label: t('me.stripWashes'), value: loyalty.totalSuccessfulWashes.toString() },
            ].map((item) => (
              <View key={item.label} style={{ alignItems: 'center' }}>
                <Text style={{ fontSize: 20, fontWeight: '800', color: Colors.primary }}>{item.value}</Text>
                <Text style={{ fontSize: 12, color: Colors.textSecondary, marginTop: 2 }}>{item.label}</Text>
              </View>
            ))}
          </Animated.View>
        )}

        {/* Language switcher */}
        <Animated.View
          entering={FadeInDown.delay(90).springify()}
          style={{
            backgroundColor: Colors.surface, borderRadius: 16, padding: 16, marginBottom: 16,
            shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center' }}>
              <Globe size={20} color={Colors.primary} strokeWidth={1.5} />
            </View>
            <Text style={{ flex: 1, fontSize: 14, fontWeight: '700', color: Colors.textPrimary }}>{t('me.language')}</Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            {LOCALES.map((l) => {
              const active = locale === l.code;
              return (
                <Pressable
                  key={l.code}
                  onPress={() => setLocale(l.code)}
                  style={{
                    flex: 1,
                    backgroundColor: active ? Colors.primary : Colors.background,
                    borderRadius: 12, paddingVertical: 12,
                    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
                    borderWidth: 1.5, borderColor: active ? Colors.primary : Colors.border,
                  }}
                >
                  <Text style={{ fontSize: 18 }}>{l.flag}</Text>
                  <Text style={{ fontSize: 13, fontWeight: '700', color: active ? Colors.white : Colors.textPrimary }}>
                    {l.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </Animated.View>

        {/* Menu */}
        <Animated.View
          entering={FadeInDown.delay(120).springify()}
          style={{
            backgroundColor: Colors.surface, borderRadius: 16, overflow: 'hidden',
            shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05, shadowRadius: 6, elevation: 2, marginBottom: 16,
          }}
        >
          {menuItems.map((item, i) => (
            <Pressable
              key={item.label}
              onPress={item.onPress}
              style={{
                flexDirection: 'row', alignItems: 'center', padding: 16, gap: 14,
                borderBottomWidth: i < menuItems.length - 1 ? 1 : 0,
                borderBottomColor: Colors.border,
              }}
            >
              <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center' }}>
                {item.icon}
              </View>
              <Text style={{ flex: 1, fontSize: 14, fontWeight: '500', color: Colors.textPrimary }}>{item.label}</Text>
              <ChevronRight size={18} color={Colors.textDisabled} strokeWidth={1.5} />
            </Pressable>
          ))}
        </Animated.View>

        {/* Logout */}
        <Animated.View entering={FadeInDown.delay(160).springify()}>
          <Pressable
            onPress={handleLogout}
            style={{
              backgroundColor: '#FEF2F2', borderRadius: 16, padding: 16,
              flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}
          >
            <LogOut size={18} color={Colors.danger} strokeWidth={1.5} />
            <Text style={{ fontSize: 14, fontWeight: '600', color: Colors.danger }}>{t('common.logout')}</Text>
          </Pressable>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}
