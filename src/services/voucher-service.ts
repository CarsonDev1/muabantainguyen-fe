import api from '@/lib/api';

export interface Voucher {
  id: string;
  code: string;
  description: string;
  discount_percent: number;
  discount_amount: number;
  max_uses: number;
  used_count: number;
  valid_from: string;
  valid_to: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateVoucherRequest {
  code: string;
  description: string;
  discount_percent: number;
  discount_amount: number;
  max_uses: number;
  valid_from: string;
  valid_to: string;
  is_active: boolean;
}

export interface UpdateVoucherRequest {
  code?: string;
  description?: string;
  discount_percent?: number;
  discount_amount?: number;
  max_uses?: number;
  valid_from?: string;
  valid_to?: string;
  is_active?: boolean;
}

export interface VouchersResponse {
  vouchers: Voucher[];
  pagination?: {
    total: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
  };
}

export interface ApplyVoucherRequest {
  code: string;
  amount: number;
}

export interface ApplyVoucherResponse {
  message: string;
  discountedAmount: number;
  discount?: number;
}

export const voucherService = {
  async getVouchers(): Promise<VouchersResponse> {
    const response = await api.get('/admin/vouchers');
    return response.data;
  },

  async createVoucher(data: CreateVoucherRequest): Promise<Voucher> {
    const response = await api.post('/admin/vouchers', data);
    return response.data;
  },

  async updateVoucher(id: string, data: UpdateVoucherRequest): Promise<Voucher> {
    const response = await api.put(`/admin/vouchers/${id}`, data);
    return response.data;
  },

  async applyVoucher(data: ApplyVoucherRequest): Promise<ApplyVoucherResponse> {
    const response = await api.post('/vouchers/apply', data);
    return response.data;
  },

  async deleteVoucher(id: string): Promise<void> {
    await api.delete(`/admin/vouchers/${id}`);
  },
};
