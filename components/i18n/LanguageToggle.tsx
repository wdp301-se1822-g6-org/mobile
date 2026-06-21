import { Colors } from '@/constants/Colors';
import { LOCALES } from '@/i18n/translations';
import { useLocaleStore } from '@/stores/useLocaleStore';
import { Pressable, Text, View } from 'react-native';

/**
 * Segmented control showing every supported locale. The current one is highlighted.
 * Designed to sit inline at the top-right of a screen — wrap in a header row with
 * `alignItems: 'flex-end'`. Use `<LanguageToggleBar />` for a ready-made header row.
 */
export function LanguageToggle() {
  const { locale, setLocale } = useLocaleStore();

  return (
    <View
      style={{
        flexDirection: 'row',
        backgroundColor: Colors.surface,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: Colors.border,
        padding: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
        elevation: 1,
      }}
    >
      {LOCALES.map((l) => {
        const active = locale === l.code;
        return (
          <Pressable
            key={l.code}
            onPress={() => setLocale(l.code)}
            hitSlop={4}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 5,
              paddingHorizontal: 10,
              paddingVertical: 5,
              borderRadius: 999,
              backgroundColor: active ? Colors.primary : 'transparent',
            }}
          >
            <Text style={{ fontSize: 13 }}>{l.flag}</Text>
            <Text
              style={{
                fontSize: 11,
                fontWeight: '800',
                color: active ? Colors.white : Colors.textSecondary,
                letterSpacing: 0.5,
              }}
            >
              {l.code.toUpperCase()}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

/** Header row positioning the toggle to the top-right with proper padding. */
export function LanguageToggleBar() {
  return (
    <View
      style={{
        alignItems: 'flex-end',
        paddingHorizontal: 16,
        paddingTop: 8,
        paddingBottom: 4,
      }}
    >
      <LanguageToggle />
    </View>
  );
}
