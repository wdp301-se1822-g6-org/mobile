import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Colors } from '@/constants/Colors';
import { useT } from '@/i18n/useT';
import { useFinishWorkOrder, useMyWorkOrder, useStartWorkOrder } from '@/hooks/work-order/useWorkOrder';
import { router, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { ArrowLeft, Camera, Car, CheckCircle } from 'lucide-react-native';
import { useState } from 'react';
import { Alert, Image, Pressable, ScrollView, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { axiosInstance } from '@/services/api';
import { API } from '@/constants/endpoints';

export default function WorkOrderDetailScreen() {
  const t = useT();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: workOrder, isLoading } = useMyWorkOrder(id);
  const { mutateAsync: startOrder, isPending: starting } = useStartWorkOrder();
  const { mutateAsync: finishOrder, isPending: finishing } = useFinishWorkOrder();
  const [photos, setPhotos] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  const STATUS_KEY: Record<string, string> = {
    waiting:     t('workOrder.statusWaiting'),
    in_progress: t('workOrder.statusInProgress'),
    done:        t('workOrder.statusDone'),
    qc_passed:   t('workOrder.statusQcPassed'),
    qc_failed:   t('workOrder.statusQcFailed'),
  };

  const pickPhotos = async () => {
    const result = await ImagePicker.launchCameraAsync({ quality: 0.7, allowsEditing: false });
    if (!result.canceled && result.assets[0]) {
      const uri = result.assets[0].uri;
      setUploading(true);
      try {
        const form = new FormData();
        form.append('file', { uri, name: 'photo.jpg', type: 'image/jpeg' } as any);
        const res = await axiosInstance.post<{ url: string }>(API.upload.image, form, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setPhotos((prev) => [...prev, res.data.url]);
      } catch {
        Toast.show({ type: 'error', text1: t('workOrder.photoUploadErr') });
      } finally {
        setUploading(false);
      }
    }
  };

  const handleStart = async () => {
    try {
      await startOrder(id);
      Toast.show({ type: 'success', text1: t('workOrder.startOk') });
    } catch {
      Toast.show({ type: 'error', text1: t('workOrder.startErr') });
    }
  };

  const handleFinish = () => {
    if (photos.length === 0) {
      Toast.show({ type: 'error', text1: t('workOrder.needPhotos') });
      return;
    }
    Alert.alert(t('workOrder.finishConfirmTitle'), t('workOrder.finishConfirmBody'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.confirm'),
        onPress: async () => {
          try {
            await finishOrder({ id, dto: { checkoutPhotos: photos } });
            Toast.show({ type: 'success', text1: t('workOrder.finishOk') });
            router.back();
          } catch {
            Toast.show({ type: 'error', text1: t('workOrder.finishErr') });
          }
        },
      },
    ]);
  };

  if (isLoading) return <LoadingSpinner />;
  if (!workOrder) return null;

  const { order } = workOrder;
  const isWaiting = workOrder.status === 'waiting';
  const isInProgress = workOrder.status === 'in_progress';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 }}>
        <Pressable onPress={() => router.back()} style={{ padding: 4 }}>
          <ArrowLeft size={22} color={Colors.textPrimary} strokeWidth={1.5} />
        </Pressable>
        <Text style={{ fontSize: 17, fontWeight: '700', color: Colors.textPrimary, flex: 1 }}>{t('workOrder.title')}</Text>
        <View style={{ backgroundColor: Colors.primaryLight, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 }}>
          <Text style={{ color: Colors.primary, fontSize: 12, fontWeight: '600' }}>{STATUS_KEY[workOrder.status]}</Text>
        </View>
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
            <View>
              <Text style={{ fontSize: 18, fontWeight: '800', color: Colors.textPrimary }}>{order.licensePlate}</Text>
              <Text style={{ fontSize: 13, color: Colors.textSecondary }}>{order.vehicleTypeName}</Text>
            </View>
          </View>

          {[
            { label: t('workOrder.service'),  value: order.serviceTypeName },
            { label: t('workOrder.customer'), value: order.customerName },
            { label: t('workOrder.phone'),    value: order.customerPhone },
          ].map((row) => (
            <View key={row.label} style={{ flexDirection: 'row', paddingVertical: 6, borderTopWidth: 1, borderTopColor: Colors.border }}>
              <Text style={{ width: 100, fontSize: 13, color: Colors.textSecondary }}>{row.label}</Text>
              <Text style={{ flex: 1, fontSize: 13, fontWeight: '600', color: Colors.textPrimary }}>{row.value}</Text>
            </View>
          ))}
        </Animated.View>

        {isInProgress && (
          <Animated.View entering={FadeInDown.delay(80).springify()}>
            <Text style={{ fontSize: 14, fontWeight: '700', color: Colors.textPrimary, marginBottom: 10 }}>{t('workOrder.checkoutPhotos')}</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {photos.map((uri, i) => (
                <Image key={i} source={{ uri }} style={{ width: 80, height: 80, borderRadius: 10 }} />
              ))}
              <Pressable
                onPress={pickPhotos}
                disabled={uploading || photos.length >= 5}
                style={{
                  width: 80, height: 80, borderRadius: 10,
                  backgroundColor: Colors.primaryLight,
                  alignItems: 'center', justifyContent: 'center',
                  borderWidth: 1.5, borderColor: Colors.primary, borderStyle: 'dashed',
                }}
              >
                <Camera size={24} color={Colors.primary} strokeWidth={1.5} />
                <Text style={{ fontSize: 10, color: Colors.primary, marginTop: 4 }}>
                  {uploading ? '...' : `${photos.length}/5`}
                </Text>
              </Pressable>
            </View>
          </Animated.View>
        )}

        <Animated.View entering={FadeInDown.delay(120).springify()} style={{ gap: 10 }}>
          {isWaiting && (
            <Button title={t('workOrder.startBtn')} onPress={handleStart} loading={starting} />
          )}
          {isInProgress && (
            <Button
              title={t('workOrder.finishBtn')}
              onPress={handleFinish}
              loading={finishing || uploading}
            />
          )}
          {(workOrder.status === 'done' || workOrder.status === 'qc_passed') && (
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 16, backgroundColor: '#DCFCE7', borderRadius: 16 }}>
              <CheckCircle size={20} color={Colors.success} strokeWidth={1.5} />
              <Text style={{ color: Colors.success, fontWeight: '700', fontSize: 15 }}>{t('workOrder.finishedBadge')}</Text>
            </View>
          )}
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}
