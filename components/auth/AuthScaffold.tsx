import { LanguageToggle } from '@/components/i18n/LanguageToggle';
import { Colors } from '@/constants/Colors';
import { router } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { ReactNode, useCallback, useEffect, useRef } from 'react';
import {
  ImageBackground,
  Keyboard,
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';

/**
 * Full-bleed brand artwork behind the auth screens. The scrim is what makes white
 * text safe anywhere on top: the artwork's lower-left is near-white on its own.
 */
export function AuthBackground({ children }: { children: ReactNode }) {
  return (
    <ImageBackground
      source={require('@/assets/images/background.jpg')}
      resizeMode="cover"
      style={{ flex: 1, backgroundColor: Colors.primary }}
    >
      <View
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFillObject,
          { backgroundColor: 'rgba(15, 23, 42, 0.45)' },
        ]}
      />
      {children}
    </ImageBackground>
  );
}

/** Back chevron + language toggle, sitting directly on the artwork. */
export function AuthHeader({
  fallback,
  onBack,
}: {
  fallback: string;
  /** Overrides navigating back — e.g. to step backwards within the screen. */
  onBack?: () => void;
}) {
  const goBack = () => {
    if (onBack) onBack();
    else if (router.canGoBack()) router.back();
    else router.replace(fallback as any);
  };

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 8,
      }}
    >
      <Pressable
        onPress={goBack}
        hitSlop={12}
        style={{
          width: 40,
          height: 40,
          borderRadius: 20,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(255, 255, 255, 0.18)',
          borderWidth: 1,
          borderColor: 'rgba(255, 255, 255, 0.28)',
        }}
      >
        <ChevronLeft size={22} color={Colors.white} strokeWidth={2} />
      </Pressable>
      <LanguageToggle />
    </View>
  );
}

/** White sheet that holds the form, rounded at the top over the artwork. */
export function AuthSheet({
  children,
  style,
}: {
  children: ReactNode;
  style?: ViewStyle;
}) {
  return (
    <View
      style={[
        {
          flex: 1,
          backgroundColor: Colors.surface,
          borderTopLeftRadius: 28,
          borderTopRightRadius: 28,
          overflow: 'hidden',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -6 },
          shadowOpacity: 0.15,
          shadowRadius: 20,
          elevation: 16,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

/** Title shown on the artwork, above the sheet. */
export const authTitleOnImage = {
  fontSize: 28,
  fontWeight: '800',
  color: Colors.white,
  textShadowColor: 'rgba(15, 23, 42, 0.35)',
  textShadowOffset: { width: 0, height: 1 },
  textShadowRadius: 8,
} as const;

/** Fields read as filled inputs on the white sheet instead of white-on-white. */
export const authFieldStyle: ViewStyle = {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 12,
  backgroundColor: Colors.background,
  borderRadius: 12,
  paddingVertical: 9,
  paddingHorizontal: 14,
  borderWidth: 1.5,
};

export const authLabelStyle: TextStyle = {
  fontSize: 12,
  fontWeight: '600',
  color: Colors.textSecondary,
  marginBottom: 7,
};

/** paddingVertical: 0 — Android pads TextInput by default, which inflates the field. */
export const authInputStyle: TextStyle = {
  flex: 1,
  fontSize: 14,
  color: Colors.textPrimary,
  paddingVertical: 0,
};

/**
 * Both platforms scroll a focused input only *just* into view, so it ends up flush
 * against the keyboard. This re-scrolls it to sit `gap` px above the keyboard.
 *
 * Spread `scrollProps` on the ScrollView, and `fieldProps(name)` on each field's
 * wrapper (a direct child of the scroll content, so its layout y is in content
 * coordinates) — it supplies both the onLayout and the input's onFocus.
 */
export function useKeyboardLift(gap = 32) {
  const scrollRef = useRef<ScrollView>(null);
  const offsetY = useRef(0);
  const viewportH = useRef(0);
  const keyboardH = useRef(0);
  const frames = useRef<Record<string, { y: number; h: number }>>({});
  const focused = useRef<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const lift = useCallback(() => {
    const frame = focused.current ? frames.current[focused.current] : undefined;
    if (!frame || !viewportH.current || !keyboardH.current) return;

    // Android resizes the window (adjustResize), so the ScrollView no longer sits
    // under the keyboard. iOS keeps its full height and the keyboard overlaps it.
    const overlap = Platform.OS === 'ios' ? keyboardH.current : 0;
    const visibleBottom = offsetY.current + viewportH.current - overlap;
    const wanted = frame.y + frame.h + gap;

    if (wanted > visibleBottom) {
      scrollRef.current?.scrollTo({
        y: offsetY.current + (wanted - visibleBottom),
        animated: true,
      });
    }
  }, [gap]);

  // Let the platform finish its own scroll/resize first, then correct for the gap.
  const scheduleLift = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(lift, 120);
  }, [lift]);

  useEffect(() => {
    const show = Keyboard.addListener('keyboardDidShow', (e) => {
      keyboardH.current = e.endCoordinates.height;
      scheduleLift();
    });
    const hide = Keyboard.addListener('keyboardDidHide', () => {
      keyboardH.current = 0;
    });
    return () => {
      show.remove();
      hide.remove();
      if (timer.current) clearTimeout(timer.current);
    };
  }, [scheduleLift]);

  const scrollProps = {
    ref: scrollRef,
    scrollEventThrottle: 16,
    onLayout: (e: LayoutChangeEvent) => {
      viewportH.current = e.nativeEvent.layout.height;
    },
    onScroll: (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      offsetY.current = e.nativeEvent.contentOffset.y;
    },
  };

  const fieldProps = (name: string) => ({
    onLayout: (e: LayoutChangeEvent) => {
      const { y, height } = e.nativeEvent.layout;
      frames.current[name] = { y, h: height };
    },
    onFocus: () => {
      focused.current = name;
      scheduleLift();
    },
  });

  return { scrollProps, fieldProps };
}
