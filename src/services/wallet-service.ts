import api from '@/lib/api';

export interface Wallet {
  id: string;
  balance: number;
  total_deposited: number;
  total_spent: number;
  created_at: string;
  updated_at: string;
}

export interface WalletStats {
  balance: number;
  total_deposits: number;
  total_purchases: number;
  total_refunds: number;
  deposit_count: number;
  purchase_count: number;
}

export interface WalletInfoResponse {
  success: boolean;
  message?: string;
  wallet: Wallet;
  stats: WalletStats;
}

export interface CreateDepositRequest {
  amount: number;
  paymentMethod?: 'sepay' | 'momo' | 'bank_transfer' | string;
}

export interface CreateDepositResponse {
  success: boolean;
  message?: string;
  requestId: string;
  amount: number;
  paymentCode: string;
  paymentMethod: string;
  expiresAt: string;
  instructions?: {
    amount: number;
    code: string;
    method: string;
    bankAccount?: string;
    bankName?: string;
    accountNumber?: string;
    accountName?: string;
    qrUrl?: string;
    note?: string;
  };
}

export interface CheckDepositResponse {
  success: boolean;
  message?: string;
  deposit: {
    id: string;
    amount: number;
    paymentCode: string;
    status: 'pending' | 'completed' | 'expired' | 'cancelled';
    paymentMethod: string;
    expiresAt: string;
    completedAt?: string | null;
    createdAt: string;
    isExpired: boolean;
  };
}

export type DepositStatus = 'pending' | 'completed' | 'expired' | 'cancelled';

export interface DepositItem {
  id: string;
  amount: number;
  paymentCode: string;
  status: DepositStatus;
  paymentMethod: string;
  expiresAt: string;
  completedAt?: string | null;
  createdAt: string;
}

export interface GetDepositsParams {
  page?: number;
  pageSize?: number;
  status?: DepositStatus;
}

export interface GetDepositsResponse {
  success: boolean;
  message?: string;
  items: DepositItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages?: number;
}

export type TransactionType = 'deposit' | 'withdraw' | 'purchase' | 'refund';

export interface TransactionItem {
  id: string;
  wallet_id?: string;
  user_id?: string;
  type: TransactionType;
  amount: number;
  balance_before?: number;
  balance_after?: number;
  description?: string;
  reference_type?: string | null;
  reference_id?: string | null;
  provider?: string | null;
  provider_tx_id?: string | null;
  created_at: string;
}

export interface GetTransactionsParams {
  page?: number;
  pageSize?: number;
  type?: TransactionType;
  startDate?: string; // ISO date
  endDate?: string;   // ISO date
}

export interface GetTransactionsResponse {
  success: boolean;
  message?: string;
  items: TransactionItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages?: number;
}

export interface PayWithWalletRequest {
  amount: number;
  description: string;
  referenceType?: 'order' | 'payment' | string;
  referenceId?: string;
}

export interface PayWithWalletResponse {
  success: boolean;
  message?: string;
  transactionId?: string;
}

export interface AdminAdjustRequest {
  userId: string;
  amount: number;
  description?: string;
}

export interface AdminAdjustResponse {
  success: boolean;
  message?: string;
  wallet: Wallet;
}

export interface AdminRefundRequest {
  userId: string;
  amount: number;
  description?: string;
  referenceType?: string;
  referenceId?: string;
}

export interface AdminRefundResponse {
  success: boolean;
  message?: string;
  wallet: Wallet;
}

export const walletService = {
  getWallet: async (): Promise<WalletInfoResponse> => {
    const response = await api.get('/wallet');
    return response.data;
  },
  createDeposit: async (data: CreateDepositRequest): Promise<CreateDepositResponse> => {
    const response = await api.post('/wallet/deposit', data);
    return response.data;
  },
  getDeposits: async (params?: GetDepositsParams): Promise<GetDepositsResponse> => {
    const response = await api.get('/wallet/deposits', { params });
    return response.data;
  },
  getTransactions: async (params?: GetTransactionsParams): Promise<GetTransactionsResponse> => {
    const response = await api.get('/wallet/transactions', { params });
    return response.data;
  },
  payWithWallet: async (data: PayWithWalletRequest): Promise<PayWithWalletResponse> => {
    const response = await api.post('/wallet/pay', data);
    return response.data;
  },
  checkDeposit: async (id: string): Promise<CheckDepositResponse> => {
    const response = await api.get(`/wallet/deposit/${id}`);
    return response.data;
  },
  adminGetWallet: async (userId: string): Promise<WalletInfoResponse> => {
    const response = await api.get(`/wallet/admin/${userId}`);
    return response.data;
  },
  adminAdjust: async (data: AdminAdjustRequest): Promise<AdminAdjustResponse> => {
    const response = await api.post('/wallet/admin/adjust', data);
    return response.data;
  },
  adminRefund: async (data: AdminRefundRequest): Promise<AdminRefundResponse> => {
    const response = await api.post('/wallet/admin/refund', data);
    return response.data;
  },
};

export const { getWallet, createDeposit, getDeposits, getTransactions, payWithWallet, checkDeposit, adminGetWallet, adminAdjust, adminRefund } = walletService;

export default walletService;


