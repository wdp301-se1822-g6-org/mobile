import { Colors } from '@/constants/Colors';
import { useT } from '@/i18n/useT';
import { Voucher } from '@/types/voucher';
import { formatPrice } from '@/utils/formatters';
import { Tag } from 'lucide-react-native';
import { Text, View } from 'react-native';

const STATUS_STYLE = {
  unused:  { color: Colors.success,        bg: '#DCFCE7' },
  used:    { color: Colors.textSecondary,  bg: Colors.border },
  expired: { color: Colors.danger,         bg: '#FEE2E2' },
  revoked: { color: Colors.textSecondary,  bg: Colors.border },
};

export function VoucherCard({ voucher }: { voucher: Voucher }) {
  const t = useT();
  const s = STATUS_STYLE[voucher.status];
  const expiry = new Date(voucher.expiresAt).toLocaleDateString();

  return (
    <View style={{
      backgroundColor: Colors.surface,
      borderRadius: 16,
      padding: 16,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
      elevation: 2,
    }}>
      <View style={{
        width: 44, height: 44, borderRadius: 12,
        backgroundColor: Colors.primaryLight,
        alignItems: 'center', justifyContent: 'center',
      }}>
        <Tag size={20} color={Colors.primary} strokeWidth={1.5} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 14, fontWeight: '700', color: Colors.textPrimary }}>
          {t('voucher.discountUpTo')} {formatPrice(voucher.discountCapVnd)}
        </Text>
        <Text style={{ fontSize: 12, color: Colors.textSecondary, marginTop: 2 }}>
          {t('voucher.code')}: {voucher.code} · {t('voucher.expires')}: {expiry}
        </Text>
      </View>
      <View style={{ backgroundColor: s.bg, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3 }}>
        <Text style={{ color: s.color, fontSize: 11, fontWeight: '600' }}>{t(`voucher.status${voucher.status.charAt(0).toUpperCase() + voucher.status.slice(1)}` as any)}</Text>
      </View>
    </View>
  );
}
