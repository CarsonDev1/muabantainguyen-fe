import api from "@/lib/api";


export interface FAQ {
  id: number;
  question: string;
  answer: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateFAQData {
  question: string;
  answer: string;
  is_active?: boolean;
}

export interface UpdateFAQData {
  question?: string;
  answer?: string;
  is_active?: boolean;
}

// Admin FAQ Management
export const getAdminFAQs = async (): Promise<{ success: boolean; message: string; faqs: FAQ[] }> => {
  const response = await api.get('/public/faqs');
  return response.data;
};

export const createFAQ = async (data: CreateFAQData): Promise<{ success: boolean; message: string }> => {
  const response = await api.post('/admin/faqs', data);
  return response.data;
};

export const updateFAQ = async (id: number, data: UpdateFAQData): Promise<{ success: boolean; message: string }> => {
  const response = await api.put(`/admin/faqs/${id}`, data);
  return response.data;
};

export const deleteFAQ = async (id: number): Promise<{ success: boolean; message: string }> => {
  const response = await api.delete(`/admin/faqs/${id}`);
  return response.data;
};

// Public FAQ
export const getPublicFAQs = async (): Promise<FAQ[]> => {
  const response = await api.get('/public/faqs');
  return response.data.faqs;
};
