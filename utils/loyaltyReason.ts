import type { TranslationKey } from '@/i18n/useT';
import type { LoyaltyTransaction } from '@/types/loyalty';

type Translate = (key: TranslationKey, vars?: Record<string, string | number>) => string;

export type LoyaltyTxnKind =
  | 'earn'
  | 'redeem'
  | 'tier'
  | 'expire'
  | 'refund'
  | 'adjust'
  | 'deduct'
  | 'neutral';

/** Codes seen in `type` / `reason`. */
const KIND_BY_CODE: Record<string, LoyaltyTxnKind> = {
  earn:             'earn',
  earned:           'earn',
  earn_points:      'earn',
  points_earned:    'earn',
  accrual:          'earn',
  purchase:         'earn',
  bonus:            'earn',
  order_completed:  'earn',
  order_complete:   'earn',
  wash_completed:   'earn',

  redeem:           'redeem',
  redeemed:         'redeem',
  redeem_points:    'redeem',
  points_redeemed:  'redeem',
  spend:            'redeem',
  voucher:          'redeem',
  voucher_issued:   'redeem',
  voucher_redeemed: 'redeem',

  tier_up:          'tier',
  tier_down:        'tier',
  tier_change:      'tier',
  tier_changed:     'tier',
  tier_upgrade:     'tier',
  tier_downgrade:   'tier',
  upgrade:          'tier',
  downgrade:        'tier',

  expire:           'expire',
  expired:          'expire',
  expiry:           'expire',
  points_expired:   'expire',
  annual_reset:     'expire',
  reset:            'expire',

  refund:           'refund',
  refunded:         'refund',
  reversal:         'refund',
  reverted:         'refund',
  cancelled:        'refund',
  order_cancelled:  'refund',
  order_canceled:   'refund',

  adjust:           'adjust',
  adjusted:         'adjust',
  adjustment:       'adjust',
  correction:       'adjust',
  manual_adjustment:'adjust',
  admin_adjustment: 'adjust',
};

/** `annual_reset` shares the expire styling but needs its own wording. */
const RESET_CODES = new Set(['annual_reset', 'reset']);

export type LoyaltyTxnDescription = {
  kind: LoyaltyTxnKind;
  title: string;
  /** Reserved for localized customer-facing context. */
  note: string | null;
};

const normalize = (value?: string | null): string =>
  (value ?? '').trim().toLowerCase().replace(/[\s-]+/g, '_');

function resolveKind(txn: LoyaltyTransaction): LoyaltyTxnKind {
  const code = normalize(txn.type);
  if (RESET_CODES.has(code)) return 'expire';

  const byType = KIND_BY_CODE[code];
  if (byType) return byType;

  const reasonCode = normalize(txn.reason);
  if (RESET_CODES.has(reasonCode)) return 'expire';

  const byReason = KIND_BY_CODE[reasonCode];
  if (byReason) return byReason;

  if (txn.previousTierConfigId && txn.newTierConfigId) return 'tier';
  if (txn.pointsDelta > 0) return 'earn';
  if (txn.pointsDelta < 0) return 'deduct';
  return 'neutral';
}

function resolveTitleKey(kind: LoyaltyTxnKind, txn: LoyaltyTransaction): TranslationKey {
  const isReset = RESET_CODES.has(normalize(txn.type)) || RESET_CODES.has(normalize(txn.reason));

  switch (kind) {
    case 'earn':    return txn.orderId ? 'loyalty.txnEarnOrder' : 'loyalty.txnEarn';
    case 'redeem':  return txn.voucherId ? 'loyalty.txnRedeemVoucher' : 'loyalty.txnRedeem';
    case 'tier':    return 'loyalty.txnTier';
    case 'expire':  return isReset ? 'loyalty.txnReset' : 'loyalty.txnExpire';
    case 'refund':  return 'loyalty.txnRefund';
    case 'adjust':  return 'loyalty.txnAdjust';
    case 'deduct':  return 'loyalty.txnDeduct';
    default:        return 'loyalty.txnNeutral';
  }
}

/** Turns a raw transaction into customer-facing text in the selected app language. */
export function describeLoyaltyTransaction(txn: LoyaltyTransaction, t: Translate): LoyaltyTxnDescription {
  const kind = resolveKind(txn);

  return {
    kind,
    title: t(resolveTitleKey(kind, txn)),
    // API reasons are server-generated English text. Do not leak them into localized UI.
    note: null,
  };
}
