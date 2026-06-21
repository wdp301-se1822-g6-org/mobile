import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { Locale } from '@/i18n/translations';

type LocaleState = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
};

export const useLocaleStore = create<LocaleState>()(
  persist(
    (set) => ({
      locale: 'vi',
      setLocale: (locale) => set({ locale }),
    }),
    {
      name: 'locale-storage',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
