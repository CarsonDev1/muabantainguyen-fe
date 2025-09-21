import api from '@/lib/api';

export interface OrderItem {
  id: string;
  product_id: string;
  product_name: string;
  product_image?: string;
  quantity: number;
  price: number;
  total_price: number;
}

export interface Order {
  id: string;
  order_number: string;
  user_id: string;
  items: OrderItem[];
  total_amount: number;
  status: 'pending' | 'paid' | 'completed' | 'cancelled' | 'refunded';
  payment_method: 'wallet' | 'sepay' | 'momo';
  payment_status: 'pending' | 'completed' | 'failed';
  created_at: string;
  updated_at: string;
}

export interface CreateOrderData {
  items: Array<{
    productId: string;
    quantity: number;
  }>;
  paymentMethod: 'wallet' | 'sepay' | 'momo';
}

export const getOrders = async (page: number = 1, pageSize: number = 10): Promise<{
  orders: Order[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}> => {
  const response = await api.get(`/orders?page=${page}&pageSize=${pageSize}`);
  return response.data;
};

export const getOrderById = async (id: string): Promise<Order> => {
  const response = await api.get(`/orders/${id}`);
  return response.data.order;
};

export const createOrder = async (data: CreateOrderData): Promise<{ success: boolean; message: string; order: Order }> => {
  const response = await api.post('/orders', data);
  return response.data;
};

export const cancelOrder = async (id: string): Promise<{ success: boolean; message: string }> => {
  const response = await api.put(`/orders/${id}/cancel`);
  return response.data;
};
