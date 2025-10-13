// src/services/order-service.ts
import api from '@/lib/api';

export interface OrderItem {
  id: string;
  product_id: string;
  name: string;
  price: string | number;
  quantity: number;
  created_at?: string;
}

export interface Order {
  id: string;
  user_id: string;
  status: 'pending' | 'paid' | 'refunded';
  total_amount: string | number;
  payment_method: string;
  created_at: string;
  updated_at: string;
  voucherCode: string;
}

export interface OrderDetail extends Order {
  items: OrderItem[];
  voucherCode: any;
  wallet_transaction?: {
    id: string;
    amount: number;
    created_at: string;
    status: string;
    description: string;
  };
}

export interface OrderStats {
  total_orders: number;
  pending_orders: number;
  paid_orders: number;
  refunded_orders: number;
  total_spent: number;
  wallet_payments: number;
  external_payments: number;
}

export interface OrdersListResponse {
  success: boolean;
  message: string;
  items: Order[];
  page?: number;
  pageSize?: number;
  total?: number;
  totalPages?: number;
}

export interface OrderDetailResponse {
  success: boolean;
  message: string;
  order: OrderDetail;
}

export interface OrderStatsResponse {
  success: boolean;
  message: string;
  stats: OrderStats;
}

const orderService = {
  // List orders
  async getOrders(params?: { page?: number; pageSize?: number }): Promise<OrdersListResponse> {
    const res = await api.get('/orders', { params });
    return res.data;
  },

  // Get order detail (enhanced)
  async getOrderById(orderId: string): Promise<OrderDetailResponse> {
    const res = await api.get(`/orders/${orderId}`);
    return res.data;
  },

  // Get order statistics
  async getOrderStats(): Promise<OrderStatsResponse> {
    const res = await api.get('/orders/stats');
    return res.data;
  },

  // Enhanced checkout
  async enhancedCheckout(data: {
    paymentMethod?: 'wallet' | 'sepay' | 'momo';
    useWallet?: boolean;
    voucherCode?: any;
  }): Promise<any> {
    const res = await api.post('/orders/checkout', data);
    return res.data;
  },
};

export default orderService;