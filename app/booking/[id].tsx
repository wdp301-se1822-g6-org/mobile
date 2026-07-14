import { StatusBadge } from '@/components/booking/StatusBadge';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Colors } from '@/constants/Colors';
import { useT } from '@/i18n/useT';
import { useCancelOrder, useOrder } from '@/hooks/booking/useBooking';
import { useOrderFeedback } from '@/hooks/feedback/useFeedback';
import { useVehicles } from '@/hooks/vehicle/useVehicle';
import { OrderStatus } from '@/types/booking';
import { formatPrice } from '@/utils/formatters';
import { router, useLocalSearchParams } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { ArrowLeft, Calendar, Car, CheckCircle, Clock, CreditCard, Droplets, Hourglass, Sparkles, Star } from 'lucide-react-native';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

function ProgressTracker({ status }: { status: OrderStatus }) {
  const t = useT();
  const TRACK_STEPS = [
    { key: 'confirmed' as const,   label: t('bookingDetail.stepConfirmed'), icon: CheckCircle },
    { key: 'in_progress' as const, label: t('bookingDetail.stepWashing'),   icon: Droplets },
    { key: 'completed' as const,   label: t('bookingDetail.stepDone'),      icon: Sparkles },
  ];
  const order: OrderStatus[] = ['pending', 'confirmed', 'in_progress', 'completed'];
  const currentIdx = order.indexOf(status);

  return (
    <View style={{
      backgroundColor: Colors.surface, borderRadius: 16, padding: 16,
      shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
    }}>
      <Text style={{ fontSize: 14, fontWeight: '700', color: Colors.textPrimary, marginBottom: 14 }}>
        {t('bookingDetail.progress')}
      </Text>

      <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
        {TRACK_STEPS.map((step, i) => {
          const stepIdx = order.indexOf(step.key);
          const reached = currentIdx >= stepIdx;
          const isCurrent = status === step.key;
          const Icon = step.icon;
          return (
            <View key={step.key} style={{ flex: 1, alignItems: 'center' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', width: '100%', height: 38 }}>
                {i > 0 && (
                  <View style={{
                    position: 'absolute', left: 0, right: '50%',
                    top: 18, height: 2,
                    backgroundColor: reached ? Colors.primary : Colors.border,
                  }} />
                )}
                {i < TRACK_STEPS.length - 1 && (
                  <View style={{
                    position: 'absolute', left: '50%', right: 0,
                    top: 18, height: 2,
                    backgroundColor: currentIdx > stepIdx ? Colors.primary : Colors.border,
                  }} />
                )}
                <View style={{
                  width: 38, height: 38, borderRadius: 19,
                  backgroundColor: reached ? Colors.primary : Colors.surface,
                  borderWidth: 2, borderColor: reached ? Colors.primary : Colors.border,
                  alignItems: 'center', justifyContent: 'center',
                  alignSelf: 'center',
                  zIndex: 1,
                  ...(isCurrent ? {
                    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 0 },
                    shadowOpacity: 0.5, shadowRadius: 8, elevation: 4,
                  } : {}),
                }}>
                  <Icon size={18} color={reached ? Colors.white : Colors.textDisabled} strokeWidth={2} />
                </View>
              </View>
              <Text style={{
                fontSize: 11, fontWeight: isCurrent ? '700' : '500',
                color: reached ? Colors.textPrimary : Colors.textSecondary,
                marginTop: 8, textAlign: 'center',
              }}>{step.label}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

function paymentLabel(t: ReturnType<typeof useT>, method: 'cash' | 'online', status: 'unpaid' | 'paid' | 'refunded') {
  const m = method === 'cash' ? t('payment.methodCash') : t('payment.methodOnline');
  const s = status === 'paid' ? t('payment.paid')
          : status === 'refunded' ? t('payment.refunded')
          : t('payment.unpaid');
  return `${m} · ${s}`;
}

export default function BookingDetailScreen() {
  const t = useT();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: order, isLoading, refetch } = useOrder(id);
  const { data: vehicles = [] } = useVehicles();
  const { mutateAsync: cancelOrder, isPending: cancelling } = useCancelOrder();
  const { data: feedbackData } = useOrderFeedback(id);
  const feedback = feedbackData?.feedback ?? null;

  const handleCancel = () => {
    Alert.alert(t('bookingDetail.cancelTitle'), t('bookingDetail.cancelBody'), [
      { text: t('common.no'), style: 'cancel' },
      {
        text: t('bookingDetail.cancelBtn'), style: 'destructive',
        onPress: async () => {
          try {
            await cancelOrder(id);
            Toast.show({ type: 'success', text1: t('bookingDetail.cancelOk') });
            router.back();
          } catch {
            Toast.show({ type: 'error', text1: t('bookingDetail.cancelErr') });
          }
        },
      },
    ]);
  };

  const handlePayNow = async () => {
    if (!order?.payosCheckoutUrl) return;
    try {
      await WebBrowser.openBrowserAsync(order.payosCheckoutUrl);
      refetch();
    } catch {
      Toast.show({ type: 'error', text1: t('bookingDetail.payNowErr') });
    }
  };

  if (isLoading) return <LoadingSpinner />;
  if (!order) return null;

  const canCancel = ['pending', 'confirmed'].includes(order.status);
  const isCompleted = order.status === 'completed';
  const showTracker = ['confirmed', 'in_progress', 'completed'].includes(order.status);
  const needsOnlinePayment =
    order.paymentMethod === 'online' &&
    order.paymentStatus === 'unpaid' &&
    !!order.payosCheckoutUrl &&
    order.status !== 'cancelled';

  const date = new Date(order.scheduledAt);
  const orderVehicle = vehicles.find((vehicle) => vehicle.id === order.vehicleId);
  const licensePlate = order.licensePlate?.trim() || orderVehicle?.licensePlate?.trim() || t('common.noData');
  const vehicleTypeName = order.vehicleTypeName?.trim() || orderVehicle?.vehicleTypeName?.trim();
  const vehicleLabel = vehicleTypeName ? `${licensePlate} · ${vehicleTypeName}` : licensePlate;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 }}>
        <Pressable onPress={() => router.back()} style={{ padding: 4 }}>
          <ArrowLeft size={22} color={Colors.textPrimary} strokeWidth={1.5} />
        </Pressable>
        <Text style={{ fontSize: 17, fontWeight: '700', color: Colors.textPrimary, flex: 1 }}>
          {t('bookingDetail.title')}
        </Text>
        <StatusBadge status={order.status} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32, gap: 16 }} showsVerticalScrollIndicator={false}>
        {showTracker && (
          <Animated.View entering={FadeInDown.springify()}>
            <ProgressTracker status={order.status} />
          </Animated.View>
        )}

        {needsOnlinePayment && (
          <Animated.View
            entering={FadeInDown.delay(40).springify()}
            style={{
              backgroundColor: '#FEF3C7',
              borderRadius: 16, padding: 16,
              flexDirection: 'row', alignItems: 'center', gap: 12,
              borderLeftWidth: 4, borderLeftColor: Colors.warning,
            }}
          >
            <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: Colors.warning, alignItems: 'center', justifyContent: 'center' }}>
              <Hourglass size={20} color={Colors.white} strokeWidth={1.5} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 14, fontWeight: '700', color: '#92400E' }}>{t('bookingDetail.waitingPayment')}</Text>
              <Text style={{ fontSize: 12, color: '#92400E', marginTop: 2 }}>{t('bookingDetail.waitingPaymentSub')}</Text>
            </View>
            <Pressable
              onPress={handlePayNow}
              style={{ backgroundColor: Colors.warning, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8 }}
            >
              <Text style={{ color: Colors.white, fontSize: 13, fontWeight: '700' }}>{t('bookingDetail.payNow')}</Text>
            </Pressable>
          </Animated.View>
        )}

        {/* Service info */}
        <Animated.View
          entering={FadeInDown.delay(60).springify()}
          style={{ backgroundColor: Colors.surface, borderRadius: 16, padding: 16, gap: 14,
            shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 }}
        >
          <Text style={{ fontSize: 16, fontWeight: '700', color: Colors.textPrimary }}>{order.serviceName}</Text>

          {[
            { icon: <Car size={16} color={Colors.textSecondary} strokeWidth={1.5} />,        label: t('bookingDetail.vehicle'), value: vehicleLabel },
            { icon: <Calendar size={16} color={Colors.textSecondary} strokeWidth={1.5} />,   label: t('bookingDetail.date'),    value: date.toLocaleDateString(undefined, { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' }) },
            { icon: <Clock size={16} color={Colors.textSecondary} strokeWidth={1.5} />,      label: t('bookingDetail.time'),    value: `${date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}${order.estimatedMinutes ? ` (~${order.estimatedMinutes} ${t('common.minutes')})` : ''}` },
            { icon: <CreditCard size={16} color={Colors.textSecondary} strokeWidth={1.5} />, label: t('bookingDetail.payment'), value: paymentLabel(t, order.paymentMethod, order.paymentStatus) },
          ].map((row) => (
            <View key={row.label} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              {row.icon}
              <Text style={{ color: Colors.textSecondary, fontSize: 13, width: 90 }}>{row.label}</Text>
              <Text style={{ flex: 1, fontSize: 13, fontWeight: '500', color: Colors.textPrimary }}>{row.value}</Text>
            </View>
          ))}
        </Animated.View>

        {/* Pricing */}
        <Animated.View
          entering={FadeInDown.delay(100).springify()}
          style={{ backgroundColor: Colors.surface, borderRadius: 16, padding: 16, gap: 10,
            shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 }}
        >
          <Text style={{ fontSize: 14, fontWeight: '600', color: Colors.textPrimary }}>{t('bookingDetail.payment')}</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ color: Colors.textSecondary, fontSize: 13 }}>{t('bookingDetail.basePrice')}</Text>
            <Text style={{ color: Colors.textPrimary, fontSize: 13 }}>{formatPrice(order.originalAmount)}</Text>
          </View>
          {order.discountAmount > 0 && (
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ color: Colors.textSecondary, fontSize: 13 }}>
                {t('bookingDetail.discount')}{order.discountReason ? ` (${order.discountReason})` : ''}
              </Text>
              <Text style={{ color: Colors.success, fontSize: 13, fontWeight: '600' }}>-{formatPrice(order.discountAmount)}</Text>
            </View>
          )}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingTop: 8, borderTopWidth: 1, borderTopColor: Colors.border }}>
            <Text style={{ fontSize: 15, fontWeight: '600', color: Colors.textPrimary }}>{t('bookingDetail.total')}</Text>
            <Text style={{ fontSize: 17, fontWeight: '800', color: Colors.primary }}>{formatPrice(order.amount)}</Text>
          </View>
        </Animated.View>

        {order.cancelReason && (
          <Animated.View
            entering={FadeInDown.delay(160).springify()}
            style={{ backgroundColor: '#FEE2E2', borderRadius: 12, padding: 14 }}
          >
            <Text style={{ fontSize: 13, fontWeight: '600', color: Colors.danger, marginBottom: 4 }}>{t('bookingDetail.cancelReason')}</Text>
            <Text style={{ fontSize: 13, color: Colors.danger }}>{order.cancelReason}</Text>
          </Animated.View>
        )}

        {canCancel && (
          <Animated.View entering={FadeInDown.delay(120).springify()} style={{ gap: 10 }}>
            <Button
              title={t('bookingDetail.reschedule')}
              variant="secondary"
              onPress={() => router.push({ pathname: '/booking/reschedule', params: { id: order.id } })}
            />
            <Button
              title={t('bookingDetail.cancelBtn')}
              variant="danger"
              onPress={handleCancel}
              loading={cancelling}
            />
          </Animated.View>
        )}

        {isCompleted && (
          <Animated.View entering={FadeInDown.delay(140).springify()}>
            {feedback ? (
              <View style={{
                backgroundColor: Colors.surface, borderRadius: 16, padding: 16,
                shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
              }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <Star size={16} color={Colors.gold} fill={Colors.gold} strokeWidth={1.5} />
                  <Text style={{ fontSize: 14, fontWeight: '700', color: Colors.textPrimary }}>{t('bookingDetail.myRating')}</Text>
                </View>
                <View style={{ flexDirection: 'row', gap: 2, marginBottom: 6 }}>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Star key={n} size={18} color={n <= feedback.rating ? Colors.gold : Colors.border} fill={n <= feedback.rating ? Colors.gold : 'transparent'} strokeWidth={1.5} />
                  ))}
                </View>
                {feedback.comment ? (
                  <Text style={{ fontSize: 13, color: Colors.textSecondary, lineHeight: 18 }}>{feedback.comment}</Text>
                ) : null}
              </View>
            ) : (
              <Button
                title={t('bookingDetail.rateService')}
                onPress={() => router.push({ pathname: '/feedback/[orderId]', params: { orderId: order.id } })}
              />
            )}
          </Animated.View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
