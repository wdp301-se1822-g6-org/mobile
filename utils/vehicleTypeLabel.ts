import type { TranslationKey } from '@/i18n/useT';

type Translate = (key: TranslationKey, vars?: Record<string, string | number>) => string;

const normalize = (name: string): string =>
  name.trim().toLowerCase().replace(/[\s_-]+/g, ' ');

export function localizedVehicleTypeName(name: string, t: Translate): string {
  const type = normalize(name);

  if (['car', 'automobile', 'oto', 'ô tô', 'xe ô tô'].includes(type)) {
    return t('vehicle.typeCar');
  }

  if (['motorbike', 'motorcycle', 'motor cycle', 'bike', 'xe máy'].includes(type)) {
    return t('vehicle.typeMotorbike');
  }

  return name;
}
