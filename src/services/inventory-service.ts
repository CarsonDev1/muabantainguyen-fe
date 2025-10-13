import api from '@/lib/api';

export interface InventoryItem {
  id: string;
  product_id: string;
  product_name?: string;
  secret_data: string;
  account_expires_at?: string;
  status: 'available' | 'sold' | 'expired';
  cost_price?: number;
  source?: string;
  notes?: string;
  created_at: string;
  updated_at?: string;
}

export interface InventoryStats {
  total_items: number;
  available_items: number;
  sold_items: number;
  expired_items: number;
  expiring_soon: number;
  total_value: number;
  products_with_inventory: number;
}

export interface BulkInventoryItem {
  secretData: string;
  notes?: string;
  accountExpiresAt?: string;
  costPrice?: number;
}

export interface CreateInventoryItemRequest {
  productId: string;
  secretData: string;
  notes?: string;
  accountExpiresAt?: string;
  costPrice?: number;
  source?: string;
}

export interface BulkInventoryRequest {
  productId: string;
  items: BulkInventoryItem[];
  itemsText?: string;
}

export interface InventoryListResponse {
  success: boolean;
  items: InventoryItem[];
  count: number;
}

export interface InventoryStatsResponse {
  success: boolean;
  stats: InventoryStats;
}

export interface InventoryResponse {
  success: boolean;
  message: string;
  item?: InventoryItem;
  count?: number;
  items?: InventoryItem[];
}

class InventoryService {
  // Get inventory statistics
  async getInventoryStats(): Promise<InventoryStatsResponse> {
    const response = await api.get('/admin/inventory/stats');
    return response.data;
  }

  // Get inventory items expiring soon
  async getExpiringInventory(days: number = 7): Promise<InventoryResponse> {
    const response = await api.get('/admin/inventory/expiring', {
      params: { days }
    });
    return response.data;
  }

  // Get inventory for a specific product
  async getProductInventory(
    productId: string,
    options: {
      showSold?: boolean;
      showExpired?: boolean;
      limit?: number;
      offset?: number;
    } = {}
  ): Promise<InventoryListResponse> {
    const response = await api.get(`/admin/inventory/${productId}`, {
      params: options
    });
    return response.data;
  }

  // Add single inventory item
  async addInventoryItem(item: CreateInventoryItemRequest): Promise<InventoryResponse> {
    const response = await api.post('/admin/inventory', item);
    return response.data;
  }

  // Bulk add inventory items
  async bulkAddInventoryItems(request: BulkInventoryRequest): Promise<InventoryResponse> {
    const response = await api.post('/admin/inventory/bulk', request);
    return response.data;
  }

  // Delete inventory item
  async deleteInventoryItem(itemId: string): Promise<InventoryResponse> {
    const response = await api.delete(`/admin/inventory/${itemId}`);
    return response.data;
  }

  // Sync all product stocks
  async syncAllStocks(): Promise<InventoryResponse> {
    const response = await api.post('/admin/inventory/sync-stock');
    return response.data;
  }
}

export const inventoryService = new InventoryService();
