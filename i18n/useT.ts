import { useLocaleStore } from '@/stores/useLocaleStore';
import { translations, TranslationTree } from './translations';

type DeepPath<T, P extends string = ''> = {
  [K in keyof T & string]: T[K] extends object
    ? DeepPath<T[K], `${P}${P extends '' ? '' : '.'}${K}`>
    : `${P}${P extends '' ? '' : '.'}${K}`;
}[keyof T & string];

export type TranslationKey = DeepPath<TranslationTree>;

function resolve(tree: any, path: string): string {
  return path.split('.').reduce((acc, k) => (acc == null ? acc : acc[k]), tree) ?? path;
}

function interpolate(template: string, vars?: Record<string, string | number>): string {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ''));
}

export function useT() {
  const locale = useLocaleStore((s) => s.locale);
  const tree = translations[locale];

  return (key: TranslationKey, vars?: Record<string, string | number>): string => {
    return interpolate(resolve(tree, key), vars);
  };
}

export function useLocale() {
  return useLocaleStore((s) => s.locale);
}
