export type VoucherStatus = 'unused' | 'used' | 'expired' | 'revoked';

export type Voucher = {
  id: string;
  customerId: string;
  code: string;
  discountCapVnd: number;
  status: VoucherStatus;
  expiresAt: string;
  usedAt?: string;
  createdAt: string;
};
