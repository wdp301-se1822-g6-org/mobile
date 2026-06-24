import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Colors } from '@/constants/Colors';
import { useT } from '@/i18n/useT';
import { useOrder } from '@/hooks/booking/useBooking';
import { useOrderFeedback, useSubmitFeedback } from '@/hooks/feedback/useFeedback';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, CheckCircle, Sparkles, Star } from 'lucide-react-native';
import { useEffect, useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

function StarRow({ value, onChange, size = 36 }: { value: number; onChange: (v: number) => void; size?: number }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 6 }}>
      {[1, 2, 3, 4, 5].map((n) => {
        const active = n <= value;
        return (
          <Pressable key={n} onPress={() => onChange(n)} hitSlop={6}>
            <Star
              size={size}
              color={active ? Colors.gold : Colors.border}
              fill={active ? Colors.gold : 'transparent'}
              strokeWidth={1.5}
            />
          </Pressable>
        );
      })}
    </View>
  );
}

export default function FeedbackScreen() {
  const t = useT();
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const { data: order, isLoading: loadingOrder } = useOrder(orderId);
  const { data: existing, isLoading: loadingFeedback } = useOrderFeedback(orderId);
  const { mutateAsync: submit, isPending } = useSubmitFeedback();

  const QUICK_TAGS = useMemo(() => [
    t('feedback.tagClean'),
    t('feedback.tagFriendly'),
    t('feedback.tagOnTime'),
    t('feedback.tagProfessional'),
    t('feedback.tagFairPrice'),
    t('feedback.tagNeedsImprovement'),
  ], [t]);

  const RATING_LABELS: Record<number, string> = {
    1: t('feedback.rating1'),
    2: t('feedback.rating2'),
    3: t('feedback.rating3'),
    4: t('feedback.rating4'),
    5: t('feedback.rating5'),
  };

  const [rating, setRating] = useState(5);
  const [washerRating, setWasherRating] = useState(5);
  const [comment, setComment] = useState('');
  const [tags, setTags] = useState<string[]>([]);

  const existingFeedback = existing?.feedback ?? null;
  const canRate = existing?.canRate ?? true;

  useEffect(() => {
    if (existingFeedback) {
      setRating(existingFeedback.rating);
      setWasherRating(existingFeedback.washerRating ?? existingFeedback.rating);
      setComment(existingFeedback.comment ?? '');
    }
  }, [existingFeedback]);

  const toggleTag = (tag: string) => {
    setTags((prev) => (prev.includes(tag) ? prev.filter((x) => x !== tag) : [...prev, tag]));
  };

  const handleSubmit = async () => {
    const fullComment = [tags.join(', '), comment.trim()].filter(Boolean).join(' · ');
    try {
      await submit({
        orderId,
        rating,
        washerRating,
        comment: fullComment || undefined,
      });
      Toast.show({ type: 'success', text1: t('feedback.submitOk') });
      router.back();
    } catch {
      Toast.show({ type: 'error', text1: t('feedback.submitErr'), text2: existing?.reason ?? t('feedback.submitErrSub') });
    }
  };

  if (loadingOrder || loadingFeedback) return <LoadingSpinner />;

  const alreadySubmitted = !!existingFeedback;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 }}>
        <Pressable onPress={() => router.back()} style={{ padding: 4 }}>
          <ArrowLeft size={22} color={Colors.textPrimary} strokeWidth={1.5} />
        </Pressable>
        <Text style={{ fontSize: 17, fontWeight: '700', color: Colors.textPrimary }}>
          {alreadySubmitted ? t('feedback.alreadyTitle') : t('feedback.title')}
        </Text>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32, gap: 16 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          {order && (
            <Animated.View
              entering={FadeInDown.springify()}
              style={{
                backgroundColor: Colors.surface, borderRadius: 16, padding: 16,
                flexDirection: 'row', alignItems: 'center', gap: 12,
                shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
              }}
            >
              <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: '#DCFCE7', alignItems: 'center', justifyContent: 'center' }}>
                <CheckCircle size={22} color={Colors.success} strokeWidth={1.5} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, fontWeight: '700', color: Colors.textPrimary }}>{order.serviceName}</Text>
                <Text style={{ fontSize: 12, color: Colors.textSecondary, marginTop: 2 }}>
                  {order.licensePlate} · {new Date(order.scheduledAt).toLocaleDateString()}
                </Text>
              </View>
            </Animated.View>
          )}

          <Animated.View
            entering={FadeInDown.delay(80).springify()}
            style={{
              backgroundColor: Colors.surface, borderRadius: 20, padding: 24,
              alignItems: 'center',
              shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
            }}
          >
            <Text style={{ fontSize: 15, fontWeight: '600', color: Colors.textPrimary }}>{t('feedback.overall')}</Text>
            <Text style={{ fontSize: 13, color: Colors.textSecondary, marginTop: 4 }}>{t('feedback.overallSub')}</Text>

            <View style={{ marginTop: 20 }}>
              <StarRow value={rating} onChange={setRating} size={40} />
            </View>

            <Animated.View key={rating} entering={ZoomIn.springify()} style={{ marginTop: 14 }}>
              <Text style={{ fontSize: 15, fontWeight: '700', color: Colors.primary }}>{RATING_LABELS[rating]}</Text>
            </Animated.View>
          </Animated.View>

          <Animated.View
            entering={FadeInDown.delay(140).springify()}
            style={{
              backgroundColor: Colors.surface, borderRadius: 16, padding: 18,
              shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <Sparkles size={16} color={Colors.primary} strokeWidth={1.5} />
              <Text style={{ fontSize: 14, fontWeight: '700', color: Colors.textPrimary }}>{t('feedback.washerSection')}</Text>
            </View>
            <StarRow value={washerRating} onChange={setWasherRating} size={28} />
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(200).springify()}>
            <Text style={{ fontSize: 13, fontWeight: '600', color: Colors.textSecondary, marginBottom: 10 }}>
              {t('feedback.quickTags')}
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {QUICK_TAGS.map((tag) => {
                const active = tags.includes(tag);
                return (
                  <Pressable
                    key={tag}
                    onPress={() => toggleTag(tag)}
                    style={{
                      paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999,
                      backgroundColor: active ? Colors.primary : Colors.surface,
                      borderWidth: 1.5, borderColor: active ? Colors.primary : Colors.border,
                    }}
                  >
                    <Text style={{ fontSize: 13, fontWeight: '600', color: active ? Colors.white : Colors.textSecondary }}>
                      {tag}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(260).springify()}>
            <Text style={{ fontSize: 13, fontWeight: '600', color: Colors.textSecondary, marginBottom: 8 }}>
              {t('feedback.comment')}
            </Text>
            <TextInput
              value={comment}
              onChangeText={setComment}
              placeholder={t('feedback.commentPh')}
              placeholderTextColor={Colors.textDisabled}
              multiline
              numberOfLines={4}
              style={{
                backgroundColor: Colors.surface, borderRadius: 12, padding: 14,
                fontSize: 14, color: Colors.textPrimary,
                borderWidth: 1.5, borderColor: Colors.border,
                minHeight: 100, textAlignVertical: 'top',
              }}
            />
          </Animated.View>

          {!canRate && !alreadySubmitted && existing?.reason ? (
            <View style={{ backgroundColor: '#FEF3C7', borderRadius: 12, padding: 14 }}>
              <Text style={{ fontSize: 13, color: '#92400E', textAlign: 'center' }}>{existing.reason}</Text>
            </View>
          ) : null}

          <Animated.View entering={FadeInDown.delay(320).springify()} style={{ marginTop: 8 }}>
            <Button
              title={alreadySubmitted ? t('feedback.update') : t('feedback.submit')}
              onPress={handleSubmit}
              loading={isPending}
              disabled={!canRate && !alreadySubmitted}
            />
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
