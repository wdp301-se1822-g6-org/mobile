import { API } from '@/constants/endpoints';
import { Voucher, VoucherStatus } from '@/types/voucher';
import { axiosInstance } from './api';

export const voucherService = {
  getVouchers: (status?: VoucherStatus) =>
    axiosInstance.get<Voucher[]>(API.me.vouchers, { params: status ? { status } : undefined }).then((r) => r.data),

  getVoucher: (id: string) =>
    axiosInstance.get<Voucher>(API.me.voucher(id)).then((r) => r.data),
};
