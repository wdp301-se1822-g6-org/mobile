export const Colors = {
  primary: '#2563EB',
  primaryLight: '#EFF6FF',
  primaryMid: '#BFDBFE',

  success: '#16A34A',
  warning: '#F59E0B',
  danger: '#EF4444',

  white: '#FFFFFF',
  background: '#F8FAFC',
  surface: '#FFFFFF',
  border: '#E2E8F0',

  textPrimary: '#0F172A',
  textSecondary: '#64748B',
  textDisabled: '#CBD5E1',

  bronze: '#CD7F32',
  silver: '#9CA3AF',
  gold: '#F59E0B',
  goldLight: '#FEF6E0',
  platinum: '#6366F1',
} as const;

export type ColorKey = keyof typeof Colors;
