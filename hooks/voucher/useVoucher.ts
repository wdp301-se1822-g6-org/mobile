import { voucherService } from '@/services/voucher.service';
import { VoucherStatus } from '@/types/voucher';
import { useQuery } from '@tanstack/react-query';

export function useVouchers(status?: VoucherStatus) {
  return useQuery({
    queryKey: ['vouchers', status],
    queryFn: () => voucherService.getVouchers(status),
  });
}
