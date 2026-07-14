import type { TranslationKey } from '@/i18n/useT';

type Translate = (key: TranslationKey, vars?: Record<string, string | number>) => string;

/** Reason codes the API sends verbatim; anything else is treated as free text. */
const REASON_KEY: Record<string, TranslationKey> = {
  customer_cancelled:   'bookingDetail.reasonByCustomer',
  cancelled_by_customer:'bookingDetail.reasonByCustomer',
  user_cancelled:       'bookingDetail.reasonByCustomer',
  staff_cancelled:      'bookingDetail.reasonByStore',
  cancelled_by_staff:   'bookingDetail.reasonByStore',
  store_cancelled:      'bookingDetail.reasonByStore',
  admin_cancelled:      'bookingDetail.reasonByStore',
  payment_timeout:      'bookingDetail.reasonPaymentExpired',
  payment_expired:      'bookingDetail.reasonPaymentExpired',
  unpaid_timeout:       'bookingDetail.reasonPaymentExpired',
  system_cancelled:     'bookingDetail.reasonBySystem',
  auto_cancelled:       'bookingDetail.reasonBySystem',
};

/** No-show orders get their own explanation, so these codes add nothing. */
const NO_SHOW_CODES = new Set([
  'no_show',
  'auto_no_show',
  'customer_no_show',
  'no_show_timeout',
]);

/**
 * Turns a raw `cancelReason` into something a customer can read.
 * Returns null when the reason only restates the no-show status.
 */
export function describeCancelReason(reason: string | undefined, t: Translate): string | null {
  const raw = reason?.trim();
  if (!raw) return null;

  const code = raw.toLowerCase().replace(/[\s-]+/g, '_');
  if (NO_SHOW_CODES.has(code)) return null;

  const key = REASON_KEY[code];
  return key ? t(key) : raw;
}
