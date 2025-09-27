import api from '@/lib/api';

export interface Promotion {
  id: string;
  name: string;
  description: string;
  type: 'percentage' | 'fixed';
  value: number;
  minOrderAmount?: number;
  maxDiscountAmount?: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  usageLimit?: number;
  usageCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePromotionData {
  name: string;
  description?: string;
  type: 'percentage' | 'fixed';
  value: number;
  minOrderAmount?: number;
  maxDiscountAmount?: number;
  startDate: string;
  endDate: string;
  isActive?: boolean;
  usageLimit?: number;
}

export interface UpdatePromotionData {
  name?: string;
  description?: string;
  type?: 'percentage' | 'fixed';
  value?: number;
  minOrderAmount?: number;
  maxDiscountAmount?: number;
  startDate?: string;
  endDate?: string;
  isActive?: boolean;
  usageLimit?: number;
}

// Admin Promotion Management
export const getAdminPromotions = async (): Promise<{ success: boolean; message: string; promotions: Promotion[] }> => {
  const response = await api.get('/admin/promotions');
  return response.data;
};

export const createPromotion = async (data: CreatePromotionData): Promise<{ success: boolean; message: string }> => {
  const response = await api.post('/admin/promotions', data);
  return response.data;
};

export const updatePromotion = async (id: string, data: UpdatePromotionData): Promise<{ success: boolean; message: string }> => {
  const response = await api.put(`/admin/promotions/${id}`, data);
  return response.data;
};

export const deletePromotion = async (id: string): Promise<{ success: boolean; message: string }> => {
  const response = await api.delete(`/admin/promotions/${id}`);
  return response.data;
};

// Public Promotions
export const getActivePromotions = async (): Promise<{ success: boolean; message: string; promotions: Promotion[] }> => {
  const response = await api.get('/public/promotions');
  return response.data;
};

export const validatePromotion = async (code: string, amount: number): Promise<{
  success: boolean;
  message: string;
  discountAmount: number;
  promotion?: Promotion;
}> => {
  const response = await api.post('/promotions/validate', { code, amount });
  return response.data;
};
