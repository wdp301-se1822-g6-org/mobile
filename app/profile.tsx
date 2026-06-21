import { Colors } from '@/constants/Colors';
import { useT } from '@/i18n/useT';
import { useAuthStore } from '@/stores/useAuthStore';
import { router } from 'expo-router';
import { ArrowLeft, Calendar, Mail, Phone, Shield, User } from 'lucide-react-native';
import { Pressable, ScrollView, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProfileScreen() {
  const t = useT();
  const { authUser } = useAuthStore();

  const ROLE_KEY: Record<string, string> = {
    customer: t('profile.roleCustomer'),
    washer:   t('profile.roleWasher'),
    cashier:  t('profile.roleCashier'),
    manager:  t('profile.roleManager'),
    admin:    t('profile.roleAdmin'),
  };

  const initials = authUser?.name
    ? authUser.name.split(' ').map((w) => w[0]).slice(-2).join('').toUpperCase()
    : '?';

  const rows = [
    { icon: <User size={18} color={Colors.primary} strokeWidth={1.5} />,     label: t('profile.name'),  value: authUser?.name },
    { icon: <Mail size={18} color={Colors.primary} strokeWidth={1.5} />,     label: t('profile.email'), value: authUser?.email },
    { icon: <Phone size={18} color={Colors.primary} strokeWidth={1.5} />,    label: t('profile.phone'), value: authUser?.phone },
    { icon: <Shield size={18} color={Colors.primary} strokeWidth={1.5} />,   label: t('profile.role'),  value: authUser?.role ? ROLE_KEY[authUser.role] ?? authUser.role : '—' },
    { icon: <Calendar size={18} color={Colors.primary} strokeWidth={1.5} />, label: t('profile.dob'),   value: authUser?.dateOfBirth ? new Date(authUser.dateOfBirth).toLocaleDateString() : '—' },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 }}>
        <Pressable onPress={() => router.back()} style={{ padding: 4 }}>
          <ArrowLeft size={22} color={Colors.textPrimary} strokeWidth={1.5} />
        </Pressable>
        <Text style={{ fontSize: 17, fontWeight: '700', color: Colors.textPrimary }}>{t('profile.title')}</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.springify()} style={{ alignItems: 'center', marginBottom: 28 }}>
          <View style={{
            width: 88, height: 88, borderRadius: 44,
            backgroundColor: Colors.primary,
            alignItems: 'center', justifyContent: 'center',
            shadowColor: Colors.primary, shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.3, shadowRadius: 12, elevation: 6,
          }}>
            <Text style={{ fontSize: 32, fontWeight: '800', color: Colors.white }}>{initials}</Text>
          </View>
          <Text style={{ fontSize: 18, fontWeight: '700', color: Colors.textPrimary, marginTop: 12 }}>{authUser?.name}</Text>
          <View style={{ backgroundColor: Colors.primaryLight, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 4, marginTop: 6 }}>
            <Text style={{ fontSize: 13, color: Colors.primary, fontWeight: '600' }}>
              {authUser?.role ? ROLE_KEY[authUser.role] ?? authUser.role : ''}
            </Text>
          </View>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(80).springify()}
          style={{
            backgroundColor: Colors.surface, borderRadius: 16, overflow: 'hidden',
            shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
          }}
        >
          {rows.map((row, i) => (
            <View
              key={row.label}
              style={{
                flexDirection: 'row', alignItems: 'center', padding: 16, gap: 14,
                borderBottomWidth: i < rows.length - 1 ? 1 : 0,
                borderBottomColor: Colors.border,
              }}
            >
              <View style={{ width: 38, height: 38, borderRadius: 10, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center' }}>
                {row.icon}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 11, color: Colors.textSecondary, marginBottom: 3 }}>{row.label}</Text>
                <Text style={{ fontSize: 14, fontWeight: '600', color: Colors.textPrimary }}>{row.value || '—'}</Text>
              </View>
            </View>
          ))}
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}
