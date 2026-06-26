import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Colors } from '@/constants/Colors';
import { API } from '@/constants/endpoints';
import { CASHIER_ORDERS_KEY, useCashierOrder, useCheckIn, useWorkOrderByOrder } from '@/hooks/cashier/useCheckIn';
import { useT } from '@/i18n/useT';
import { axiosInstance } from '@/services/api';
import { AdminOrder, Paginated } from '@/services/cashier.service';
import { useQueryClient } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { ArrowLeft, Camera, Car, CheckCircle, X } from 'lucide-react-native';
import { useState } from 'react';
import { Alert, Dimensions, Image, Modal, Pressable, ScrollView, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

function formatTime(iso?: string): string {
  if (!iso) return '-';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' });
}

function formatVnd(n?: number): string {
  if (n == null) return '-';
  return n.toLocaleString('vi-VN') + 'đ';
}

export default function CheckInDetailScreen() {
  const t = useT();
  const { id } = useLocalSearchParams<{ id: string }>();
  const qc = useQueryClient();
  const { data: order, isLoading } = useCashierOrder(id);

  // Endpoint chi tiết đôi khi không trả về tên khách / email — lấy bù từ cache danh sách.
  const cachedOrder = qc
    .getQueriesData<Paginated<AdminOrder>>({ queryKey: CASHIER_ORDERS_KEY })
    .flatMap(([, page]) => page?.data ?? [])
    .find((o) => o.id === id);
  const customerName = order?.customerName || cachedOrder?.customerName || '-';
  const { mutateAsync: checkIn, isPending } = useCheckIn();
  const [photos, setPhotos] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [viewer, setViewer] = useState<{ photos: string[]; index: number } | null>(null);
  const screen = Dimensions.get('window');

  const takePhoto = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      Toast.show({ type: 'error', text1: t('cashier.cameraDenied') });
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ quality: 0.7, allowsEditing: false });
    if (!result.canceled && result.assets[0]) {
      const uri = result.assets[0].uri;
      setUploading(true);
      try {
        const form = new FormData();
        form.append('file', { uri, name: 'checkin.jpg', type: 'image/jpeg' } as any);
        const res = await axiosInstance.post<{ url: string }>(API.upload.image, form, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setPhotos((prev) => [...prev, res.data.url]);
      } catch {
        Toast.show({ type: 'error', text1: t('cashier.photoUploadErr') });
      } finally {
        setUploading(false);
      }
    }
  };

  const removePhoto = (uri: string) => {
    setPhotos((prev) => prev.filter((p) => p !== uri));
  };

  const handleCheckIn = () => {
    if (photos.length === 0) {
      Toast.show({ type: 'error', text1: t('cashier.needPhotos') });
      return;
    }
    Alert.alert(t('cashier.confirmTitle'), t('cashier.confirmBody'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.confirm'),
        onPress: async () => {
          try {
            await checkIn({ orderId: id, checkinPhotos: photos });
            Toast.show({ type: 'success', text1: t('cashier.checkInOk') });
            router.back();
          } catch {
            Toast.show({ type: 'error', text1: t('cashier.checkInErr') });
          }
        },
      },
    ]);
  };

  const canCheckIn = order?.status === 'confirmed';
  const alreadyCheckedIn = order?.status === 'checked_in' || order?.status === 'in_progress' || order?.status === 'completed';
  const { data: workOrder, isLoading: woLoading } = useWorkOrderByOrder(id, alreadyCheckedIn);
  const checkinPhotos = workOrder?.checkinPhotos ?? [];

  if (isLoading) return <LoadingSpinner />;
  if (!order) return null;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 }}>
        <Pressable onPress={() => router.back()} style={{ padding: 4 }}>
          <ArrowLeft size={22} color={Colors.textPrimary} strokeWidth={1.5} />
        </Pressable>
        <Text style={{ fontSize: 17, fontWeight: '700', color: Colors.textPrimary, flex: 1 }}>{t('cashier.title')}</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
        <Animated.View
          entering={FadeInDown.springify()}
          style={{ backgroundColor: Colors.surface, borderRadius: 16, padding: 16, gap: 12,
            shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={{ width: 48, height: 48, borderRadius: 14, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center' }}>
              <Car size={24} color={Colors.primary} strokeWidth={1.5} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 18, fontWeight: '800', color: Colors.textPrimary }}>{order.licensePlate}</Text>
              <Text style={{ fontSize: 13, color: Colors.textSecondary }}>{order.serviceName}</Text>
            </View>
          </View>

          {[
            { label: t('cashier.customer'), value: customerName },
            { label: t('cashier.schedule'), value: formatTime(order.scheduledAt) },
            { label: t('cashier.washer'),   value: order.assignedWasherName || '-' },
            { label: t('cashier.amount'),   value: formatVnd(order.amount) },
          ].map((row) => (
            <View key={row.label} style={{ flexDirection: 'row', paddingVertical: 6, borderTopWidth: 1, borderTopColor: Colors.border }}>
              <Text style={{ width: 100, fontSize: 13, color: Colors.textSecondary }}>{row.label}</Text>
              <Text style={{ flex: 1, fontSize: 13, fontWeight: '600', color: Colors.textPrimary }}>{row.value}</Text>
            </View>
          ))}
        </Animated.View>

        {alreadyCheckedIn ? (
          <Animated.View entering={FadeInDown.delay(80).springify()} style={{ gap: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 16, backgroundColor: '#DCFCE7', borderRadius: 16 }}>
              <CheckCircle size={20} color={Colors.success} strokeWidth={1.5} />
              <Text style={{ color: Colors.success, fontWeight: '700', fontSize: 15 }}>{t('cashier.checkedInBadge')}</Text>
            </View>
            <Text style={{ fontSize: 14, fontWeight: '700', color: Colors.textPrimary }}>{t('cashier.checkInPhotos')}</Text>
            {woLoading ? (
              <Text style={{ fontSize: 13, color: Colors.textSecondary }}>{t('common.loading')}</Text>
            ) : checkinPhotos.length ? (
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {checkinPhotos.map((uri, i) => (
                  <Pressable key={uri} onPress={() => setViewer({ photos: checkinPhotos, index: i })}>
                    <Image source={{ uri }} style={{ width: 80, height: 80, borderRadius: 10 }} />
                  </Pressable>
                ))}
              </View>
            ) : (
              <Text style={{ fontSize: 13, color: Colors.textSecondary }}>{t('cashier.noPhotos')}</Text>
            )}
          </Animated.View>
        ) : !canCheckIn ? (
          <Animated.View entering={FadeInDown.delay(80).springify()} style={{ padding: 16, backgroundColor: Colors.primaryLight, borderRadius: 16 }}>
            <Text style={{ color: Colors.textSecondary, fontWeight: '600', fontSize: 14, textAlign: 'center' }}>
              {t('cashier.notConfirmed')}
            </Text>
          </Animated.View>
        ) : (
          <>
            <Animated.View entering={FadeInDown.delay(80).springify()}>
              <Text style={{ fontSize: 14, fontWeight: '700', color: Colors.textPrimary, marginBottom: 4 }}>{t('cashier.checkInPhotos')}</Text>
              <Text style={{ fontSize: 12, color: Colors.textSecondary, marginBottom: 10 }}>{t('cashier.checkInPhotosHint')}</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {photos.map((uri, i) => (
                  <View key={uri}>
                    <Pressable onPress={() => setViewer({ photos, index: i })}>
                      <Image source={{ uri }} style={{ width: 80, height: 80, borderRadius: 10 }} />
                    </Pressable>
                    <Pressable
                      onPress={() => removePhoto(uri)}
                      style={{ position: 'absolute', top: -6, right: -6, backgroundColor: Colors.danger, borderRadius: 999, padding: 2 }}
                    >
                      <X size={14} color={Colors.white} strokeWidth={2} />
                    </Pressable>
                  </View>
                ))}
                {photos.length < 10 && (
                  <Pressable
                    onPress={takePhoto}
                    disabled={uploading}
                    style={{
                      width: 80, height: 80, borderRadius: 10,
                      backgroundColor: Colors.primaryLight,
                      alignItems: 'center', justifyContent: 'center',
                      borderWidth: 1.5, borderColor: Colors.primary, borderStyle: 'dashed',
                    }}
                  >
                    <Camera size={24} color={Colors.primary} strokeWidth={1.5} />
                    <Text style={{ fontSize: 10, color: Colors.primary, marginTop: 4 }}>
                      {uploading ? '...' : `${photos.length}/10`}
                    </Text>
                  </Pressable>
                )}
              </View>
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(120).springify()}>
              <Button
                title={t('cashier.checkInBtn')}
                onPress={handleCheckIn}
                loading={isPending || uploading}
              />
            </Animated.View>
          </>
        )}
      </ScrollView>

      {/* Xem ảnh check-in toàn màn hình, vuốt ngang để xem ảnh kế tiếp */}
      <Modal visible={!!viewer} transparent animationType="fade" onRequestClose={() => setViewer(null)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.92)' }}>
          {viewer && (
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              contentOffset={{ x: viewer.index * screen.width, y: 0 }}
              onMomentumScrollEnd={(e) => {
                const x = e.nativeEvent?.contentOffset?.x ?? 0;
                const idx = Math.round(x / screen.width);
                setViewer((v) => (v ? { ...v, index: idx } : v));
              }}
            >
              {viewer.photos.map((uri, i) => (
                <Pressable
                  key={`${uri}-${i}`}
                  onPress={() => setViewer(null)}
                  style={{ width: screen.width, height: screen.height, alignItems: 'center', justifyContent: 'center' }}
                >
                  <Image source={{ uri }} style={{ width: screen.width, height: screen.height * 0.8 }} resizeMode="contain" />
                </Pressable>
              ))}
            </ScrollView>
          )}

          {/* Chỉ số ảnh hiện tại */}
          {viewer && viewer.photos.length > 1 && (
            <View style={{ position: 'absolute', bottom: 48, alignSelf: 'center', backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 999, paddingHorizontal: 14, paddingVertical: 6 }}>
              <Text style={{ color: Colors.white, fontSize: 14, fontWeight: '600' }}>
                {viewer.index + 1} / {viewer.photos.length}
              </Text>
            </View>
          )}

          <SafeAreaView edges={['top']} style={{ position: 'absolute', top: 0, right: 0 }}>
            <Pressable onPress={() => setViewer(null)} hitSlop={12} style={{ padding: 16 }}>
              <X size={28} color={Colors.white} strokeWidth={2} />
            </Pressable>
          </SafeAreaView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
