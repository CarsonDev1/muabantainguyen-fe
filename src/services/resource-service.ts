// src/services/resource-service.ts
import api from '@/lib/api';

export interface ResourceItem {
  id: string;
  order_item_id: string;
  data: string; // Secret data (account, key, etc.)
  expires_at: string;
  order_id: string;
  created_at: string;
}

export interface ResourcesResponse {
  message: string;
  items: ResourceItem[];
}

const resourceService = {
  async getResources(params?: { page?: number; pageSize?: number }): Promise<ResourcesResponse> {
    const res = await api.get('/resources', { params });
    return res.data;
  },
};

export default resourceService;